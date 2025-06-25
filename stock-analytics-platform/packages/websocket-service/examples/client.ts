import { io, Socket } from 'socket.io-client';

// Configuration
const WS_URL = 'http://localhost:4005';
const SYMBOL = 'AAPL';

// Connect to the WebSocket server
const socket: Socket = io(WS_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  query: {
    userId: 'test-user-123',
  },
});

// Connection handling
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Subscribe to stock updates
  socket.emit('subscribe:stock', SYMBOL);
  console.log(`📈 Subscribed to ${SYMBOL} updates`);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');});

// Handle stock updates
socket.on('stock:update', (data: any) => {
  const { symbol, price, change, changePercent } = data;
  const changeSymbol = change >= 0 ? '📈' : '📉';
  console.log(`\n${symbol} $${price.toFixed(2)} ${changeSymbol} ${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(2)}%)`);
});

// Handle stock alerts
socket.on('stock:alert', (alert: any) => {
  console.log(`\n🚨 ALERT: ${alert.message}`);
});

// Handle subscription confirmations
socket.on('subscription:confirmed', (data: any) => {
  console.log(`✅ ${data.symbol} subscription confirmed`);
});

// Handle errors
socket.on('error', (error: any) => {
  console.error('WebSocket error:', error);
});

// Handle reconnection attempts
socket.on('reconnect_attempt', (attempt: number) => {
  console.log(`Attempting to reconnect (${attempt})...`);
});

// Handle reconnection
socket.on('reconnect', (attempt: number) => {
  console.log(`✅ Reconnected after ${attempt} attempts`);
  // Resubscribe after reconnection
  socket.emit('subscribe:stock', SYMBOL);
});

// Handle reconnection error
socket.on('reconnect_error', (error: any) => {
  console.error('Reconnection error:', error);
});

// Handle reconnection failed
socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nDisconnecting...');
  socket.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`\n👂 Listening for ${SYMBOL} updates... (Press Ctrl+C to exit)`);
