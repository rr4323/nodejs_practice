import { Gauge, Counter, Histogram, register } from 'prom-client';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';

export interface MonitoringOptions {
  collectMetrics?: boolean;
  collectIntervalMs?: number;
  redisMetrics?: boolean;
  systemMetrics?: boolean;
  customMetrics?: Record<string, string>;
}

export class MonitoringService {
  private io: Server;
  private redis: Redis;
  private options: Required<MonitoringOptions>;
  private metricsInterval?: NodeJS.Timeout;

  // System Metrics
  private memoryUsageGauge?: Gauge;
  private cpuUsageGauge?: Gauge;
  private eventLoopLagGauge?: Gauge;
  
  // WebSocket Metrics
  private connectionsGauge?: Gauge;
  private messagesCounter?: Counter;
  private messageSizeHistogram?: Histogram;
  private errorsCounter?: Counter;
  private subscriptionsGauge?: Gauge;
  
  // Redis Metrics
  private redisMemoryGauge?: Gauge;
  private redisConnectedClientsGauge?: Gauge;
  
  // Custom Metrics
  private customMetrics: Map<string, Gauge | Counter | Histogram> = new Map();

  constructor(io: Server, redis: Redis, options: MonitoringOptions = {}) {
    this.io = io;
    this.redis = redis;
    this.options = {
      collectMetrics: options.collectMetrics ?? true,
      collectIntervalMs: options.collectIntervalMs ?? 10000, // 10 seconds
      redisMetrics: options.redisMetrics ?? true,
      systemMetrics: options.systemMetrics ?? true,
      customMetrics: options.customMetrics ?? {},
    };

    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Only initialize if metrics collection is enabled
    if (!this.options.collectMetrics) return;

    try {
      // System Metrics
      if (this.options.systemMetrics) {
        this.memoryUsageGauge = new Gauge({
          name: 'websocket_memory_usage_bytes',
          help: 'Current memory usage of the WebSocket service in bytes',
          labelNames: ['type'],
        });

        this.cpuUsageGauge = new Gauge({
          name: 'websocket_cpu_usage_percent',
          help: 'Current CPU usage percentage of the WebSocket service',
        });

        this.eventLoopLagGauge = new Gauge({
          name: 'websocket_event_loop_lag_seconds',
          help: 'Current event loop lag in seconds',
        });
      }


      // WebSocket Metrics
      this.connectionsGauge = new Gauge({
        name: 'websocket_connections_total',
        help: 'Total number of active WebSocket connections',
        labelNames: ['status'],
      });

      this.messagesCounter = new Counter({
        name: 'websocket_messages_total',
        help: 'Total number of WebSocket messages processed',
        labelNames: ['type', 'status'],
      });

      this.messageSizeHistogram = new Histogram({
        name: 'websocket_message_size_bytes',
        help: 'Size distribution of WebSocket messages in bytes',
        buckets: [100, 1000, 10000, 100000, 1000000],
      });

      this.errorsCounter = new Counter({
        name: 'websocket_errors_total',
        help: 'Total number of WebSocket errors',
        labelNames: ['type'],
      });

      this.subscriptionsGauge = new Gauge({
        name: 'websocket_subscriptions_total',
        help: 'Total number of active WebSocket subscriptions',
        labelNames: ['channel'],
      });

      // Redis Metrics
      if (this.options.redisMetrics) {
        this.redisMemoryGauge = new Gauge({
          name: 'redis_memory_usage_bytes',
          help: 'Current memory usage of Redis in bytes',
          labelNames: ['type'],
        });

        this.redisConnectedClientsGauge = new Gauge({
          name: 'redis_connected_clients',
          help: 'Number of connected clients to Redis',
        });
      }

      // Initialize custom metrics
      Object.entries(this.options.customMetrics).forEach(([name, help]) => {
        this.customMetrics.set(
          name,
          new Gauge({
            name: `websocket_${name}`,
            help,
          })
        );
      });

      logger.info('Metrics initialized');
    } catch (error) {
      logger.error('Failed to initialize metrics:', error);
    }
  }

