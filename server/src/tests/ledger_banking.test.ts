import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Core Banking, Wallets & Double-Entry Ledger', () => {
  it('should execute financial transfer and post double-entry records', async () => {
    const idempotencyKey = `idem_test_${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/ledger/transfer')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        senderId: 'usr_retail_01',
        senderName: 'Vikram Sharma',
        recipientId: 'usr_hni_01',
        recipientName: 'Julian Sterling',
        senderWalletId: 'wlt_vikram_inr',
        recipientWalletId: 'wlt_julian_inr',
        amount: 5000,
        currency: 'INR',
        channel: 'UPI'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isIdempotentReplay).toBe(false);
    expect(res.body.transaction.status).toBe('SETTLED');

    // Verify double-entry ledger entries exist
    const ledgerRes = await request(app).get('/api/v1/ledger/double-entry?limit=10');
    expect(ledgerRes.status).toBe(200);
    expect(ledgerRes.body.entries.length).toBeGreaterThanOrEqual(2);

    const relatedEntries = ledgerRes.body.entries.filter(
      (e: any) => e.transactionId === res.body.transaction.id
    );
    expect(relatedEntries.length).toBe(2);
    const debit = relatedEntries.find((e: any) => e.entryType === 'DEBIT');
    const credit = relatedEntries.find((e: any) => e.entryType === 'CREDIT');
    expect(debit.amount).toBe(5000);
    expect(credit.amount).toBe(5000);
  });

  it('Strict Financial Idempotency: should return cached transaction on duplicate key without re-debiting', async () => {
    const idempotencyKey = `idem_replay_proof_${Date.now()}`;

    // First payment
    const res1 = await request(app)
      .post('/api/v1/ledger/transfer')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        senderId: 'usr_retail_01',
        senderName: 'Vikram Sharma',
        recipientId: 'usr_hni_01',
        recipientName: 'Julian Sterling',
        senderWalletId: 'wlt_vikram_inr',
        recipientWalletId: 'wlt_julian_inr',
        amount: 1000,
        currency: 'INR',
        channel: 'UPI'
      });

    expect(res1.status).toBe(200);
    expect(res1.body.isIdempotentReplay).toBe(false);
    const originalTxnId = res1.body.transaction.id;

    // Duplicate payment with identical Idempotency-Key
    const res2 = await request(app)
      .post('/api/v1/ledger/transfer')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        senderId: 'usr_retail_01',
        senderName: 'Vikram Sharma',
        recipientId: 'usr_hni_01',
        recipientName: 'Julian Sterling',
        senderWalletId: 'wlt_vikram_inr',
        recipientWalletId: 'wlt_julian_inr',
        amount: 1000,
        currency: 'INR',
        channel: 'UPI'
      });

    expect(res2.status).toBe(200);
    expect(res2.body.isIdempotentReplay).toBe(true);
    expect(res2.body.transaction.id).toBe(originalTxnId);
  });
});
