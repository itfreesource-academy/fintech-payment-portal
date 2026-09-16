import crypto from 'crypto';
import { Wallet, Transaction, DoubleEntryRecord, CurrencyCode } from '../types/index.js';
import { screenTransactionForAml } from './amlService.js';
import { evaluateFraudRisk } from './fraudService.js';
import { publishToKafka } from './kafkaBroker.js';
import { dispatchWebhookEvent } from './webhookService.js';

// In-memory data store
const wallets: Map<string, Wallet> = new Map();
const transactions: Map<string, Transaction> = new Map();
const doubleEntryLedger: DoubleEntryRecord[] = [];

// Idempotency cache: key -> cached response object
const idempotencyCache: Map<string, { statusCode: number; body: any; timestamp: number }> = new Map();

// Canonical FX Rates against USD baseline
export const FX_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 0.0116,  // ~86 INR / USD
  AED: 0.2723,  // 3.67 AED / USD
  AUD: 0.6550,
  EUR: 1.0850
};

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const amountInUsd = amount * FX_RATES_TO_USD[from];
  return Number((amountInUsd / FX_RATES_TO_USD[to]).toFixed(2));
}

// Seed initial multi-currency wallets for Vikram Sharma (Retail Customer) & Julian Sterling (HNI Customer)
const seedWallets: Wallet[] = [
  {
    id: 'wlt_vikram_inr',
    userId: 'usr_retail_01',
    currency: 'INR',
    balance: 150000.0,
    availableBalance: 150000.0,
    holdBalance: 0.0,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt_vikram_usd',
    userId: 'usr_retail_01',
    currency: 'USD',
    balance: 2500.0,
    availableBalance: 2500.0,
    holdBalance: 0.0,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt_julian_aed',
    userId: 'usr_hni_01',
    currency: 'AED',
    balance: 850000.0,
    availableBalance: 850000.0,
    holdBalance: 0.0,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt_julian_inr',
    userId: 'usr_hni_01',
    currency: 'INR',
    balance: 12000000.0,
    availableBalance: 12000000.0,
    holdBalance: 0.0,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wlt_merchant_inr',
    userId: 'usr_merchant_01',
    currency: 'INR',
    balance: 500000.0,
    availableBalance: 500000.0,
    holdBalance: 0.0,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  }
];

for (const w of seedWallets) {
  wallets.set(w.id, w);
}

/**
 * Execute an idempotent financial payment/transfer with AML screening and Fraud risk scoring
 */
