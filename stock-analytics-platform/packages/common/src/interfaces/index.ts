import { StockData, StockPrediction, StockAlert, User, AuthPayload } from '../types/stock';

export interface IStockService {
  getStockData(symbol: string): Promise<StockData>;
  getStockHistory(symbol: string, from: Date, to: Date): Promise<StockData[]>;
  subscribeToStockUpdates(symbols: string[], callback: (data: StockData) => void): Promise<void>;
}

export interface IAnalyticsService {
  processStockUpdate(data: StockData): Promise<void>;
  getStockAnalytics(symbol: string, timeframe: string): Promise<any>;
  getPopularStocks(limit: number): Promise<Array<{ symbol: string; count: number }>>;
}

export interface IAIService {
  trainModel(symbol: string, historicalData: StockData[]): Promise<void>;
  predict(symbol: string, historicalData: StockData[]): Promise<StockPrediction>;
  getModelStatus(symbol: string): Promise<{ status: string; accuracy?: number }>;
}

export interface IUserService {
  register(email: string, password: string, name: string): Promise<AuthPayload>;
  login(email: string, password: string): Promise<AuthPayload>;
  getUser(id: string): Promise<User>;
  updateWatchlist(userId: string, symbols: string[]): Promise<User>;
  createAlert(userId: string, alert: Omit<StockAlert, 'id' | 'userId' | 'createdAt' | 'triggeredAt' | 'isActive'>): Promise<StockAlert>;
  getUserAlerts(userId: string): Promise<StockAlert[]>;
}

export interface IWebSocketService {
  broadcastStockUpdate(data: StockData): void;
  broadcastStockAlert(alert: StockAlert): void;
  broadcastStockPrediction(prediction: StockPrediction): void;
  getConnectedClients(): number;
}

export interface IMarketDataService {
  fetchStockData(symbols: string[]): Promise<StockData[]>;
  startStreaming(symbols: string[], interval?: number): void;
  stopStreaming(): void;
}
