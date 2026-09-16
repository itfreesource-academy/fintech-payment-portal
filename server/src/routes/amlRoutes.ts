import { Router, Request, Response } from 'express';
import {
  getAllAmlAlerts,
  resolveAmlAlert,
  screenTransactionForAml,
  screenNameForSanctions,
  SANCTION_WATCHLIST
} from '../services/amlService.js';
import { AmlJurisdiction, CurrencyCode } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/aml/alerts:
 *   get:
 *     summary: Retrieve AML alerts (FIU-IND, CBUAE, AUSTRAC, PEP)
 *     tags: [AML & Sanctions]
 */
router.get('/alerts', (req: Request, res: Response) => {
  const jurisdiction = req.query.jurisdiction as AmlJurisdiction | undefined;
  const alerts = getAllAmlAlerts(jurisdiction);
  return res.json({ success: true, count: alerts.length, alerts });
});

/**
 * @openapi
 * /api/v1/aml/alerts/{id}/resolve:
 *   patch:
 *     summary: Adjudicate or resolve an open AML alert
 *     tags: [AML & Sanctions]
 */
router.patch('/alerts/:id/resolve', (req: Request, res: Response) => {
  try {
    const { status, reviewer = 'Maya Lin', notes = 'Verified legitimate customer activity' } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const resolved = resolveAmlAlert(String(req.params.id), status, reviewer, notes);
    return res.json({ success: true, alert: resolved });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/aml/screen/transaction:
 *   post:
 *     summary: Real-time AML rules evaluation (Rule 114B ₹50k PAN mandate, ₹10L CTR, CBUAE AED 55k, AUSTRAC AUD 10k)
 *     tags: [AML & Sanctions]
 */
router.post('/screen/transaction', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'usr_retail_01',
      userName = 'Vikram Sharma',
      transactionId = `txn_test_${Date.now()}`,
      amount,
      currency = 'INR',
      channel = 'CASH',
      hasVerifiedPan = false,
      panNumber,
      isCrossBorder = false
    } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'amount is required' });
    }

    const result = await screenTransactionForAml({
      userId,
      userName,
      transactionId,
      amount: Number(amount),
      currency: currency as CurrencyCode,
      channel,
      hasVerifiedPan,
      panNumber,
      isCrossBorder
    });

    return res.json({
      success: true,
      passed: result.passed,
      blocked: result.blocked,
      alertCount: result.alerts.length,
      alerts: result.alerts
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/aml/screen/sanctions:
 *   post:
 *     summary: Screen names against UN, Interpol, EU, and RBI Watchlists
 *     tags: [AML & Sanctions]
 */
router.post('/screen/sanctions', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const result = screenNameForSanctions(name);
  return res.json({ success: true, ...result });
});

/**
 * @openapi
 * /api/v1/aml/goaml-xml/{id}:
 *   get:
 *     summary: Export CBUAE / UNODC goAML XML payload for High Cash alert
 *     tags: [AML & Sanctions]
 */
router.get('/goaml-xml/:id', (req: Request, res: Response) => {
  const alerts = getAllAmlAlerts();
  const alert = alerts.find(a => a.id === req.params.id);

  if (!alert) {
    return res.status(404).json({ error: 'AML alert not found' });
  }

  if (!alert.goAmlXmlPayload) {
    return res.status(400).json({ error: 'Alert does not contain goAML XML (Only generated for CBUAE AED 55k+ alerts)' });
  }

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="goAML_CBUAE_${alert.id}.xml"`);
  return res.send(alert.goAmlXmlPayload);
});

export default router;
