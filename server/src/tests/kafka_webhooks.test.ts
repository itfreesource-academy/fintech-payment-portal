import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import crypto from 'crypto';

describe('Apache Kafka Broker & Enterprise Webhooks', () => {
  it('should list Kafka topics and report metrics', async () => {
    const res = await request(app).get('/api/v1/kafka/metrics');
    expect(res.status).toBe(200);
    expect(res.body.metrics.length).toBe(6);

    const topics = res.body.metrics.map((m: any) => m.topic);
    expect(topics).toContain('kyc.events');
    expect(topics).toContain('aml.alerts');
    expect(topics).toContain('fraud.events');
    expect(topics).toContain('ledger.settlements');
    expect(topics).toContain('insurance.claims');
    expect(topics).toContain('pii.audits');
  });

  it('should publish a message and retrieve from topic stream', async () => {
    const pubRes = await request(app)
      .post('/api/v1/kafka/publish')
      .send({
        topic: 'fraud.events',
        key: 'usr_test_kafka',
        value: { alert: 'TEST_KAFKA_PUBLISH', score: 85 }
      });

    expect(pubRes.status).toBe(201);
    expect(pubRes.body.message.partition).toBeDefined();
    expect(pubRes.body.message.offset).toBeDefined();

    const streamRes = await request(app).get('/api/v1/kafka/messages?topic=fraud.events&limit=5');
    expect(streamRes.status).toBe(200);
    expect(streamRes.body.messages.length).toBeGreaterThanOrEqual(1);
  });

  it('should register webhook subscription and dispatch event with valid HMAC signature', async () => {
    const secret = 'whsec_test_secret_key_123';
    const subRes = await request(app)
      .post('/api/v1/webhooks/subscriptions')
      .send({
        userId: 'usr_compliance_01',
        targetUrl: 'https://webhook.site/test-endpoint',
        subscribedEvents: ['test.ping'],
        secret
      });

    expect(subRes.status).toBe(201);
    expect(subRes.body.subscription.secret).toBe(secret);

    // Trigger test event
    const trigRes = await request(app)
      .post('/api/v1/webhooks/test-trigger')
      .send({
        event: 'test.ping',
        payload: { greeting: 'Hello Webhook World' }
      });

    expect(trigRes.status).toBe(200);
    expect(trigRes.body.logs.length).toBeGreaterThanOrEqual(1);

    const log = trigRes.body.logs.find((l: any) => l.subscriptionId === subRes.body.subscription.id);
    expect(log).toBeDefined();
    expect(log.signature).toContain('sha256=');

    // Verify HMAC calculation math
    const expectedSig = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(log.payload))
      .digest('hex')}`;
    expect(log.signature).toBe(expectedSig);
  });
});
