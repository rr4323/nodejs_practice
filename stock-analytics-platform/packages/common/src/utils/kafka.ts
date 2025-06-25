import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';
import { StockData, StockDataSchema } from '../types/stock';

export class KafkaClient {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer>;

  constructor(brokers: string[], clientId: string) {
    this.kafka = new Kafka({
      clientId,
      brokers,
    });
    this.producer = this.kafka.producer();
    this.consumers = new Map();
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  async sendMessage(topic: string, messages: Array<{ value: string }>) {
    await this.producer.send({
      topic,
      messages,
    });
  }

  async subscribe(
    groupId: string,
    topics: string[],
    eachMessage: (topic: string, message: KafkaMessage) => Promise<void>
  ) {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.set(groupId, consumer);

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        await eachMessage(topic, message);
      },
    });
  }

  async createTopic(topic: string, numPartitions = 1, replicationFactor = 1) {
    const admin = this.kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic,
          numPartitions,
          replicationFactor,
        },
      ],
    });
    await admin.disconnect();
  }
}

// Kafka topics
export const KAFKA_TOPICS = {
  STOCK_UPDATES: 'stock-updates',
  STOCK_ALERTS: 'stock-alerts',
  STOCK_PREDICTIONS: 'stock-predictions',
  USER_ACTIVITY: 'user-activity',
  ANALYTICS_EVENTS: 'analytics-events',
} as const;

export type KafkaTopic = keyof typeof KAFKA_TOPICS;
