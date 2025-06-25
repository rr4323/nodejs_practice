import { Resolvers } from './types/generated';
import { logger } from '../utils/logger';

// Mock data - replace with actual service calls
const mockStockData = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 175.34,
  change: 1.23,
  changePercent: 0.71,
  timestamp: new Date().toISOString(),
  volume: 12345678,
  open: 174.5,
  high: 176.2,
  low: 174.1,
  close: 175.34,
};

const resolvers: Resolvers = {
  Query: {
    status: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    
    stock: (_, { symbol }) => {
      // In a real app, fetch from your market data service
      return {
        ...mockStockData,
        symbol,
        timestamp: new Date().toISOString(),
      };
    },
    
    stockHistory: async (_, { symbol, from, to }) => {
      // In a real app, fetch historical data from your database or service
      logger.info(`Fetching history for ${symbol} from ${from} to ${to}`);
      
      // Mock data - replace with actual data fetching
      const mockHistory = Array(10).fill(0).map((_, i) => ({
        symbol,
        price: 170 + Math.random() * 10,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        volume: Math.floor(Math.random() * 10000000),
        open: 170 + Math.random() * 10,
        high: 170 + Math.random() * 10,
        low: 170 + Math.random() * 10,
        close: 170 + Math.random() * 10,
      }));
      
      return mockHistory;
    },
  },
  
  Mutation: {
    addToWatchlist: (_, { symbol }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      logger.info(`Adding ${symbol} to watchlist for user ${user.id}`);
      
      // In a real app, save to database
      return {
        success: true,
        message: `${symbol} added to watchlist`,
        watchlist: [symbol],
      };
    },
    
    removeFromWatchlist: (_, { symbol }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      logger.info(`Removing ${symbol} from watchlist for user ${user.id}`);
      
      // In a real app, update database
      return {
        success: true,
        message: `${symbol} removed from watchlist`,
        watchlist: [],
      };
    },
  },
  
  Subscription: {
    stockUpdated: {
      subscribe: (_, { symbol }, { pubsub }) => {
        // In a real app, subscribe to a pubsub system like Redis Pub/Sub
        // For now, we'll use a simple interval to simulate updates
        const channel = `STOCK_UPDATED_${symbol}`;
        
        // Simulate stock price updates
        const interval = setInterval(() => {
          pubsub.publish(channel, {
            stockUpdated: {
              symbol,
              price: 170 + Math.random() * 10,
              timestamp: new Date().toISOString(),
              volume: Math.floor(Math.random() * 10000000),
              open: 170 + Math.random() * 10,
              high: 170 + Math.random() * 10,
              low: 170 + Math.random() * 10,
              close: 170 + Math.random() * 10,
            },
          });
        }, 5000);
        
        // Return the async iterator for the subscription
        return pubsub.asyncIterator(channel);
      },
    },
    
    stockAlert: {
      subscribe: (_, { symbol }, { pubsub }) => {
        const channel = `STOCK_ALERT_${symbol}`;
        
        // In a real app, subscribe to alerts from your alerting service
        // This is just a simulation
        const interval = setInterval(() => {
          if (Math.random() > 0.8) { // 20% chance of an alert
            pubsub.publish(channel, {
              stockAlert: {
                id: `alert_${Date.now()}`,
                symbol,
                condition: 'ABOVE',
                value: 180,
                isActive: true,
                createdAt: new Date().toISOString(),
                triggeredAt: new Date().toISOString(),
              },
            });
          }
        }, 10000);
        
        // Clean up on unsubscribe
        return {
          [Symbol.asyncIterator]: () => ({
            next: () => new Promise(() => {}), // Never resolve
            return: () => {
              clearInterval(interval);
              return Promise.resolve({ value: undefined, done: true });
            },
          }),
        };
      },
    },
  },
};

export { resolvers };
