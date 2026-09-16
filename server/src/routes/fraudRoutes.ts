import { Router, Request, Response } from 'express';
import { evaluateFraudRisk, getAllFraudEvaluations } from '../services/fraudService.js';

const router = Router();

/**
 * @openapi
 * /api/v1/fraud/evaluate:
 *   post:
 *     summary: Run multi-vector risk evaluation (IP/Geo, Velocity, Device, Anomaly)
 *     tags: [Fraud Engine]
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'usr_retail_01',
      transactionId,
      amount = 15000,
      currency = 'INR',
      ipAddress = '103.21.124.8',
      currentGeo,
      deviceFingerprint = 'fp_chrome_mac_8892',
      userAgent = req.headers['user-agent'] || 'Mozilla/5.0 Chrome/122.0',
      isVpnOrProxy = false
    } = req.body;

    const evalResult = await evaluateFraudRisk({
      userId,
      transactionId,
      amount: Number(amount),
      currency,
      ipAddress,
      currentGeo,
      deviceFingerprint,
      userAgent,
      isVpnOrProxy
    });

    return res.json({ success: true, evaluation: evalResult });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/fraud/evaluations:
 *   get:
 *     summary: List recent fraud risk evaluations
 *     tags: [Fraud Engine]
 */
router.get('/evaluations', (_req: Request, res: Response) => {
  const list = getAllFraudEvaluations();
  return res.json({ success: true, count: list.length, evaluations: list });
});

/**
 * @openapi
 * /api/v1/fraud/test-impossible-travel:
 *   post:
 *     summary: Simulate rapid login between distant geographies (Mumbai -> London)
 *     tags: [Fraud Engine]
 */
router.post('/test-impossible-travel', async (_req: Request, res: Response) => {
  const userId = `usr_test_travel_${Date.now()}`;

  // 1. First event in Mumbai
  await evaluateFraudRisk({
    userId,
    amount: 5000,
    currency: 'INR',
    currentGeo: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    ipAddress: '103.21.124.8'
  });

  // 2. Second event 2 seconds later in London (impossible physical travel)
  const result = await evaluateFraudRisk({
    userId,
    amount: 5000,
    currency: 'INR',
    currentGeo: { lat: 51.5074, lng: -0.1278, city: 'London' },
    ipAddress: '82.165.197.1'
  });

  return res.json({
    success: true,
    scenario: 'Simulated 7,200 km jump from Mumbai to London within milliseconds',
    evaluation: result
  });
});

export default router;
