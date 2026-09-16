import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { getAllAmlAlerts } from '../services/amlService.js';

describe('Multi-Jurisdiction AML & Sanctions Engine', () => {
  it('🇮🇳 FIU-IND: should block cash transaction > ₹50,000 lacking verified PAN (Rule 114B)', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/transaction')
      .send({
        userId: 'usr_retail_01',
        userName: 'Vikram Sharma',
        amount: 55000,
        currency: 'INR',
        channel: 'CASH',
        hasVerifiedPan: false
      });

    expect(res.status).toBe(200);
    expect(res.body.blocked).toBe(true);
    expect(res.body.passed).toBe(false);

    const rule114b = res.body.alerts.find((a: any) => a.ruleCode === 'IND_RULE_114B');
    expect(rule114b).toBeDefined();
    expect(rule114b.jurisdiction).toBe('FIU-IND');
    expect(rule114b.legalCitation).toContain('Rule 114B');
  });

  it('🇮🇳 FIU-IND: should detect structuring/smurfing just below ₹50,000 (e.g. ₹49,500)', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/transaction')
      .send({
        userId: 'usr_retail_01',
        userName: 'Vikram Sharma',
        amount: 49500,
        currency: 'INR',
        channel: 'CASH',
        hasVerifiedPan: false
      });

    expect(res.status).toBe(200);
    const structuringAlert = res.body.alerts.find((a: any) => a.ruleCode === 'IND_STRUCTURING');
    expect(structuringAlert).toBeDefined();
    expect(structuringAlert.severity).toBe('CRITICAL');
    expect(structuringAlert.ruleName).toContain('Structuring');
    expect(structuringAlert.details).toContain('structuring');
  });

  it('🇮🇳 FIU-IND: should flag Rule 3 Cash Transaction Report (CTR) for ₹10 Lakhs+', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/transaction')
      .send({
        userId: 'usr_retail_01',
        userName: 'Vikram Sharma',
        amount: 1200000,
        currency: 'INR',
        channel: 'CASH',
        hasVerifiedPan: true,
        panNumber: 'ABCPS8921F'
      });

    expect(res.status).toBe(200);
    const ctrAlert = res.body.alerts.find((a: any) => a.ruleCode === 'IND_RULE_3_CTR');
    expect(ctrAlert).toBeDefined();
    expect(ctrAlert.legalCitation).toContain('PMLA (Maintenance of Records) Rules 2005');
  });

  it('🇦🇪 CBUAE: should flag High Cash AED 55,000+ and generate UNODC goAML XML payload', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/transaction')
      .send({
        userId: 'usr_hni_01',
        userName: 'Julian Sterling',
        amount: 60000,
        currency: 'AED',
        channel: 'CASH'
      });

    expect(res.status).toBe(200);
    const uaeAlert = res.body.alerts.find((a: any) => a.ruleCode === 'UAE_AED_55K_CASH');
    expect(uaeAlert).toBeDefined();
    expect(uaeAlert.jurisdiction).toBe('CBUAE');
    expect(uaeAlert.goAmlXmlPayload).toContain('<report xmlns="http://www.unodc.org/goAML"');
    expect(uaeAlert.goAmlXmlPayload).toContain('<indicator>HIGH_CASH_TRANSACTION_AED_55K</indicator>');

    // Test XML download endpoint
    const xmlRes = await request(app).get(`/api/v1/aml/goaml-xml/${uaeAlert.id}`);
    expect(xmlRes.status).toBe(200);
    expect(xmlRes.headers['content-type']).toContain('xml');
  });

  it('🇦🇺 AUSTRAC: should trigger Threshold Transaction Report (TTR) for AUD 10,000+', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/transaction')
      .send({
        userId: 'usr_retail_01',
        userName: 'Vikram Sharma',
        amount: 15000,
        currency: 'AUD',
        channel: 'WIRE'
      });

    expect(res.status).toBe(200);
    const austracAlert = res.body.alerts.find((a: any) => a.ruleCode === 'AUS_AUD_10K_TTR');
    expect(austracAlert).toBeDefined();
    expect(austracAlert.jurisdiction).toBe('AUSTRAC');
  });

  it('🌐 Global Watchlist: should match Vladimir Voronov against UN Security Council sanctions', async () => {
    const res = await request(app)
      .post('/api/v1/aml/screen/sanctions')
      .send({ name: 'Vladimir Voronov' });

    expect(res.status).toBe(200);
    expect(res.body.isMatch).toBe(true);
    expect(res.body.matchedEntity.sourceList).toBe('UN_SECURITY_COUNCIL');
    expect(res.body.matchedEntity.isPep).toBe(true);
  });

  it('should only enforce supported statutory jurisdictions (FIU-IND, CBUAE, AUSTRAC, UN_SANCTIONS)', () => {
    const allAlerts = getAllAmlAlerts();
    const validJurisdictions = ['FIU-IND', 'CBUAE', 'AUSTRAC', 'UN_SANCTIONS'];
    for (const alert of allAlerts) {
      expect(validJurisdictions).toContain(alert.jurisdiction);
    }
  });
});
