export interface WebSocketUser {
  userId: string;
  socketId: string;
  joinedAt: Date;
  lastActive: Date;
  subscriptions: string[];
  metadata?: Record<string, any>;
}

export interface StockUpdateEvent {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface StockAlertEvent {
  id: string;
  type: 'PRICE_ALERT' | 'VOLUME_ALERT' | 'TREND_ALERT' | 'NEWS_ALERT' | 'CUSTOM_ALERT';
  symbol: string;
  condition: string;
  value: any;
  timestamp: number;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
  timestamp: number;
  requestId?: string;
}

export interface Subscription {
  symbol: string;
  userId: string;
  socketId: string;
  subscribedAt: Date;
  filters?: Record<string, any>;
}

export interface WebSocketError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export const WebSocketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  
  // Stock events
  STOCK_UPDATE: 'stock:update',
  STOCK_HISTORY: 'stock:history',
  STOCK_SUBSCRIBE: 'stock:subscribe',
  STOCK_UNSUBSCRIBE: 'stock:unsubscribe',
  STOCK_SUBSCRIPTION_UPDATE: 'stock:subscription:update',
  
  // Alert events
  ALERT_CREATE: 'alert:create',
  ALERT_UPDATE: 'alert:update',
  ALERT_DELETE: 'alert:delete',
  ALERT_TRIGGER: 'alert:trigger',
  
  // User events
  USER_SUBSCRIBE: 'user:subscribe',
  USER_UNSUBSCRIBE: 'user:unsubscribe',
  USER_TYPING: 'user:typing',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // System events
  SYSTEM_MESSAGE: 'system:message',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  
  // Chat events
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',
  
  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETE: 'notification:delete',
} as const;
