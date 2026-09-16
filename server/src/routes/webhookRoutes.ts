import { Router, Request, Response } from 'express';
import {
  registerWebhook,
  getAllWebhooks,
  getWebhookDeliveryLogs,
  retryWebhookDelivery,
  dispatchWebhookEvent
} from '../services/webhookService.js';

const router = Router();

/**
 * @openapi
 * /api/v1/webhooks/subscriptions:
 *   get:
 *     summary: List all active webhook endpoints
 *     tags: [Enterprise Webhooks]
 */
router.get('/subscriptions', (_req: Request, res: Response) => {
  const subs = getAllWebhooks();
  return res.json({ success: true, count: subs.length, subscriptions: subs });
});

/**
 * @openapi
 * /api/v1/webhooks/subscriptions:
 *   post:
 *     summary: Register a new webhook endpoint with HMAC-SHA256 secret
 *     tags: [Enterprise Webhooks]
 */
router.post('/subscriptions', (req: Request, res: Response) => {
  try {
    const { userId = 'usr_compliance_01', targetUrl, subscribedEvents = ['*'], secret } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    const sub = registerWebhook(userId, targetUrl, subscribedEvents, secret);
    return res.status(201).json({ success: true, subscription: sub });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/webhooks/logs:
 *   get:
 *     summary: View outbound webhook delivery attempt logs with signatures
 *     tags: [Enterprise Webhooks]
 */
router.get('/logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const logs = getWebhookDeliveryLogs(limit);
  return res.json({ success: true, count: logs.length, logs });
});

/**
 * @openapi
 * /api/v1/webhooks/retry/{id}:
 *   post:
 *     summary: Manually replay or retry a webhook delivery
 *     tags: [Enterprise Webhooks]
 */
router.post('/retry/:id', (req: Request, res: Response) => {
  const retryLog = retryWebhookDelivery(String(req.params.id));
  if (!retryLog) {
    return res.status(404).json({ error: 'Webhook delivery log not found' });
  }
  return res.json({ success: true, delivery: retryLog });
});

/**
 * @openapi
 * /api/v1/webhooks/test-trigger:
 *   post:
 *     summary: Fire a test event through the webhook dispatcher
 *     tags: [Enterprise Webhooks]
 */
router.post('/test-trigger', async (req: Request, res: Response) => {
  const { event = 'test.ping', payload = { message: 'Manual test ping from Playground' } } = req.body;
  const logs = await dispatchWebhookEvent(event, payload);
  return res.json({ success: true, dispatchedTo: logs.length, logs });
});

export default router;
