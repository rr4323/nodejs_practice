# WebSocket Service

Real-time WebSocket service for the Stock Analytics Platform, handling live stock updates, alerts, and notifications.

## Features

- Real-time stock price updates via WebSockets
- Stock price simulation with realistic market behavior
- Room-based subscriptions for efficient broadcasting
- Redis adapter for horizontal scaling
- Graceful startup and shutdown
- Comprehensive logging
- Health check endpoint

## Prerequisites

- Node.js >= 16.0.0
- Redis server
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the configuration:

```bash
cp .env.example .env
```

## Configuration

Edit the `.env` file to configure the service:

```env
# Server
PORT=4005
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
```

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API

### WebSocket Events

#### Client to Server

- `subscribe:stock` - Subscribe to stock updates
  ```typescript
  {
    symbol: string; // Stock symbol (e.g., 'AAPL')
  }
  ```

- `unsubscribe:stock` - Unsubscribe from stock updates
  ```typescript
  {
    symbol: string; // Stock symbol (e.g., 'AAPL')
  }
  ```

#### Server to Client

- `stock:update` - Stock price update
  ```typescript
  {
    symbol: string;      // Stock symbol
    price: number;        // Current price
    change: number;       // Price change
    changePercent: number; // Price change percentage
    timestamp: number;    // Unix timestamp
    volume: number;       // Trading volume
    open: number;         // Opening price
    high: number;         // Daily high
    low: number;         // Daily low
    close: number;       // Previous close
  }
  ```

- `stock:alert` - Stock alert
  ```typescript
  {
    id: string;         // Alert ID
    type: string;        // Alert type (e.g., 'PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE')
    symbol: string;      // Stock symbol
    price: number;       // Current price
    timestamp: string;   // ISO timestamp
    message: string;     // Human-readable alert message
  }
  ```

- `subscription:confirmed` - Subscription confirmation
  ```typescript
  {
    symbol: string;    // Stock symbol
    success: boolean;   // Subscription status
  }
  ```

- `unsubscription:confirmed` - Unsubscription confirmation
  ```typescript
  {
    symbol: string;    // Stock symbol
    success: boolean;   // Unsubscription status
  }
  ```

### HTTP Endpoints

- `GET /health` - Health check
  ```json
  {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```

## Testing with the Example Client

1. Start the WebSocket service:

```bash
npm run dev
```

2. In a new terminal, run the example client:

```bash
ts-node examples/client.ts
```

3. You should see real-time stock updates in the console.

## Monitoring

### Logs

Logs are written to:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### Metrics

Basic metrics are available via the `/health` endpoint.

## Deployment

### Docker

```bash
docker build -t stock-websocket-service .
docker run -p 4005:4005 --env-file .env stock-websocket-service
```

### Kubernetes

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: websocket-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: websocket-service
  template:
    metadata:
      labels:
        app: websocket-service
    spec:
      containers:
      - name: websocket-service
        image: stock-websocket-service:latest
        ports:
        - containerPort: 4005
        envFrom:
        - configMapRef:
            name: websocket-service-config
---
apiVersion: v1
kind: Service
metadata:
  name: websocket-service
spec:
  selector:
    app: websocket-service
  ports:
  - port: 4005
    targetPort: 4005
  type: LoadBalancer
```

## License

MIT
