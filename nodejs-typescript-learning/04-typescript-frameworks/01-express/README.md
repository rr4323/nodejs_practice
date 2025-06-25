# Express.js with TypeScript

This directory contains examples and best practices for using Express.js with TypeScript.

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Best Practices](#best-practices)
- [API Documentation](#api-documentation)

## Project Structure

```
src/
├── config/           # Configuration files
│   └── index.ts      # App configuration
├── controllers/      # Route controllers
│   ├── user.controller.ts
│   └── auth.controller.ts
├── middlewares/      # Custom middlewares
│   ├── error.middleware.ts
│   └── auth.middleware.ts
├── models/           # Data models and interfaces
│   ├── user.interface.ts
│   └── user.model.ts
├── routes/           # Route definitions
│   ├── index.ts
│   ├── user.routes.ts
│   └── auth.routes.ts
├── services/         # Business logic
│   ├── user.service.ts
│   └── auth.service.ts
├── types/            # Custom type definitions
│   └── express/      # Extended Express types
├── utils/            # Utility functions
│   ├── logger.ts
│   └── apiError.ts
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install express cors helmet morgan dotenv
   npm install -D typescript @types/node @types/express @types/cors @types/morgan ts-node-dev
   ```

2. Initialize TypeScript:
   ```bash
   npx tsc --init
   ```

3. Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "es2020",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "moduleResolution": "node"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "**/*.test.ts"]
   }
   ```

## Running the Application

1. Development mode with hot-reload:
   ```bash
   npx ts-node-dev --respawn --transpile-only src/server.ts
   ```

2. Production build:
   ```bash
   npm run build
   node dist/server.js
   ```

## Features

- Type-safe Express.js routes
- Error handling middleware
- Request validation with Joi
- JWT authentication
- Logging with Winston
- Environment configuration
- API documentation with Swagger
- Docker support
- Unit tests with Jest
- Integration tests with Supertest

## Best Practices

1. **Controllers**: Keep them thin, move business logic to services
2. **Services**: Handle business logic and data access
3. **Models**: Define data structures and database schemas
4. **Routes**: Define API endpoints and connect to controllers
5. **Middlewares**: Use for cross-cutting concerns
6. **Error Handling**: Centralized error handling
7. **Validation**: Validate request data
8. **Environment Variables**: Use for configuration
9. **Logging**: Structured logging for better observability
10. **Testing**: Write unit and integration tests

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

### Example API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)

## Testing

Run tests:
```bash
npm test
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Docker Support

Build and run with Docker:
```bash
docker build -t express-typescript-app .
docker run -p 3000:3000 express-typescript-app
```

## License

MIT
