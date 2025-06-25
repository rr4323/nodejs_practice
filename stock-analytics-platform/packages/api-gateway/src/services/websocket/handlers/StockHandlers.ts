import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { 
  WebSocketUser, 
  StockUpdateEvent, 
  Subscription, 
  WebSocketMessage,
  WebSocketEvents,
  WebSocketError 
} from '../types';
import { logger } from '../../../utils/logger';

const STOCK_UPDATE_INTERVAL = 5000; // 5 seconds
const STOCK_SUBSCRIPTION_KEY = 'stock:subscriptions';
const STOCK_PRICE_HISTORY_KEY = 'stock:history';

export class StockHandlers {
  private io: Server;
  private redis: Redis;
  private stockUpdateInterval: NodeJS.Timeout | null = null;
  private stockSymbols: Set<string> = new Set();
  private activeSubscriptions: Map<string, Set<string>> = new Map();

  constructor(io: Server, redis: Redis) {
    this.io = io;
    this.redis = redis;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    // Initialize stock data and start updates
    this.initializeStockData()
      .then(() => {
        this.startStockUpdates();
        logger.info('Stock handlers initialized');
      })
      .catch((error) => {
        logger.error('Failed to initialize stock data:', error);
      });
  }

  private async initializeStockData() {
    // Initialize with some default stocks
    const defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    
    for (const symbol of defaultStocks) {
      this.stockSymbols.add(symbol);
      await this.initializeStockPrice(symbol);
    }
    
    logger.info(`Initialized ${defaultStocks.length} stocks`);
  }

  private async initializeStockPrice(symbol: string) {
    const basePrice = this.generateRandomPrice(100, 500);
    const initialData = {
      symbol,
      price: basePrice,
      open: basePrice,
      high: basePrice,
      low: basePrice,
      volume: 0,
      timestamp: Date.now(),
    };

    await this.redis.hset(
      `${STOCK_PRICE_HISTORY_KEY}:${symbol}`, 
      'current', 
      JSON.stringify(initialData)
    );
  }

