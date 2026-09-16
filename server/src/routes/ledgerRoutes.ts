import { Router, Request, Response } from 'express';
import {
  executeTransfer,
  getWalletsByUserId,
  getAllWallets,
  getAllTransactions,
  getDoubleEntryLedger
} from '../services/ledgerService.js';
import { CurrencyCode } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/ledger/transfer:
 *   post:
 *     summary: Execute financial transfer with idempotency & double-entry posting
 *     tags: [Banking & Ledger]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: false
 *         schema:
 *           type: string
 */
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) || req.body.idempotencyKey || `auto_${Date.now()}`;

    const {
      senderId = 'usr_retail_01',
      senderName = 'Vikram Sharma',
      recipientId = 'usr_hni_01',
      recipientName = 'Julian Sterling',
      senderWalletId = 'wlt_vikram_inr',
      recipientWalletId = 'wlt_julian_inr',
      amount,
      currency = 'INR',
      channel = 'UPI',
      panNumberProvided,
      hasVerifiedPan = false,
      isCrossBorder = false
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount greater than 0 is required' });
    }

    const result = await executeTransfer({
      idempotencyKey,
      senderId,
      senderName,
      recipientId,
      recipientName,
      senderWalletId,
      recipientWalletId,
      amount: Number(amount),
      currency: currency as CurrencyCode,
      channel,
      panNumberProvided,
      hasVerifiedPan,
      isCrossBorder,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      isIdempotentReplay: result.isIdempotentReplay,
      idempotencyKey,
      transaction: result.transaction
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/ledger/wallets:
 *   get:
 *     summary: Retrieve user multi-currency wallets
 *     tags: [Banking & Ledger]
 */
router.get('/wallets', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (userId) {
    const userWallets = getWalletsByUserId(userId);
    return res.json({ success: true, count: userWallets.length, wallets: userWallets });
  }
  const all = getAllWallets();
  return res.json({ success: true, count: all.length, wallets: all });
});

/**
 * @openapi
 * /api/v1/ledger/transactions:
 *   get:
 *     summary: List settled and held financial transactions
 *     tags: [Banking & Ledger]
 */
router.get('/transactions', (_req: Request, res: Response) => {
  const list = getAllTransactions();
  return res.json({ success: true, count: list.length, transactions: list });
});

/**
 * @openapi
 * /api/v1/ledger/double-entry:
 *   get:
 *     summary: View immutable double-entry accounting ledger
 *     tags: [Banking & Ledger]
 */
router.get('/double-entry', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const entries = getDoubleEntryLedger(limit);
  return res.json({ success: true, count: entries.length, entries });
});

export default router;
