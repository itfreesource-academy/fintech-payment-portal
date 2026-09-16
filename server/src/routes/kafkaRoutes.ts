import { Router, Request, Response } from 'express';
import {
  getAllKafkaMessages,
  getKafkaMessages,
  getTopicMetrics,
  publishToKafka,
  replayDlq
} from '../services/kafkaBroker.js';
import { KafkaTopic } from '../types/index.js';

const router = Router();

/**
 * @openapi
 * /api/v1/kafka/topics:
 *   get:
 *     summary: List all active Kafka topics
 *     tags: [Kafka Event Streaming]
 */
router.get('/topics', (_req: Request, res: Response) => {
  const metrics = getTopicMetrics();
  return res.json({ success: true, count: metrics.length, topics: metrics.map(m => m.topic) });
});

/**
 * @openapi
 * /api/v1/kafka/metrics:
 *   get:
 *     summary: Get topic metrics, consumer lag, and DLQ status
 *     tags: [Kafka Event Streaming]
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = getTopicMetrics();
  return res.json({ success: true, metrics });
});

/**
 * @openapi
 * /api/v1/kafka/messages:
 *   get:
 *     summary: Inspect streaming Kafka messages across partitions
 *     tags: [Kafka Event Streaming]
 */
router.get('/messages', (req: Request, res: Response) => {
  const topic = req.query.topic as KafkaTopic | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const partition = req.query.partition !== undefined ? Number(req.query.partition) : undefined;

  if (topic) {
    const messages = getKafkaMessages(topic, limit, partition);
    return res.json({ success: true, topic, count: messages.length, messages });
  }

  const all = getAllKafkaMessages(limit);
  return res.json({ success: true, count: all.length, messages: all });
});

/**
 * @openapi
 * /api/v1/kafka/publish:
 *   post:
 *     summary: Manually publish test event to a Kafka topic
 *     tags: [Kafka Event Streaming]
 */
router.post('/publish', (req: Request, res: Response) => {
  try {
    const { topic, key = 'test_key', value = {}, headers = {} } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const message = publishToKafka(topic as KafkaTopic, key, value, headers);
    return res.status(201).json({ success: true, message });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/v1/kafka/dlq/replay:
 *   post:
 *     summary: Replay Dead Letter Queue (DLQ) messages back into main topic
 *     tags: [Kafka Event Streaming]
 */
router.post('/dlq/replay', (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const result = replayDlq(topic as KafkaTopic);
    return res.json({ success: true, message: `Replayed ${result.replayedCount} DLQ events`, ...result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