export async function executeTransfer(params: {
  idempotencyKey: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  senderWalletId: string;
  recipientWalletId: string;
  amount: number;
  currency: CurrencyCode;
  channel: 'CASH' | 'WIRE' | 'UPI' | 'INTERNAL';
  panNumberProvided?: string;
  hasVerifiedPan: boolean;
  isCrossBorder?: boolean;
  ipAddress?: string;
  currentGeo?: { lat: number; lng: number; city: string };
  isVpnOrProxy?: boolean;
  userAgent?: string;
}): Promise<{ transaction: Transaction; isIdempotentReplay: boolean }> {
  // 1. Strict Financial Idempotency Check
  if (params.idempotencyKey && idempotencyCache.has(params.idempotencyKey)) {
    const cached = idempotencyCache.get(params.idempotencyKey)!;
    return {
      transaction: cached.body.transaction,
      isIdempotentReplay: true
    };
  }

  // 2. Validate Wallets
  const senderWallet = wallets.get(params.senderWalletId);
  const recipientWallet = wallets.get(params.recipientWalletId);

  if (!senderWallet) {
    throw new Error(`Sender wallet '${params.senderWalletId}' not found`);
  }
  if (!recipientWallet) {
    throw new Error(`Recipient wallet '${params.recipientWalletId}' not found`);
  }
  if (senderWallet.status !== 'ACTIVE') {
    throw new Error(`Sender wallet is ${senderWallet.status}`);
  }
  if (senderWallet.availableBalance < params.amount) {
    throw new Error(`Insufficient funds: Available balance is ${senderWallet.currency} ${senderWallet.availableBalance}`);
  }

  const txnId = `txn_${crypto.randomUUID()}`;

  // 3. Multi-Jurisdiction AML Screening (Non-US: FIU-IND ₹50k PAN mandate, CBUAE AED 55k, AUSTRAC AUD 10k)
  const amlResult = await screenTransactionForAml({
    userId: params.senderId,
    userName: params.senderName,
    transactionId: txnId,
    amount: params.amount,
    currency: params.currency,
    channel: params.channel,
    hasVerifiedPan: params.hasVerifiedPan,
    panNumber: params.panNumberProvided,
    isCrossBorder: params.isCrossBorder
  });

  if (amlResult.blocked) {
    const rejectedTxn: Transaction = {
      id: txnId,
      idempotencyKey: params.idempotencyKey,
      senderId: params.senderId,
      senderName: params.senderName,
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      senderWalletId: params.senderWalletId,
      recipientWalletId: params.recipientWalletId,
      amount: params.amount,
      currency: params.currency,
      exchangeRate: 1.0,
      channel: params.channel,
      panNumberProvided: params.panNumberProvided,
      hasVerifiedPan: params.hasVerifiedPan,
      status: 'REJECTED',
      failureReason: amlResult.alerts[0]?.details || 'Transaction blocked by statutory AML compliance mandate',
      createdAt: new Date().toISOString()
    };
    transactions.set(txnId, rejectedTxn);

    // Cache idempotency response
    if (params.idempotencyKey) {
      idempotencyCache.set(params.idempotencyKey, {
        statusCode: 400,
        body: { transaction: rejectedTxn },
        timestamp: Date.now()
      });
    }

    throw new Error(`AML Violation: ${rejectedTxn.failureReason}`);
  }

  // 4. Real-time Fraud Risk Evaluation
  const fraudEval = await evaluateFraudRisk({
    userId: params.senderId,
    transactionId: txnId,
    amount: params.amount,
    currency: params.currency,
    ipAddress: params.ipAddress,
    currentGeo: params.currentGeo,
    isVpnOrProxy: params.isVpnOrProxy,
    userAgent: params.userAgent
  });

  if (fraudEval.decision === 'REJECT' || fraudEval.decision === 'FREEZE_ACCOUNT') {
    if (fraudEval.decision === 'FREEZE_ACCOUNT') {
      senderWallet.status = 'FROZEN';
    }

    const heldTxn: Transaction = {
      id: txnId,
      idempotencyKey: params.idempotencyKey,
      senderId: params.senderId,
      senderName: params.senderName,
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      senderWalletId: params.senderWalletId,
      recipientWalletId: params.recipientWalletId,
      amount: params.amount,
      currency: params.currency,
      exchangeRate: 1.0,
      channel: params.channel,
      hasVerifiedPan: params.hasVerifiedPan,
      status: 'HELD_FRAUD',
      failureReason: `Transaction blocked by Fraud Engine: Score ${fraudEval.totalRiskScore}/100. Reasons: ${fraudEval.reasons.join(', ')}`,
      createdAt: new Date().toISOString()
    };
    transactions.set(txnId, heldTxn);

    if (params.idempotencyKey) {
      idempotencyCache.set(params.idempotencyKey, {
        statusCode: 403,
        body: { transaction: heldTxn },
        timestamp: Date.now()
      });
    }

    throw new Error(heldTxn.failureReason);
  }

  // 5. FX Conversion Calculation
  const exchangeRate =
    senderWallet.currency === recipientWallet.currency
      ? 1.0
      : Number((FX_RATES_TO_USD[senderWallet.currency] / FX_RATES_TO_USD[recipientWallet.currency]).toFixed(4));
  const creditAmount = Number((params.amount * exchangeRate).toFixed(2));

  // 6. Double-Entry Ledger Posting
  senderWallet.balance -= params.amount;
  senderWallet.availableBalance -= params.amount;
  senderWallet.updatedAt = new Date().toISOString();

  recipientWallet.balance += creditAmount;
  recipientWallet.availableBalance += creditAmount;
  recipientWallet.updatedAt = new Date().toISOString();

  const debitRecord: DoubleEntryRecord = {
    id: `dr_${crypto.randomUUID()}`,
    transactionId: txnId,
    entryType: 'DEBIT',
    account: senderWallet.id,
    amount: params.amount,
    currency: senderWallet.currency,
    timestamp: new Date().toISOString()
  };

  const creditRecord: DoubleEntryRecord = {
    id: `cr_${crypto.randomUUID()}`,
    transactionId: txnId,
    entryType: 'CREDIT',
    account: recipientWallet.id,
    amount: creditAmount,
    currency: recipientWallet.currency,
    timestamp: new Date().toISOString()
  };

  doubleEntryLedger.push(debitRecord, creditRecord);

  // 7. Settle Transaction
  const settledTxn: Transaction = {
    id: txnId,
    idempotencyKey: params.idempotencyKey,
    senderId: params.senderId,
    senderName: params.senderName,
    recipientId: params.recipientId,
    recipientName: params.recipientName,
    senderWalletId: params.senderWalletId,
    recipientWalletId: params.recipientWalletId,
    amount: params.amount,
    currency: params.currency,
    exchangeRate,
    channel: params.channel,
    panNumberProvided: params.panNumberProvided,
    hasVerifiedPan: params.hasVerifiedPan,
    status: 'SETTLED',
    createdAt: new Date().toISOString(),
    settledAt: new Date().toISOString()
  };

  transactions.set(txnId, settledTxn);

  // Cache for financial idempotency replay
  if (params.idempotencyKey) {
    idempotencyCache.set(params.idempotencyKey, {
      statusCode: 200,
      body: { transaction: settledTxn },
      timestamp: Date.now()
    });
  }

  // 8. Publish to Kafka & Webhook
  publishToKafka('ledger.settlements', settledTxn.id, {
    transactionId: settledTxn.id,
    idempotencyKey: settledTxn.idempotencyKey,
    senderId: settledTxn.senderId,
    recipientId: settledTxn.recipientId,
    amount: settledTxn.amount,
    currency: settledTxn.currency,
    status: settledTxn.status
  });

  await dispatchWebhookEvent('ledger.settled', {
    transactionId: settledTxn.id,
    amount: settledTxn.amount,
    currency: settledTxn.currency,
    sender: settledTxn.senderName,
    recipient: settledTxn.recipientName
  });

  return { transaction: settledTxn, isIdempotentReplay: false };
}

export function getWalletsByUserId(userId: string): Wallet[] {
  return Array.from(wallets.values()).filter(w => w.userId === userId);
}

export function getAllWallets(): Wallet[] {
  return Array.from(wallets.values());
}

export function getAllTransactions(): Transaction[] {
  return Array.from(transactions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDoubleEntryLedger(limit: number = 100): DoubleEntryRecord[] {
  return doubleEntryLedger.slice(-limit).reverse();
}
