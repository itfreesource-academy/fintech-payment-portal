import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Insurance Underwriting & Claims Engine', () => {
  it('should calculate actuarial quote for Health Suraksha policy', async () => {
    const res = await request(app)
      .post('/api/v1/insurance/quote')
      .send({
        productId: 'prd_health_01',
        userAge: 32,
        requestedCoverage: 500000
      });

    expect(res.status).toBe(200);
    expect(res.body.quote.annualPremium).toBeGreaterThan(0);
    expect(res.body.quote.product.name).toContain('Health Suraksha');
  });

  it('should issue an insurance policy and file a claim', async () => {
    // 1. Issue policy
    const polRes = await request(app)
      .post('/api/v1/insurance/policies')
      .send({
        userId: 'usr_retail_01',
        productId: 'prd_health_01',
        coverageAmount: 500000,
        userAge: 32
      });

    expect(polRes.status).toBe(201);
    expect(polRes.body.policy.policyNumber).toContain('POL-2026');
    const policyId = polRes.body.policy.id;

    // 2. File claim
    const claimRes = await request(app)
      .post('/api/v1/insurance/claims')
      .send({
        policyId,
        userId: 'usr_retail_01',
        claimAmount: 45000,
        description: 'Hospitalization due to dengue fever in Lilavati Hospital'
      });

    expect(claimRes.status).toBe(201);
    expect(claimRes.body.claim.claimNumber).toContain('CLM-2026');
    expect(claimRes.body.claim.claimFraudScore).toBeDefined();

    // 3. Adjudicate claim
    const adjRes = await request(app)
      .patch(`/api/v1/insurance/claims/${claimRes.body.claim.id}/adjudicate`)
      .send({
        status: 'APPROVED',
        notes: 'Medical discharge summary and hospital bills validated',
        reviewer: 'Sarah Chen'
      });

    expect(adjRes.status).toBe(200);
    expect(adjRes.body.claim.status).toBe('APPROVED');
  });
});