  public start(): void {
    if (!this.options.collectMetrics) return;

    // Initial collection
    this.collectMetrics();

    // Schedule periodic collection
    this.metricsInterval = setInterval(
      () => this.collectMetrics(),
      this.options.collectIntervalMs
    );

    logger.info('Metrics collection started');
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Collect system metrics
      if (this.options.systemMetrics) {
        this.collectSystemMetrics();
      }

      // Collect WebSocket metrics
      this.collectWebSocketMetrics();

      // Collect Redis metrics
      if (this.options.redisMetrics) {
        await this.collectRedisMetrics();
      }
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  private collectSystemMetrics(): void {
    try {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      this.memoryUsageGauge?.set({ type: 'rss' }, memoryUsage.rss);
      this.memoryUsageGauge?.set({ type: 'heapTotal' }, memoryUsage.heapTotal);
      this.memoryUsageGauge?.set({ type: 'heapUsed' }, memoryUsage.heapUsed);
      this.memoryUsageGauge?.set({ type: 'external' }, memoryUsage.external || 0);

      // CPU usage (simplified)
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();
      
      // Small delay to measure CPU usage
      setTimeout(() => {
        const elapsedTime = process.hrtime(startTime);
        const elapsedTimeUs = elapsedTime[0] * 1000000 + elapsedTime[1] / 1000;
        const endUsage = process.cpuUsage(startUsage);
        
        // Calculate CPU usage percentage
        const cpuPercent = (endUsage.user + endUsage.system) / (elapsedTimeUs * 10);
        this.cpuUsageGauge?.set(cpuPercent);
      }, 100);

      // Event loop lag
      const start = process.hrtime();
      setImmediate(() => {
        const delta = process.hrtime(start);
        const lag = (delta[0] * 1e9 + delta[1]) / 1e6; // Convert to milliseconds
        this.eventLoopLagGauge?.set(lag / 1000); // Convert to seconds
      });
    } catch (error) {
      logger.error('Error collecting system metrics:', error);
    }
  }

  private collectWebSocketMetrics(): void {
    try {
      // Connection metrics
      const sockets = this.io.sockets.sockets.size;
      this.connectionsGauge?.set({ status: 'connected' }, sockets);
      
      // Reset subscription metrics
      this.subscriptionsGauge?.reset();
      
      // Get all rooms and count subscriptions
      const rooms = (this.io.sockets.adapter as any).rooms;
      if (rooms) {
        Object.entries(rooms).forEach(([room, sockets]) => {
          if (sockets && typeof sockets === 'object' && 'size' in sockets) {
            this.subscriptionsGauge?.set({ channel: room }, (sockets as Set<any>).size);
          }
        });
      }
    } catch (error) {
      logger.error('Error collecting WebSocket metrics:', error);
    }
  }

  private async collectRedisMetrics(): Promise<void> {
    try {
      // Get Redis info
      const info = await this.redis.info();
      const lines = info.split('\r\n');
      
      // Parse Redis info
      const redisInfo: Record<string, string> = {};
      lines.forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            redisInfo[key] = value;
          }
        }
      });

      // Set Redis metrics
      if (redisInfo.used_memory) {
        this.redisMemoryGauge?.set({ type: 'used' }, parseInt(redisInfo.used_memory, 10));
      }
      if (redisInfo.used_memory_rss) {
        this.redisMemoryGauge?.set({ type: 'rss' }, parseInt(redisInfo.used_memory_rss, 10));
      }
      if (redisInfo.connected_clients) {
        this.redisConnectedClientsGauge?.set(parseInt(redisInfo.connected_clients, 10));
      }
    } catch (error) {
      logger.error('Error collecting Redis metrics:', error);
    }
  }

  // Public methods to update metrics from other parts of the application
  public incrementMessageCounter(type: string, status: 'success' | 'error' = 'success'): void {
    this.messagesCounter?.inc({ type, status });
  }

  public recordMessageSize(size: number): void {
    this.messageSizeHistogram?.observe(size);
  }

  public incrementErrorCounter(type: string = 'unknown'): void {
    this.errorsCounter?.inc({ type });
  }

  public setCustomMetric(name: string, value: number): void {
    const metric = this.customMetrics.get(name);
    if (metric) {
      if (metric instanceof Gauge) {
        metric.set(value);
      } else {
        logger.warn(`Cannot set value for non-Gauge metric: ${name}`);
      }
    }
  }

  public incrementCustomMetric(name: string, value: number = 1): void {
    const metric = this.customMetrics.get(name);
    if (metric) {
      if (metric instanceof Counter) {
        metric.inc(value);
      } else if (metric instanceof Gauge) {
        metric.inc(value);
      } else {
        logger.warn(`Cannot increment non-Counter/Gauge metric: ${name}`);
      }
    }
  }

  public async getMetrics(): Promise<string> {
    return register.metrics();
  }

  public stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    register.clear();
    logger.info('Metrics collection stopped');
  }
}
