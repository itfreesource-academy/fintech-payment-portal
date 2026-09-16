import crypto from 'crypto';
import { WebhookSubscription, WebhookDeliveryLog } from '../types/index.js';

const subscriptions: Map<string, WebhookSubscription> = new Map();
const deliveryLogs: WebhookDeliveryLog[] = [];

// Seed a default mock webhook endpoint
const defaultSub: WebhookSubscription = {
  id: 'sub_default_01',
  userId: 'usr_compliance_01',
  targetUrl: 'https://webhook.site/itfreesource-fintech-sandbox',
  secret: 'whsec_itfreesource_enterprise_hmac_secret_key_2026',
  subscribedEvents: ['kyc.approved', 'aml.alert_generated', 'fraud.high_risk', 'ledger.settled', 'insurance.claim_filed'],
  status: 'ACTIVE',
  createdAt: new Date().toISOString()
};
subscriptions.set(defaultSub.id, defaultSub);

/**
 * Register a new webhook endpoint
 */
export function registerWebhook(
  userId: string,
  targetUrl: string,
  subscribedEvents: string[],
  secret?: string
): WebhookSubscription {
  const sub: WebhookSubscription = {
    id: `sub_${crypto.randomUUID()}`,
    userId,
    targetUrl,
    secret: secret || `whsec_${crypto.randomBytes(16).toString('hex')}`,
    subscribedEvents,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  subscriptions.set(sub.id, sub);
  return sub;
}

/**
 * Dispatch an event to all matching webhook subscriptions with HMAC-SHA256 signature
 */
export async function dispatchWebhookEvent(
  event: string,
  payload: Record<string, any>
): Promise<WebhookDeliveryLog[]> {
  const logs: WebhookDeliveryLog[] = [];
  const eventPayload = {
    id: `evt_${crypto.randomUUID()}`,
    event,
    timestamp: new Date().toISOString(),
    data: payload
  };
  const bodyString = JSON.stringify(eventPayload);

  for (const sub of subscriptions.values()) {
    if (sub.status !== 'ACTIVE') continue;
    if (!sub.subscribedEvents.includes(event) && !sub.subscribedEvents.includes('*')) continue;

    // Calculate HMAC-SHA256 signature
    const signature = `sha256=${crypto
      .createHmac('sha256', sub.secret)
      .update(bodyString)
      .digest('hex')}`;

    const startTime = Date.now();
    let httpStatusCode = 200;
    let responseBody = '{"received": true, "status": "processed"}';
    let status: 'DELIVERED' | 'FAILED' | 'RETRY_SCHEDULED' = 'DELIVERED';

    // Simulate realistic outbound HTTP delivery (or if valid URL in test/prod, could do fetch)
    const durationMs = Math.floor(Math.random() * 60) + 20;

    const log: WebhookDeliveryLog = {
      id: `whlog_${crypto.randomUUID()}`,
      subscriptionId: sub.id,
      targetUrl: sub.targetUrl,
      event,
      signature,
      payload: eventPayload,
      attemptNumber: 1,
      httpStatusCode,
      responseBody,
      durationMs,
      status,
      timestamp: new Date().toISOString()
    };

    deliveryLogs.unshift(log);
    logs.push(log);
  }

  // Keep last 500 delivery logs
  if (deliveryLogs.length > 500) {
    deliveryLogs.length = 500;
  }

  return logs;
}

export function getAllWebhooks(): WebhookSubscription[] {
  return Array.from(subscriptions.values());
}

export function getWebhookDeliveryLogs(limit: number = 50): WebhookDeliveryLog[] {
  return deliveryLogs.slice(0, limit);
}

export function retryWebhookDelivery(logId: string): WebhookDeliveryLog | null {
  const original = deliveryLogs.find(l => l.id === logId);
  if (!original) return null;

  const retryLog: WebhookDeliveryLog = {
    ...original,
    id: `whlog_${crypto.randomUUID()}`,
    attemptNumber: original.attemptNumber + 1,
    status: 'DELIVERED',
    httpStatusCode: 200,
    responseBody: '{"received": true, "status": "replayed_successfully"}',
    timestamp: new Date().toISOString()
  };

  deliveryLogs.unshift(retryLog);
  return retryLog;
}
