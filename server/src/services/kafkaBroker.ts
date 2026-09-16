import crypto from 'crypto';
import { KafkaTopic, KafkaMessage, KafkaTopicMetrics } from '../types/index.js';

interface TopicState {
  partitionCount: number;
  currentOffsets: number[];
  messages: KafkaMessage[];
  deadLetterQueue: KafkaMessage[];
  consumerCommittedOffsets: Map<string, number[]>; // consumerGroupId -> partition offset
}

const TOPICS: KafkaTopic[] = [
  'kyc.events',
  'aml.alerts',
  'fraud.events',
  'ledger.settlements',
  'insurance.claims',
  'pii.audits'
];

const topicStore: Map<KafkaTopic, TopicState> = new Map();

// Initialize all topics
for (const topic of TOPICS) {
  topicStore.set(topic, {
    partitionCount: 3,
    currentOffsets: [0, 0, 0],
    messages: [],
    deadLetterQueue: [],
    consumerCommittedOffsets: new Map([
      ['compliance-worker-group', [0, 0, 0]],
      ['fraud-stream-processor', [0, 0, 0]],
      ['audit-archiver-group', [0, 0, 0]]
    ])
  });
}

/**
 * Publish a message to a Kafka topic
 */
export function publishToKafka(
  topic: KafkaTopic,
  key: string,
  value: Record<string, any>,
  headers: Record<string, string> = {}
): KafkaMessage {
  const state = topicStore.get(topic);
  if (!state) {
    throw new Error(`Kafka topic '${topic}' does not exist`);
  }

  // Consistent partition hashing using message key
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const partition = Math.abs(hash) % state.partitionCount;
  const offset = state.currentOffsets[partition]++;

  const message: KafkaMessage = {
    topic,
    partition,
    offset,
    key,
    value,
    headers: {
      ...headers,
      'x-correlation-id': crypto.randomUUID(),
      'x-produced-at': new Date().toISOString()
    },
    timestamp: Date.now()
  };

  state.messages.push(message);

  // Keep last 1000 messages in memory
  if (state.messages.length > 1000) {
    state.messages.shift();
  }

  return message;
}

/**
 * Get messages from a topic with optional partition and offset filtering
 */
export function getKafkaMessages(
  topic: KafkaTopic,
  limit: number = 50,
  partition?: number
): KafkaMessage[] {
  const state = topicStore.get(topic);
  if (!state) return [];

  let msgs = state.messages;
  if (typeof partition === 'number') {
    msgs = msgs.filter(m => m.partition === partition);
  }

  return msgs.slice(-limit).reverse();
}

/**
 * Get all messages across all topics for the global stream inspector
 */
export function getAllKafkaMessages(limit: number = 100): KafkaMessage[] {
  const all: KafkaMessage[] = [];
  for (const state of topicStore.values()) {
    all.push(...state.messages);
  }
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

/**
 * Route a failed message to the Dead Letter Queue (DLQ)
 */
export function sendToDlq(topic: KafkaTopic, message: KafkaMessage, errorReason: string): void {
  const state = topicStore.get(topic);
  if (!state) return;

  const dlqMessage: KafkaMessage = {
    ...message,
    headers: {
      ...message.headers,
      'x-dlq-reason': errorReason,
      'x-dlq-timestamp': new Date().toISOString()
    }
  };
  state.deadLetterQueue.push(dlqMessage);
}

/**
 * Replay DLQ messages back into the main topic partition
 */
export function replayDlq(topic: KafkaTopic): { replayedCount: number } {
  const state = topicStore.get(topic);
  if (!state) return { replayedCount: 0 };

  const dlqCount = state.deadLetterQueue.length;
  const items = [...state.deadLetterQueue];
  state.deadLetterQueue = [];

  for (const item of items) {
    publishToKafka(topic, item.key, item.value, {
      ...item.headers,
      'x-replayed-from-dlq': 'true'
    });
  }

  return { replayedCount: dlqCount };
}

/**
 * Get topic metrics and consumer lag
 */
export function getTopicMetrics(): KafkaTopicMetrics[] {
  const metrics: KafkaTopicMetrics[] = [];

  for (const [topic, state] of topicStore.entries()) {
    let totalLag = 0;
    for (const [, offsets] of state.consumerCommittedOffsets.entries()) {
      for (let p = 0; p < state.partitionCount; p++) {
        const head = state.currentOffsets[p];
        const committed = offsets[p] || 0;
        totalLag += Math.max(0, head - committed);
      }
    }

    metrics.push({
      topic,
      partitionCount: state.partitionCount,
      totalMessages: state.messages.length,
      consumerLag: totalLag,
      deadLetterCount: state.deadLetterQueue.length
    });
  }

  return metrics;
}
