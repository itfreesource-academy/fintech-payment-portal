import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('System Legal Disclaimer & Statutory Citations API', () => {
  it('should expose /api/v1/system/disclaimer with educational notice and zero liability', async () => {
    const res = await request(app).get('/api/v1/system/disclaimer');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.purpose).toContain('EDUCATIONAL');
    expect(res.body.liability).toContain('ZERO LIABILITY');
    expect(res.body.isFinancialInstitution).toBe(false);
    expect(res.body.fiatSettlement).toBe(false);
    expect(res.body.syntheticDataOnly).toBe(true);
  });

  it('should include public domain statutory gazette citations (India, UAE, AU, UN)', async () => {
    const res = await request(app).get('/api/v1/system/disclaimer');

    const citations = res.body.statutoryCitations;
    expect(citations.india_fiu_rule_114b.statute).toContain('Rule 114B');
    expect(citations.india_fiu_rule_114b.gazetteCitation).toContain('S.O. 3548(E)');
    expect(citations.india_fiu_rule_3_ctr.statute).toContain('PMLA');
    expect(citations.india_dpdp_act.mandate).toContain('Section 12');
    expect(citations.uae_cbuae_goaml.threshold).toContain('AED 55,000');
    expect(citations.australia_austrac.threshold).toContain('AUD 10,000');
    expect(citations.global_un_sanctions.statute).toContain('1267');
  });

  it('should confirm 100% exclusion of US regulatory frameworks (FinCEN, BSA, OFAC)', async () => {
    const res = await request(app).get('/api/v1/system/disclaimer');

    expect(res.body.usRegulatoryExclusion).toContain('100% EXCLUDED');
    expect(res.body.usRegulatoryExclusion).toContain('FinCEN');
    expect(res.body.usRegulatoryExclusion).toContain('BSA');
  });

  it('should expose operational health with microservices catalog', async () => {
    const res = await request(app).get('/api/v1/system/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.microservices.amlScreeningService).toContain('FIU-IND');
  });
});
