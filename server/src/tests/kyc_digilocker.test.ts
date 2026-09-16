import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('KYC & Zero-Cost DigiLocker Sandbox', () => {
  it('should submit a valid KYC application with high liveness score', async () => {
    const res = await request(app)
      .post('/api/v1/kyc/apply')
      .send({
        userId: 'usr_retail_01',
        fullName: 'Vikram Sharma',
        idType: 'PAN',
        rawIdNumber: 'ABCPS8921F',
        dob: '1992-06-18',
        gender: 'M',
        address: 'Bandra West, Mumbai'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.kyc.status).toBe('APPROVED');
    expect(res.body.kyc.livenessScore).toBeGreaterThanOrEqual(70);
    expect(res.body.kyc.idNumberMasked).toContain('****');
  });

  it('should reject KYC application if biometric liveness test fails', async () => {
    const res = await request(app)
      .post('/api/v1/kyc/apply')
      .send({
        userId: 'usr_retail_01',
        fullName: 'Vikram Sharma',
        idType: 'AADHAAR',
        rawIdNumber: '992817263541',
        triggerFailure: true
      });

    expect(res.status).toBe(201);
    expect(res.body.kyc.status).toBe('REJECTED');
    expect(res.body.kyc.rejectionReason).toContain('Biometric mismatch');
  });

  it('should complete DigiLocker OAuth2 consent and return authentic issued documents', async () => {
    // 1. Initiate consent
    const initRes = await request(app)
      .post('/api/v1/digilocker/consent/initiate')
      .send({ userId: 'usr_retail_01', scope: ['AADHAAR', 'PAN', 'DRIVING_LICENSE'] });

    expect(initRes.status).toBe(201);
    expect(initRes.body.consent.consentId).toBeDefined();
    const consentId = initRes.body.consent.consentId;

    // 2. Authorize consent
    const authRes = await request(app)
      .post(`/api/v1/digilocker/consent/${consentId}/authorize`)
      .send();

    expect(authRes.status).toBe(200);
    expect(authRes.body.consent.status).toBe('CONSENTED');

    // 3. Fetch authentic government schemas
    const docsRes = await request(app).get(`/api/v1/digilocker/documents/${consentId}`);
    expect(docsRes.status).toBe(200);
    expect(docsRes.body.count).toBe(3);

    const docTypes = docsRes.body.documents.map((d: any) => d.docType);
    expect(docTypes).toContain('AADHAAR');
    expect(docTypes).toContain('PAN');
    expect(docTypes).toContain('DRIVING_LICENSE');

    // Check authentic UIDAI & ITD structure
    const panDoc = docsRes.body.documents.find((d: any) => d.docType === 'PAN');
    expect(panDoc.issuer).toContain('Income Tax Department');
    expect(panDoc.digitalSignature).toBeDefined();
  });
});