  public async handleSubscribe(socket: Socket, symbol: string, user: WebSocketUser) {
    try {
      // Validate stock symbol
      if (!this.stockSymbols.has(symbol)) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }

      // Track subscription in memory
      if (!this.activeSubscriptions.has(symbol)) {
        this.activeSubscriptions.set(symbol, new Set());
      }
      this.activeSubscriptions.get(symbol)?.add(socket.id);

      // Track subscription in Redis for persistence
      const subscription: Subscription = {
        symbol,
        userId: user.userId,
        socketId: socket.id,
        subscribedAt: new Date(),
        filters: {}
      };

      await this.redis.sadd(
        `${STOCK_SUBSCRIPTION_KEY}:${symbol}`, 
        JSON.stringify(subscription)
      );

      // Join room for this stock
      socket.join(`stock:${symbol}`);

      // Send current price
      const currentPrice = await this.getCurrentStockPrice(symbol);
      if (currentPrice) {
        this.sendStockUpdate(socket, currentPrice);
      }

      // Send subscription confirmation
      socket.emit(WebSocketEvents.STOCK_SUBSCRIBE, {
        success: true,
        symbol,
        message: `Subscribed to ${symbol} updates`
      });

      logger.info(`User ${user.userId} subscribed to ${symbol}`);
    } catch (error) {
      this.handleError(socket, 'subscribe_error', error);
    }
  }

  public async handleUnsubscribe(socket: Socket, symbol: string, user: WebSocketUser) {
    try {
      // Remove from memory
      if (this.activeSubscriptions.has(symbol)) {
        this.activeSubscriptions.get(symbol)?.delete(socket.id);
      }

      // Remove from Redis
      const subscriptions = await this.redis.smembers(`${STOCK_SUBSCRIPTION_KEY}:${symbol}`);
      for (const sub of subscriptions) {
        const subscription = JSON.parse(sub) as Subscription;
        if (subscription.userId === user.userId && subscription.socketId === socket.id) {
          await this.redis.srem(
            `${STOCK_SUBSCRIPTION_KEY}:${symbol}`, 
            sub
          );
          break;
        }
      }

      // Leave room
      socket.leave(`stock:${symbol}`);

      // Send confirmation
      socket.emit(WebSocketEvents.STOCK_UNSUBSCRIBE, {
        success: true,
        symbol,
        message: `Unsubscribed from ${symbol} updates`
      });

      logger.info(`User ${user.userId} unsubscribed from ${symbol}`);
    } catch (error) {
      this.handleError(socket, 'unsubscribe_error', error);
    }
  }

  private async getCurrentStockPrice(symbol: string) {
    const data = await this.redis.hget(
      `${STOCK_PRICE_HISTORY_KEY}:${symbol}`, 
      'current'
    );
    return data ? JSON.parse(data) : null;
  }

  private async updateStockPrices() {
    for (const symbol of this.stockSymbols) {
      try {
        const currentData = await this.getCurrentStockPrice(symbol);
        if (!currentData) continue;

        // Generate new price with some randomness
        const changePercent = (Math.random() * 2 - 1) * 0.5; // -0.5% to +0.5%
        const newPrice = currentData.price * (1 + changePercent / 100);
        const volume = Math.floor(Math.random() * 10000) + 1000;

        const update: StockUpdateEvent = {
          symbol,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((newPrice - currentData.price).toFixed(2)),
          changePercent: parseFloat((changePercent).toFixed(4)),
          volume,
          timestamp: Date.now()
        };

        // Update current price in Redis
        await this.redis.hset(
          `${STOCK_PRICE_HISTORY_KEY}:${symbol}`,
          'current',
          JSON.stringify(update)
        );

        // Store in history (keep last 100 updates per stock)
        await this.redis.lpush(
          `${STOCK_PRICE_HISTORY_KEY}:${symbol}:history`,
          JSON.stringify(update)
        );
        await this.redis.ltrim(
          `${STOCK_PRICE_HISTORY_KEY}:${symbol}:history`,
          0,
          99
        );

        // Broadcast update to all subscribers
        this.broadcastStockUpdate(symbol, update);
      } catch (error) {
        logger.error(`Error updating stock ${symbol}:`, error);
      }
    }
  }

  private broadcastStockUpdate(symbol: string, update: StockUpdateEvent) {
    this.io.to(`stock:${symbol}`).emit(WebSocketEvents.STOCK_UPDATE, update);
  }

  private sendStockUpdate(socket: Socket, update: StockUpdateEvent) {
    socket.emit(WebSocketEvents.STOCK_UPDATE, update);
  }

  private generateRandomPrice(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  private startStockUpdates() {
    if (this.stockUpdateInterval) {
      clearInterval(this.stockUpdateInterval);
    }
    this.stockUpdateInterval = setInterval(
      () => this.updateStockPrices(),
      STOCK_UPDATE_INTERVAL
    );
  }

  private handleError(socket: Socket, code: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse: WebSocketError = {
      code,
      message: errorMessage,
      timestamp: Date.now()
    };
    
    socket.emit(WebSocketEvents.ERROR, errorResponse);
    logger.error(`WebSocket error (${code}):`, error);
  }

  public async cleanupUserConnections(userId: string) {
    // Clean up user subscriptions across all stocks
    for (const [symbol, socketIds] of this.activeSubscriptions.entries()) {
      // Remove from memory
      const socketIdsArray = Array.from(socketIds);
      for (const socketId of socketIdsArray) {
        // Remove from Redis
        const subscriptions = await this.redis.smembers(`${STOCK_SUBSCRIPTION_KEY}:${symbol}`);
        for (const sub of subscriptions) {
          const subscription = JSON.parse(sub) as Subscription;
          if (subscription.userId === userId) {
            await this.redis.srem(
              `${STOCK_SUBSCRIPTION_KEY}:${symbol}`, 
              sub
            );
          }
        }
      }
      
      // Update in-memory tracking
      this.activeSubscriptions.set(
        symbol, 
        new Set(Array.from(socketIds).filter(id => !socketIdsArray.includes(id)))
      );
    }
  }

  public stop() {
    if (this.stockUpdateInterval) {
      clearInterval(this.stockUpdateInterval);
      this.stockUpdateInterval = null;
    }
  }
}
