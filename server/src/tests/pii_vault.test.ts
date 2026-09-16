import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Sensitive Data Vault & DPDP Act 2023 Compliance', () => {
  it('should encrypt sensitive PAN with AES-256-GCM and return surrogate token & mask', async () => {
    const res = await request(app)
      .post('/api/v1/pii/encrypt')
      .send({
        userId: 'usr_retail_01',
        dataType: 'PAN',
        plainText: 'ABCPS8921F',
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer'
      });

    expect(res.status).toBe(201);
    expect(res.body.record.token).toContain('tok_pan_');
    expect(res.body.record.maskedValue).toBe('ABCPS****F');
    expect(res.body.record.iv).toBeDefined();
    expect(res.body.record.authTag).toBeDefined();
    expect(res.body.record.encryptedValue).not.toBe('ABCPS8921F');
  });

  it('should allow authorized compliance officer to decrypt raw PII and create audit trail', async () => {
    // 1. Ingest
    const ingRes = await request(app)
      .post('/api/v1/pii/encrypt')
      .send({
        userId: 'usr_retail_01',
        dataType: 'AADHAAR',
        plainText: '982103492817',
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer'
      });

    const recordId = ingRes.body.record.id;

    // 2. Decrypt as Compliance Officer
    const decRes = await request(app)
      .post('/api/v1/pii/decrypt')
      .send({
        recordId,
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer',
        justification: 'FIU-IND Rule 114B verification check'
      });

    expect(decRes.status).toBe(200);
    expect(decRes.body.plainText).toBe('982103492817');

    // 3. Verify audit log entry was generated
    const auditRes = await request(app).get('/api/v1/pii/audit-logs?targetUserId=usr_retail_01');
    expect(auditRes.status).toBe(200);
    const decryptLog = auditRes.body.logs.find((l: any) => l.action === 'DECRYPT');
    expect(decryptLog).toBeDefined();
    expect(decryptLog.actorRole).toBe('compliance_officer');
  });

  it('should deny decryption to unauthorized roles (e.g. retail_customer)', async () => {
    const ingRes = await request(app)
      .post('/api/v1/pii/encrypt')
      .send({
        userId: 'usr_retail_01',
        dataType: 'PASSPORT',
        plainText: 'A8921043',
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer'
      });

    const recordId = ingRes.body.record.id;

    const decRes = await request(app)
      .post('/api/v1/pii/decrypt')
      .send({
        recordId,
        actorUserId: 'usr_retail_01',
        actorRole: 'retail_customer',
        justification: 'Unauthorized attempt'
      });

    expect(decRes.status).toBe(403);
    expect(decRes.body.error).toContain('Access Denied');
  });

  it('should cryptographically erase data under DPDP Act 2023 Right-to-be-Forgotten', async () => {
    const ingRes = await request(app)
      .post('/api/v1/pii/encrypt')
      .send({
        userId: 'usr_retail_01',
        dataType: 'PHONE_NUMBER',
        plainText: '+919820192837',
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer'
      });

    const recordId = ingRes.body.record.id;

    // Erase
    const eraseRes = await request(app)
      .post('/api/v1/pii/erase')
      .send({
        recordId,
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer',
        justification: 'Citizen revoked consent'
      });

    expect(eraseRes.status).toBe(200);
    expect(eraseRes.body.record.isErased).toBe(true);
    expect(eraseRes.body.record.encryptedValue).toBe('SHREDDED_CRYPTOGRAPHICALLY');

    // Decrypting erased data must fail
    const decRes = await request(app)
      .post('/api/v1/pii/decrypt')
      .send({
        recordId,
        actorUserId: 'usr_compliance_01',
        actorRole: 'compliance_officer'
      });

    expect(decRes.status).toBe(403);
    expect(decRes.body.error).toContain('DPDP Act 2023');
  });
});
