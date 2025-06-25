# 📈 Stock Market Analytics & Prediction Platform

A real-time stock market analytics platform built with Node.js, TypeScript, Kafka, WebSockets, and AI/ML.

## 🚀 Features

- **Real-time** stock price updates via WebSockets
- **Event-driven architecture** using Apache Kafka
- **Real-time analytics** with OLAP-like aggregations
- **AI-powered** stock trend predictions
- **Microservices** architecture for scalability
- **GraphQL API** for flexible data querying
- **Modern React** dashboard

## 🏗️ Project Structure

```
stock-analytics-platform/
├── packages/
│   ├── common/           # Shared types and utilities
│   ├── api-gateway/      # GraphQL API Gateway
│   ├── user-service/     # Authentication & user management
│   ├── market-data-service/  # Stock data collection
│   ├── analytics-service/    # Real-time analytics
│   ├── ai-service/          # ML model training/inference
│   └── websocket-service/    # WebSocket server
└── frontend/             # React dashboard
```

## 🛠️ Prerequisites

- Node.js >= 16.x
- Docker & Docker Compose
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-analytics-platform
   ```

2. **Start infrastructure**
   ```bash
   # Start Kafka, Zookeeper, Redis, and Kafka-UI
   npm run docker:up
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start all services in development mode**
   ```bash
   npm run start:dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Kafka UI: http://localhost:8080
   - GraphQL Playground: http://localhost:4000/graphql

## 📦 Services

### 1. API Gateway (GraphQL)
- Port: 4000
- GraphQL endpoint: /graphql
- WebSocket endpoint: /subscriptions

### 2. User Service
- Port: 4001
- REST API for authentication and user management

### 3. Market Data Service
- Port: 4002
- Fetches and processes real-time stock data
- Publishes to Kafka topics

### 4. Analytics Service
- Port: 4003
- Processes real-time analytics
- Subscribes to Kafka topics

### 5. AI Service
- Port: 4004
- Trains and serves ML models
- Provides prediction endpoints

### 6. WebSocket Service
- Port: 4005
- Handles real-time client connections
- Broadcasts updates to connected clients

## 🧪 Testing

```bash
# Run tests for all packages
npm test

# Run tests for a specific package
npm test -w packages/<package-name>
```

## 🐳 Docker

```bash
# Start all services in detached mode
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f
```

## 📝 License

MIT
