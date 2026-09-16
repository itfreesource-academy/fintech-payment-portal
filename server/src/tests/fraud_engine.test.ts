import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Real-Time Multi-Vector Fraud Detection Engine', () => {
  it('should approve standard low-risk transaction', async () => {
    const res = await request(app)
      .post('/api/v1/fraud/evaluate')
      .send({
        userId: 'usr_retail_01',
        amount: 2500,
        currency: 'INR',
        ipAddress: '103.21.124.8',
        deviceFingerprint: 'fp_valid_macbook_chrome'
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.decision).toBe('APPROVE');
    expect(res.body.evaluation.riskLevel).toBe('LOW');
    expect(res.body.evaluation.totalRiskScore).toBeLessThanOrEqual(30);
  });

  it('should trigger impossible travel anomaly between Mumbai and London', async () => {
    const res = await request(app).post('/api/v1/fraud/test-impossible-travel');
    expect(res.status).toBe(200);
    expect(res.body.evaluation.factorBreakdown.ipGeoRisk).toBe(25);
    expect(res.body.evaluation.triggeredRules).toContain('RULE_GEO_IMPOSSIBLE_TRAVEL');
    expect(res.body.evaluation.reasons[0]).toContain('Impossible travel detected');
  });

  it('should penalize automated headless environments and VPN IPs', async () => {
    const res = await request(app)
      .post('/api/v1/fraud/evaluate')
      .send({
        userId: 'usr_hacker_01',
        amount: 45000,
        currency: 'INR',
        userAgent: 'Mozilla/5.0 HeadlessChrome/118.0 (Puppeteer Automation)',
        isVpnOrProxy: true
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.factorBreakdown.deviceFingerprintRisk).toBe(20);
    expect(res.body.evaluation.factorBreakdown.ipGeoRisk).toBe(15);
    expect(res.body.evaluation.triggeredRules).toContain('RULE_DEVICE_HEADLESS_AUTOMATION');
    expect(res.body.evaluation.triggeredRules).toContain('RULE_GEO_VPN_DETECTED');
  });
});
