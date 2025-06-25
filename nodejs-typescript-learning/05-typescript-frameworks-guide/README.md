# TypeScript with Frameworks - Comprehensive Guide

## Table of Contents
1. [React + TypeScript](#react--typescript)
   - [Advanced Component Patterns](#advanced-component-patterns)
   - [State Management](#state-management)
   - [Hooks with TypeScript](#hooks-with-typescript)
   - [Performance Optimization](#performance-optimization)
   - [Testing](#testing)
2. [Node.js + TypeScript](#nodejs--typescript)
3. [Express + TypeScript](#express--typescript)
4. [GraphQL + TypeScript](#graphql--typescript)
5. [Build and Deployment](#build-and-deployment)
6. [Webpack Configuration](#webpack-configuration)
7. [Babel Integration](#babel-integration)
8. [Bundle Optimization](#bundle-optimization)
9. [Production Builds](#production-builds)

## React + TypeScript

### Setup
```bash
# Create a new React app with TypeScript
npx create-react-app my-app --template typescript

# Or add TypeScript to existing project
npm install --save typescript @types/node @types/react @types/react-dom @types/jest

# Additional useful types
npm install --save @types/react-router-dom @types/styled-components @testing-library/react-hooks
```

### Key Concepts

#### Type Definitions
- `React.FC` vs `React.VFC` (for components without children)
- Props and State typing
- Event handling types
- Generic components
- Component composition patterns

#### Advanced TypeScript Features
- Type guards
- Type inference
- Mapped types
- Conditional types
- Utility types (Partial, Pick, Omit, etc.)

### Advanced Component Patterns

#### 1. Generic Components
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function GenericList<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<GenericList 
  items={users} 
  keyExtractor={user => user.id}
  renderItem={user => <div>{user.name}</div>} 
/>
```

#### 2. Compound Components with Context
```tsx
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const Tabs: React.FC<{ defaultActive: string }> = ({ children, defaultActive }) => {
  const [activeTab, setActiveTab] = React.useState(defaultActive);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const Tab: React.FC<{ id: string }> = ({ children, id }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  return (
    <button 
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
};

const TabPanel: React.FC<{ id: string }> = ({ children, id }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  return context.activeTab === id ? <div>{children}</div> : null;
};

// Usage
<Tabs defaultActive="profile">
  <Tab id="profile">Profile</Tab>
  <Tab id="settings">Settings</Tab>
  
  <TabPanel id="profile">Profile Content</TabPanel>
  <TabPanel id="settings">Settings Content</TabPanel>
</Tabs>
```

### State Management

#### 1. Context API with Type Safety
```tsx
// types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
}

export type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' };

// AppContext.tsx
const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (state: AppState, action: AppAction): AppState => {
      switch (action.type) {
        case 'LOGIN':
          return { ...state, user: action.payload, isAuthenticated: true };
        case 'LOGOUT':
          return { ...state, user: null, isAuthenticated: false };
        case 'TOGGLE_THEME':
          return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
        default:
          return state;
      }
    },
    {
      user: null,
      theme: 'light',
      isAuthenticated: false,
    }
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
```

### Hooks with TypeScript

#### 1. Custom Hooks with Type Safety
```tsx
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

### Performance Optimization

#### 1. Memoization
```tsx
import React, { useMemo, useCallback } from 'react';

interface UserListProps {
  users: User[];
  onUserSelect: (userId: string) => void;
  searchTerm: string;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelect, searchTerm }) => {
  // Memoize filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Memoize callback
  const handleSelect = useCallback((userId: string) => {
    onUserSelect(userId);
  }, [onUserSelect]);

  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id} onClick={() => handleSelect(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
};

export default React.memo(UserList);
```

### Testing

#### 1. Component Testing with Testing Library
```tsx
// UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('displays user information', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={handleEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(handleEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

#### 2. Custom Hook Testing
```tsx
// useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should use initial value', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should update localStorage when state changes', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.getItem('test')).toBe(JSON.stringify('updated'));
  });
});
```

# Node.js + TypeScript

## Project Setup and Configuration

### 1. Initial Setup

```bash
# Create project directory and initialize package.json
mkdir node-ts-app
cd node-ts-app
npm init -y

# Install TypeScript and required types
npm install typescript ts-node @types/node --save-dev

# Install development tools
npm install --save-dev ts-node-dev nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Initialize TypeScript config
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true

# Create project structure
mkdir -p src/{config,controllers,middleware,models,routes,services,utils,types}
touch src/index.ts
```

### 2. Configuration Files

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

#### package.json Scripts

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### .eslintrc.js

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
  },
};
```

### 3. Basic Server with TypeScript

```typescript
// src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;

// src/config/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  // Add other environment variables here
}

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
};

export default config;

// src/index.ts
import http from 'http';
import config from './config/config';
import logger from './config/logger';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 
    message: 'Hello from TypeScript Node.js server!',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  }));
});

const startServer = async () => {
  try {
    // Initialize database connection here
    // await connectToDatabase();
    
    server.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: {} | null | undefined) => {
  logger.error('Unhandled Rejection at:', reason);
  process.exit(1);
});

// Start the server
startServer();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

# Express + TypeScript: Building RESTful APIs

## 1. Project Setup

### 1.1 Initial Setup

```bash
# Create project directory
mkdir express-ts-api
cd express-ts-api

# Initialize package.json
npm init -y

# Install production dependencies
npm install express cors helmet morgan dotenv express-rate-limit express-validator multer swagger-ui-express yamljs http-status-codes

# Install development dependencies
npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan @types/multer @types/express-rate-limit @types/swagger-ui-express tsconfig-paths ts-node-dev

# Initialize TypeScript with recommended settings
npx tsc --init --target es2020 --module commonjs --outDir dist --rootDir src --strict --esModuleInterop --skipLibCheck --forceConsistentCasingInFileNames

# Create project structure
mkdir -p src/{config,controllers,middlewares,routes,services,utils,types,validations,interfaces,docs,uploads}

# Create entry point
touch src/app.ts src/server.ts
```

### 1.2 Project Structure

```
src/
├── config/           # Configuration files
│   ├── app.ts        # Application configuration
│   ├── db.ts         # Database configuration
│   ├── env.ts        # Environment variables
│   └── swagger.ts    # Swagger/OpenAPI config
├── controllers/      # Route controllers
│   ├── user.controller.ts
│   ├── auth.controller.ts
│   └── file.controller.ts
├── interfaces/       # TypeScript interfaces
│   ├── user.interface.ts
│   └── request.interface.ts
├── middlewares/      # Custom middlewares
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   ├── auth.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── upload.middleware.ts
├── routes/           # Route definitions
│   ├── index.ts
│   ├── user.routes.ts
│   ├── auth.routes.ts
│   └── file.routes.ts
├── services/         # Business logic
│   ├── user.service.ts
│   ├── auth.service.ts
│   └── file.service.ts
├── types/            # Type declarations
│   └── express/      # Extended Express types
├── utils/            # Utility functions
│   ├── logger.ts
│   ├── apiError.ts
│   └── response.ts
├── validations/      # Request validation schemas
│   ├── user.validation.ts
│   └── auth.validation.ts
├── docs/             # API documentation
│   └── swagger.yaml
├── uploads/          # File uploads directory
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## 2. Middleware Patterns

### 2.1 Authentication Middleware

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/apiError';
import { User } from '../models/User';

/**
 * Middleware to authenticate users using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from header or cookies
    let token: string | undefined;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in! Please log in to get access.');
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat!)) {
      throw new UnauthorizedError('User recently changed password! Please log in again.');
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict routes to specific roles
 * @param roles Array of allowed roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('You are not logged in! Please log in to get access.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
};

// Usage in routes
import { authenticate, restrictTo } from '../middlewares/auth.middleware';

router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

router.patch(
  '/:id/role',
  authenticate,
  restrictTo('admin'),
  userController.updateUserRole
);
```

### 2.2 Request Validation Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/apiError';

/**
 * Middleware to validate request data using express-validator
 * @param validations Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError('Validation failed', errorMessages);
  };
};

// src/validations/user.validation.ts
import { body, param, query } from 'express-validator';

export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
];

export const userIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

export const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sort')
    .optional()
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9_]+(\s+(asc|desc))?$/)
    .withMessage('Invalid sort parameter')
];

// Usage in routes
import { validate } from '../middlewares/validation.middleware';
import { createUserValidation, userIdParam, paginationQuery } from '../validations/user.validation';

router.post(
  '/',
  validate(createUserValidation),
  userController.createUser
);

router.get(
  '/',
  validate(paginationQuery),
  userController.getUsers
);

router.get(
  '/:id',
  validate(userIdParam),
  userController.getUser
);
```

### 2.3 File Upload Middleware

```typescript
// src/middlewares/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/apiError';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpe?g|png|gif|pdf|docx?|xlsx?/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE) * 1024 * 1024, // Convert MB to bytes
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => 
  (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError(`File too large. Max size is ${env.MAX_FILE_SIZE}MB`));
        }
        return next(new BadRequestError(err.message));
      }
      next();
    });
  };

// Middleware for multiple files
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError(`One or more files are too large. Max size is ${env.MAX_FILE_SIZE}MB`));
        }
        return next(new BadRequestError(err.message));
      }
      next();
    });
  };

// Usage in routes
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware';

// Single file upload
router.post(
  '/upload-avatar',
  authenticate,
  uploadSingle('avatar'),
  userController.uploadAvatar
);

// Multiple files upload
router.post(
  '/upload-documents',
  authenticate,
  uploadMultiple('documents', 5),
  userController.uploadDocuments
);
```

## 3. Error Handling

### 3.1 Custom Error Class

```typescript
// src/utils/apiError.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: any[],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common error types
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors?: any[]) {
    super(400, message, true, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, true);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(404, message, true);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation Error', errors: any[] = []) {
    super(400, message, true, errors);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message, true);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(500, message, false);
  }
}
```

### 3.2 Error Handling Middleware

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    url: req.originalUrl,
    method: req.method,
    ...(req.user && { userId: req.user.id }),
  });

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid token. Please log in again!');
  } else if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Your token has expired! Please log in again.');
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }));
    err = new ValidationError('Validation failed', errors);
  }

  // Handle duplicate field errors (MongoDB)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value!`;
    err = new ConflictError(message);
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${(err as any).path}: ${(err as any).value}`;
    err = new BadRequestError(message);
  }

  // Default to 500 Internal Server Error
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  const errors = (err as ApiError).errors;

  // Don't leak error details in production
  const errorResponse = env.NODE_ENV === 'development' ? {
    status: 'error',
    message,
    errors,
    stack: err.stack,
    ...(req.requestId && { requestId: req.requestId }),
  } : {
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : message,
    ...(errors && { errors }),
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
};

/**
 * Async error handling wrapper
 * @param fn Async controller function
 */
export const catchAsync = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Usage in controllers
export const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});
```

### 3.3 Request Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, align, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const baseLog = `[${timestamp}] ${level}: ${stack || message}`;
  
  // Pretty print metadata if it exists
  const metaString = Object.keys(meta).length > 0 
    ? '\n' + JSON.stringify(meta, null, 2)
    : '';
    
  return baseLog + metaString;
});

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  align(),
  logFormat
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Create logger instance
const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  defaultMeta: { service: 'api-service' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
  exitOnError: false,
});

// If we're not in production, log to the console as well
if (env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

export { logger };
```

## 4. Rate Limiting and API Security

### 4.1 Rate Limiting Middleware

```typescript
// src/middlewares/rateLimit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/apiError';
import { env } from '../config/env';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Custom rate limit store for express-rate-limit
 */
const customStore: rateLimit.Store = {
  increment: (key: string, callback) => {
    const now = Date.now();
    const rateLimitKey = `rate-limit:${key}`;
    
    if (!rateLimitStore.has(rateLimitKey)) {
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + env.RATE_LIMIT_WINDOW_MS,
      });
      
      // Clean up old entries
      setTimeout(() => {
        rateLimitStore.delete(rateLimitKey);
      }, env.RATE_LIMIT_WINDOW_MS);
      
      return callback(null, {
        totalHits: 1,
        resetTime: now + env.RATE_LIMIT_WINDOW_MS,
      });
    }
    
    const entry = rateLimitStore.get(rateLimitKey)!;
    
    if (now > entry.resetTime) {
      // Reset counter if window has passed
      entry.count = 1;
      entry.resetTime = now + env.RATE_LIMIT_WINDOW_MS;
    } else {
      // Increment counter
      entry.count += 1;
    }
    
    rateLimitStore.set(rateLimitKey, entry);
    
    return callback(null, {
      totalHits: entry.count,
      resetTime: entry.resetTime,
    });
  },
};

/**
 * Rate limiter middleware
 * @param options Rate limiting options
 */
export const rateLimiter = (options: Partial<rateLimit.Options> = {}) => {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    handler: (req, res, next, options) => {
      next(
        new TooManyRequestsError(
          `Too many requests, please try again later.`,
          [
            {
              field: 'rateLimit',
              message: `Rate limit exceeded. Try again in ${Math.ceil(
                (options.resetTime - Date.now()) / 1000
              )} seconds`,
            },
          ]
        )
      );
    },
    ...options,
    store: customStore,
  });
};

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

// Usage in routes
import { rateLimiter, authLimiter } from '../middlewares/rateLimit.middleware';

// Apply to all routes
app.use(rateLimiter());

// Apply to specific routes
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
```

### 4.2 Security Middleware

```typescript
// src/middlewares/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Set security HTTP headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-cdn.com'],
      styleSrc: ["'self'", 'trusted-cdn.com', "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
      fontSrc: ["'self'", 'trusted-cdn.com'],
      connectSrc: ["'self'", 'api.example.com'],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some CDNs
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: true },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 15552000, includeSubDomains: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
});

/**
 * Enable CORS
 */
export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

/**
 * Prevent HTTP Parameter Pollution
 */
export const httpParamProtection = hpp({
  whitelist: [
    'filter',
    'sort',
    'fields',
    'page',
    'limit',
    'search',
    'status',
  ],
});

/**
 * Sanitize request data
 */
export const sanitizeRequest = [
  // Sanitize request body, query, and params
  mongoSanitize(),
  
  // Prevent NoSQL injection
  (req: Request, res: Response, next: NextFunction) => {
    const clean = (obj: any): any => {
      if (!obj) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(clean);
      }
      
      if (typeof obj === 'object') {
        const cleanObj: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          // Remove any keys that start with $
          if (key.startsWith('$')) {
            continue;
          }
          cleanObj[key] = clean(value);
        }
        return cleanObj;
      }
      
      return obj;
    };
    
    // Clean request body, query, and params
    req.body = clean(req.body);
    req.query = clean(req.query) as any;
    req.params = clean(req.params);
    
    next();
  },
];

// Usage in app.ts
import {
  securityHeaders,
  corsOptions,
  httpParamProtection,
  sanitizeRequest,
} from './middlewares/security.middleware';

// Apply security middleware
app.use(securityHeaders);
app.use(corsOptions);
app.use(httpParamProtection);
app.use(...sanitizeRequest);
```

### 4.3 Request Sanitization

```typescript
// src/middlewares/sanitize.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { body, query, param, ValidationChain } from 'express-validator';
import { validate } from './validation.middleware';

/**
 * Sanitize request body
 */
export const sanitizeBody = (fields: string | string[]): ValidationChain[] => {
  const fieldsArray = Array.isArray(fields) ? fields : [fields];
  
  return fieldsArray.map(field => 
    body(field)
      .trim()
      .escape()
      .stripLow()
  );
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (fields: string | string[]): ValidationChain[] => {
  const fieldsArray = Array.isArray(fields) ? fields : [fields];
  
  return fieldsArray.map(field => 
    query(field)
      .trim()
      .escape()
      .stripLow()
  );
};

/**
 * Sanitize route parameters
 */
export const sanitizeParams = (fields: string | string[]): ValidationChain[] => {
  const fieldsArray = Array.isArray(fields) ? fields : [fields];
  
  return fieldsArray.map(field => 
    param(field)
      .trim()
      .escape()
      .stripLow()
  );
};

// Usage in routes
import { sanitizeBody, sanitizeQuery, sanitizeParams } from '../middlewares/sanitize.middleware';

// Sanitize request data
router.post(
  '/users',
  [
    ...sanitizeBody(['name', 'email', 'bio']),
    // ... validation rules
  ],
  validate,
  userController.createUser
);

router.get(
  '/search',
  [
    ...sanitizeQuery('q'),
    query('q').notEmpty().withMessage('Search query is required'),
  ],
  validate,
  searchController.search
);

router.get(
  '/users/:id',
  [
    ...sanitizeParams('id'),
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],
  validate,
  userController.getUser
);
```

## 5. API Documentation with Swagger/OpenAPI

### 5.1 Swagger Configuration

```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version,
      description: 'API Documentation',
      contact: {
        name: 'API Support',
        url: 'https://example.com/support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Please authenticate',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Please provide a valid email',
                  },
                ],
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '5f8d0f3d9d8f3b0017a1b6d7',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Please provide a valid email',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/interfaces/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 */
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
    defaultModelsExpandDepth: -1, // Hide schemas by default
  },
};

// Serve Swagger UI
const serveSwaggerUI = swaggerUi.serve;
const setupSwaggerUI = swaggerUi.setup(specs, swaggerUiOptions);

export { serveSwaggerUI, setupSwaggerUI };

// Usage in app.ts
import { serveSwaggerUI, setupSwaggerUI } from './config/swagger';

// Serve API documentation
app.use('/api-docs', serveSwaggerUI, setupSwaggerUI);
```

### 5.2 API Documentation with Decorators

```typescript
// src/decorators/api.docs.decorator.ts
import 'reflect-metadata';

type ApiDocsOptions = {
  summary?: string;
  description?: string;
  tags?: string[];
  security?: Array<{ [securityScheme: string]: string[] }>;
  deprecated?: boolean;
  requestBody?: any;
  responses?: {
    [statusCode: number]: {
      description: string;
      content?: {
        [contentType: string]: {
          schema: any;
          example?: any;
        };
      };
    };
  };
};

export function ApiDocs(options: ApiDocsOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata = Reflect.getMetadata('api:docs', target) || {};
    
    metadata[propertyKey] = {
      ...metadata[propertyKey],
      ...options,
    };
    
    Reflect.defineMetadata('api:docs', metadata, target);
    
    return descriptor;
  };
}

// Usage in controllers
import { ApiDocs } from '../decorators/api.docs.decorator';

class UserController {
  @ApiDocs({
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'List of users',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
      },
      401: {
        $ref: '#/components/responses/UnauthorizedError',
      },
    },
  })
  async getUsers(req: Request, res: Response) {
    const users = await userService.findAll();
    res.json(users);
  }
}
```

### 5.3 API Versioning

```typescript
// src/middlewares/version.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * API versioning middleware
 * Supports:
 * - URL path versioning: /api/v1/users
 * - Header versioning: Accept: application/vnd.company.v1+json
 * - Query parameter versioning: /api/users?version=1
 */
export const apiVersion = (options: {
  defaultVersion?: string;
  headerName?: string;
  queryName?: string;
} = {}) => {
  const {
    defaultVersion = '1',
    headerName = 'Accept',
    queryName = 'version',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    let version = defaultVersion;
    
    // Check URL path first (e.g., /api/v1/users)
    const pathVersionMatch = req.path.match(/\/v(\d+)(\/|$)/);
    if (pathVersionMatch) {
      version = pathVersionMatch[1];
    } 
    // Check Accept header (e.g., Accept: application/vnd.company.v1+json)
    else if (req.headers[headerName.toLowerCase()]) {
      const acceptHeader = req.headers[headerName.toLowerCase()] as string;
      const versionMatch = acceptHeader.match(/v(\d+)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    }
    // Check query parameter (e.g., /api/users?version=1)
    else if (req.query[queryName]) {
      version = req.query[queryName] as string;
    }
    
    // Set version in request object
    req.apiVersion = version;
    
    // Set response headers
    res.set('API-Version', version);
    
    next();
  };
};

// Usage in app.ts
import { apiVersion } from './middlewares/version.middleware';

// Apply API versioning
app.use(apiVersion({
  defaultVersion: '1',
  headerName: 'Accept',
  queryName: 'version',
}));

// Versioned routes
app.use('/api', (req, res, next) => {
  const version = req.apiVersion || '1';
  
  switch (version) {
    case '1':
      return require('./routes/v1')(req, res, next);
    case '2':
      return require('./routes/v2')(req, res, next);
    default:
      return res.status(400).json({
        status: 'error',
        message: `API version ${version} is not supported`,
      });
  }
});
```

## 6. Testing Express Applications

### 6.1 Test Setup

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/migrations/',
    '/src/seeders/',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};

// src/__tests__/setup.ts
import { createConnection, getConnection } from 'typeorm';
import { createServer, Server } from 'http';
import { app } from '../app';
import { config } from '../config/env';
import { connectionOptions } from '../config/database';

let server: Server;

// Global test setup
beforeAll(async () => {
  // Create test database connection
  await createConnection({
    ...connectionOptions,
    name: 'default',
    database: 'test_db',
    synchronize: true,
    dropSchema: true,
    logging: false,
  });

  // Start test server
  server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  
  // @ts-ignore
  global.testServer = server;
  // @ts-ignore
  global.testBaseUrl = `http://localhost:${server.address().port}`;
});

// Cleanup after all tests
afterAll(async () => {
  // Close server
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  
  // Close database connection
  const conn = getConnection();
  if (conn.isConnected) {
    await conn.close();
  }
});

// Reset database before each test
beforeEach(async () => {
  const conn = getConnection();
  const entities = conn.entityMetadatas;
  
  for (const entity of entities) {
    const repository = conn.getRepository(entity.name);
    await repository.query(`TRUNCATE \"${entity.tableName}\" CASCADE;`);
  }
});
```

### 6.2 Unit Testing

```typescript
// src/__tests__/unit/services/user.service.test.ts
import { UserService } from '../../../src/services/user.service';
import { User } from '../../../src/entities/User';
import { getRepository } from 'typeorm';
import { createTestConnection } from '../../test-utils';

describe('UserService', () => {
  let userService: UserService;
  
  beforeAll(async () => {
    await createTestConnection();
    userService = new UserService();
  });
  
  afterAll(async () => {
    const conn = getConnection();
    await conn.close();
  });
  
  beforeEach(async () => {
    // Clear users table before each test
    await getRepository(User).clear();
  });
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
    });
    
    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      // Create first user
      await userService.createUser(userData);
      
      // Try to create user with same email
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email already in use'
      );
    });
  });
  
  describe('findUserById', () => {
    it('should find user by id', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      const newUser = await userService.createUser(userData);
      const foundUser = await userService.findUserById(newUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(newUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });
    
    it('should return null if user not found', async () => {
      const user = await userService.findUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });
});
```

### 6.3 Integration Testing

```typescript
// src/__tests__/integration/auth.controller.test.ts
import { getConnection } from 'typeorm';
import request from 'supertest';
import { app } from '../../../src/app';
import { User } from '../../../src/entities/User';
import { createTestUser } from '../../test-utils';

describe('AuthController', () => {
  beforeAll(async () => {
    await createTestConnection();
  });
  
  afterAll(async () => {
    const conn = getConnection();
    await conn.close();
  });
  
  beforeEach(async () => {
    // Clear users table before each test
    await getConnection().getRepository(User).clear();
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.password).toBeUndefined();
    });
    
    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid-email', password: '123' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    
    beforeEach(async () => {
      // Create a test user
      await createTestUser(testUser);
    });
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });
    
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong-password',
        })
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
```

### 6.4 E2E Testing with TestCafe

```typescript
// tests/e2e/auth.test.ts
import { Selector } from 'testcafe';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

fixture`Authentication`
  .page`${baseUrl}/login`;

test('User can log in with valid credentials', async t => {
  // Fill in the login form
  await t
    .typeText('#email', 'test@example.com')
    .typeText('#password', 'password123')
    .click('button[type="submit"]')
    
    // Verify successful login redirect
    .expect(Selector('h1').innerText).eql('Dashboard')
    .expect(Selector('.user-email').innerText).eql('test@example.com');
});

test('User sees error with invalid credentials', async t => {
  await t
    .typeText('#email', 'test@example.com')
    .typeText('#password', 'wrong-password')
    .click('button[type="submit"]')
    
    // Verify error message is displayed
    .expect(Selector('.error-message').innerText).contains('Invalid credentials');
});

// tests/e2e/api.test.ts
import { RequestLogger } from 'testcafe';

const apiUrl = process.env.API_URL || 'http://localhost:3000/api';

fixture`API Tests`;

test('API returns 401 for unauthenticated requests', async t => {
  const response = await t.request({
    url: `${apiUrl}/protected-route`,
    method: 'GET',
    // No authentication token provided
  });
  
  await t.expect(response.status).eql(401);
});

test('API returns 200 for authenticated requests', async t => {
  // First, log in to get a token
  const loginResponse = await t.request({
    url: `${apiUrl}/auth/login`,
    method: 'POST',
    body: {
      email: 'test@example.com',
      password: 'password123',
    },
  });
  
  const { token } = loginResponse.body;
  
  // Use the token to make an authenticated request
  const protectedResponse = await t.request({
    url: `${apiUrl}/protected-route`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  await t.expect(protectedResponse.status).eql(200);
});
```

### 6.5 Mocking and Stubs

```typescript
// src/__tests__/unit/services/payment.service.test.ts
import { PaymentService } from '../../../src/services/payment.service';
import { createPaymentIntent } from '../../../src/utils/stripe';
import { User } from '../../../src/entities/User';

// Mock the Stripe module
jest.mock('../../../src/utils/stripe', () => ({
  createPaymentIntent: jest.fn(),
}));

// Mock the User repository
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    save: jest.fn(),
  }),
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
  });
  
  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // Mock user data
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      } as User;
      
      // Mock Stripe response
      (createPaymentIntent as jest.Mock).mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
        status: 'succeeded',
      });
      
      // Call the service method
      const result = await paymentService.processPayment({
        userId: mockUser.id,
        amount: 1000, // $10.00
        currency: 'usd',
      });
      
      // Verify the result
      expect(result).toEqual({
        success: true,
        paymentId: 'pi_123',
        status: 'succeeded',
      });
      
      // Verify Stripe was called with correct parameters
      expect(createPaymentIntent).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        metadata: { userId: 'user-123' },
      });
    });
    
    it('should handle payment failure', async () => {
      // Mock Stripe to throw an error
      (createPaymentIntent as jest.Mock).mockRejectedValue(
        new Error('Payment failed')
      );
      
      // Verify the error is properly handled
      await expect(
        paymentService.processPayment({
          userId: 'user-123',
          amount: 1000,
          currency: 'usd',
        })
      ).rejects.toThrow('Payment processing failed');
    });
  });
});
```

### 6.6 Test Utilities

```typescript
// src/__tests__/test-utils.ts
import { Connection, createConnection, getConnection } from 'typeorm';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import { config } from '../config/env';

export const createTestConnection = async (): Promise<Connection> => {
  return createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test_db',
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: ['src/entities/**/*.ts'],
  });
};

export const createTestUser = async (userData: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const userRepository = getConnection().getRepository(User);
  
  const hashedPassword = await bcrypt.hash(
    userData.password, 
    config.SALT_ROUNDS
  );
  
  const user = userRepository.create({
    ...userData,
    password: hashedPassword,
    emailVerified: true,
  });
  
  return userRepository.save(user);
};

export const getTestToken = async (email: string, password: string): Promise<string> => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
    
  return response.body.token;
};

export const withAuth = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
```

## 7. Deployment and DevOps

### 7.1 Containerization with Docker

```dockerfile
# Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

# Copy source code
COPY src/ ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy non-JavaScript files
COPY public/ ./public
COPY views/ ./views
COPY .env.production .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=5s \
            --retries=3 \
            CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "dist/app.js"]

# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db:5432/mydb
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  db:
    image: postgres:13-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### 7.2 CI/CD with GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  IMAGE_NAME: my-express-app

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6-alpine
        ports:
          - 6379:6379
        options: --entrypoint redis-server --requirepass test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install Dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Run Tests
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://test:test@localhost:5432/test_db
        JWT_SECRET: test-secret
        REDIS_URL: redis://:test@localhost:6379
      run: |
        npm test
        npm run test:coverage
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        file: ./coverage/lcov.info
        fail_ci_if_error: false

  build-and-push:
    name: Build and Push Docker Image
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Extract metadata (tags, labels) for Docker
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,format=long
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: ${{ github.event_name != 'pull_request' }}
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to Staging
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USERNAME }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /path/to/staging
          docker-compose -f docker-compose.staging.yml pull
          docker-compose -f docker-compose.staging.yml up -d --force-recreate
          docker system prune -f

  deploy-production:
    name: Deploy to Production
    needs: build-and-push
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to Production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USERNAME }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /path/to/production
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d --force-recreate
          docker system prune -f
```

### 7.3 Environment Configuration

```typescript
// config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define environment variables schema
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required().description('Database connection URL'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('Minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('Days after which refresh tokens expire'),
    REDIS_URL: Joi.string().description('Redis connection URL'),
    SMTP_HOST: Joi.string().description('SMTP server host'),
    SMTP_PORT: Joi.number().description('SMTP server port'),
    SMTP_USERNAME: Joi.string().description('SMTP username'),
    SMTP_PASSWORD: Joi.string().description('SMTP password'),
    EMAIL_FROM: Joi.string().description('Email address to send emails from'),
    AWS_ACCESS_KEY_ID: Joi.string().description('AWS access key ID'),
    AWS_SECRET_ACCESS_KEY: Joi.string().description('AWS secret access key'),
    AWS_REGION: Joi.string().description('AWS region'),
    S3_BUCKET: Joi.string().description('S3 bucket name'),
    SENTRY_DSN: Joi.string().description('Sentry DSN for error tracking'),
    LOG_LEVEL: Joi.string()
      .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
      .default('info'),
  })
  .unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL,
    ssl: envVars.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: envVars.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    },
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    s3Bucket: envVars.S3_BUCKET,
  },
  sentry: {
    dsn: envVars.SENTRY_DSN,
  },
  logLevel: envVars.LOG_LEVEL,
};

export default config;
```

### 7.4 Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: express-app
  namespace: production
  labels:
    app: express-app
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: express-app
      tier: backend
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: express-app
        tier: backend
    spec:
      containers:
      - name: app
        image: yourusername/express-ts-app:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        envFrom:
        - secretRef:
            name: app-secrets
        - configMapRef:
            name: app-config
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 1
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
      imagePullSecrets:
      - name: docker-registry-cred
      nodeSelector:
        node-role.kubernetes.io/worker: "true"
      tolerations:
      - key: "dedicated"
        operator: "Equal"
        value: "app"
        effect: "NoSchedule"
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - express-app
              topologyKey: kubernetes.io/hostname
```

### 7.5 Monitoring and Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}` +
      (info.stack ? `\n${info.stack}` : '')
  )
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format,
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason) => {
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Perform cleanup and exit process if needed
  process.exit(1);
});

export { logger };
```

### 7.6 Health Check Script

A robust health check script is essential for containerized applications to ensure they're running correctly. Here's a Node.js script that can be used with Docker and Kubernetes:

```javascript
// healthcheck.js
#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

// Configuration with environment variable fallbacks
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const TIMEOUT = process.env.HEALTHCHECK_TIMEOUT_MS || 5000; // 5 seconds default
const HEALTH_ENDPOINT = process.env.HEALTH_ENDPOINT || '/health';

// Parse URL to handle different formats
let healthUrl;
try {
  const url = new URL(HEALTH_ENDPOINT);
  healthUrl = HEALTH_ENDPOINT;
} catch (e) {
  healthUrl = `http://${HOST}:${PORT}${HEALTH_ENDPOINT.startsWith('/') ? '' : '/'}${HEALTH_ENDPOINT}`;
}

// Set up request timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

// Make the health check request
const req = http.get(healthUrl, { signal: controller.signal }, (res) => {
  clearTimeout(timeoutId);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const isHealthy = res.statusCode === 200 && 
                      (response.status === 'ok' || response.status === 'healthy' || 
                       response.status === 'up' || response.healthy === true);
      
      if (isHealthy) {
        console.log(`Health check passed: ${res.statusCode} - ${JSON.stringify(response)}`);
        process.exit(0);
      } else {
        console.error(`Health check failed with status ${res.statusCode}: ${JSON.stringify(response)}`);
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing health check response:', e.message);
      process.exit(1);
    }
  });
});

// Handle errors
req.on('error', (e) => {
  clearTimeout(timeoutId);
  console.error(`Health check request failed: ${e.message}`);
  process.exit(1);
});

// Set timeout for the entire request
req.setTimeout(TIMEOUT, () => {
  req.destroy(new Error(`Request timed out after ${TIMEOUT}ms`));
});

// Ensure the request is sent
req.end();
```

#### Usage in Docker

```dockerfile
# In your Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "healthcheck.js"]
```

#### Usage in Kubernetes

```yaml
# In your deployment.yaml
livenessProbe:
  exec:
    command: ["node", "healthcheck.js"]
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
```

### 7.7 Security Best Practices

1. **Dependency Security**
   - Use `npm audit` to check for vulnerabilities
   - Update dependencies regularly
   - Use Dependabot or Renovate for automated dependency updates

2. **API Security**
   - Implement rate limiting
   - Use Helmet.js for security headers
   - Enable CORS with specific origins
   - Validate and sanitize all user input
   - Use parameterized queries to prevent SQL injection

3. **Authentication & Authorization**
   - Use JWT with secure settings
   - Implement refresh token rotation
   - Set secure and httpOnly flags on cookies
   - Use CSRF protection for state-changing operations

4. **Infrastructure Security**
   - Use private networks for database access
   - Implement network policies in Kubernetes
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Enable audit logging

5. **Monitoring and Alerting**
   - Set up centralized logging
   - Implement distributed tracing
   - Configure alerts for security events
   - Monitor for suspicious activities

6. **Compliance**
   - Follow OWASP Top 10
   - Implement GDPR/CCPA compliance
   - Regular security audits
   - Penetration testing

This comprehensive deployment and DevOps setup ensures your Express + TypeScript application is secure, scalable, and maintainable in production environments.

### 2.1 Extending Express Types

```typescript
// src/types/express/index.d.ts
import { UserDocument } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      requestId?: string;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export {}; // This file needs to be a module
```

### 2.2 Environment Configuration

```typescript
// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().default('5'), // in MB
  RATE_LIMIT_WINDOW_MS: z.string().default('15'), // in minutes
  RATE_LIMIT_MAX: z.string().default('100'), // requests per window
});

type EnvVars = z.infer<typeof envSchema>;

// Validate environment variables
const validatedEnv = envSchema.safeParse(process.env);

if (!validatedEnv.success) {
  console.error('❌ Invalid environment variables:', validatedEnv.error.format());
  process.exit(1);
}

export const env = validatedEnv.data as EnvVars;
```

### 2.3 Express Application Configuration

```typescript
// src/config/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer, Server } from 'http';
import { rateLimit } from 'express-rate-limit';
import { env } from './env';
import { errorHandler } from '../middlewares/error.middleware';
import { notFoundHandler } from '../middlewares/notFound.middleware';
import { router } from '../routes';
import { logger } from '../utils/logger';

class App {
  public app: Application;
  public server: Server;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(env.PORT, 10);
    this.server = createServer(this.app);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: env.NODE_ENV === 'production' ? /yourdomain\.com$/ : '*',
      credentials: true,
    }));

    // Request logging
    if (env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }

    // Request parsing
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS) * 60 * 1000, // Convert to milliseconds
      max: parseInt(env.RATE_LIMIT_MAX),
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', message: 'Too many requests, please try again later.' },
    });
    this.app.use(limiter);

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.requestId = Math.random().toString(36).substr(2, 9);
      next();
    });
  }

  private initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use('/api/v1', router);

    // 404 handler
    this.app.use(notFoundHandler);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.server.listen(this.port, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${this.port}`);
    });
  }

  public getServer() {
    return this.server;
  }
}

export default new App();
```

### 2.4 Server Entry Point

```typescript
// src/server.ts
import app from './app';
import { connectDB } from './config/db';

// Connect to database
connectDB()
  .then(() => {
    // Start server
    app.listen();
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  
  if (config.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // Routes
  app.use('/api', router);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // 404 handler
  app.use(notFoundHandler);
  
  // Error handler
  app.use(errorHandler);

  return app;
};

// Only start server if this file is run directly
if (require.main === module) {
  const app = createApp();
  const PORT = config.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default createApp;
```

### Type-Safe Controllers

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiError } from '../utils/apiError';
import { User } from '../types';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request<{}, {}, Omit<User, 'id'>>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newUser = await userService.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request<{ id: string }, {}, Partial<Omit<User, 'id'>>>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updatedUser = await userService.update(req.params.id, req.body);
      if (!updatedUser) {
        throw new ApiError(404, 'User not found');
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const success = await userService.delete(req.params.id);
      if (!success) {
        throw new ApiError(404, 'User not found');
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```

### Type-Safe Services

```typescript
// src/services/user.service.ts
import { User, CreateUserDTO, UpdateUserDTO } from '../types';

export class UserService {
  private users: User[] = []; // In-memory store for demo
  private idCounter = 1;

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const newUser: User = {
      id: (this.idCounter++).toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }
}
```

### Type-Safe Routes

```typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema } from '../utils/validation';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Protected routes
router.use(authenticate);

router.get('/', userController.getUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.put(
  '/:id',
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);
router.delete(
  '/:id',
  authorize('admin'),
  userController.deleteUser.bind(userController)
);

export { router as userRoutes };
```

### Type-Safe Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnySchema, ValidationError } from 'yup';
import { ApiError } from '../utils/apiError';

export const validate = (schema: AnySchema): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      }, { abortEarly: false });
      return next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return next(new ApiError(400, 'Validation Error', error.errors));
      }
      return next(error);
    }
  };
};

// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error(err);
  
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
};
```

### Type-Safe Configuration

```typescript
// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Define and validate environment variables
const envVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/mydb',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
} as const;

// Type for the config object
type EnvConfig = typeof envVars;

export const config: EnvConfig = envVars;
```

### Type Definitions

```typescript
// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'password'>>;

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}
```

### Running the Application

```bash
# Development
npm install -D ts-node-dev

# Add to package.json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "jest"
}

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Testing with Jest

```typescript
// __tests__/user.controller.test.ts
import request from 'supertest';
import { createApp } from '../src/app';
import { UserService } from '../src/services/user.service';

// Mock the UserService
jest.mock('../src/services/user.service');

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('User Controller', () => {
  let app: Express.Application;
  let userService: jest.Mocked<UserService>;

  beforeAll(() => {
    userService = new UserService() as jest.Mocked<UserService>;
    app = createApp();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      userService.findAll.mockResolvedValue([mockUser]);
      
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      }]);
    });
  });

  // Add more test cases...
});
```

### Best Practices

1. **Type Safety**
   - Always define interfaces for your request/response objects
   - Use TypeScript's utility types (Partial, Pick, Omit, etc.)
   - Extend Express types when needed

2. **Error Handling**
   - Create custom error classes
   - Use a centralized error handling middleware
   - Return consistent error responses

3. **Validation**
   - Validate all incoming requests
   - Use libraries like Joi or Yup for schema validation
   - Sanitize user input

4. **Security**
   - Use helmet for security headers
   - Implement rate limiting
   - Use environment variables for sensitive data
   - Implement proper authentication/authorization

5. **Project Structure**
   - Separate concerns (controllers, services, routes)
   - Use dependency injection for better testability
   - Keep business logic out of route handlers

6. **Testing**
   - Write unit tests for services and utilities
   - Write integration tests for API endpoints
   - Mock external dependencies in tests

7. **Performance**
   - Implement request validation early in the middleware chain
   - Use async/await properly
   - Implement caching where appropriate

8. **Documentation**
   - Document your API endpoints
   - Use tools like Swagger/OpenAPI
   - Keep your documentation up to date

## GraphQL + TypeScript

### Project Setup

```bash
# Create a new directory and initialize project
mkdir graphql-typescript-api
cd graphql-typescript-api
npm init -y

# Install dependencies
npm install apollo-server-express graphql type-graphql typeorm reflect-metadata pg
npm install -D typescript ts-node @types/node @types/graphql ts-node-dev

# TypeScript configuration
npx tsc --init

# Create project structure
mkdir -p src/{entities,resolvers,utils,config,types}
```

### Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.ts        # Database configuration
│   └── env.ts       # Environment variables
├── entities/         # TypeORM entities
│   ├── User.ts
│   └── Post.ts
├── resolvers/        # GraphQL resolvers
│   ├── user.resolver.ts
│   ├── post.resolver.ts
│   └── index.ts
├── types/            # Custom type definitions
│   └── context.ts
├── utils/            # Utility functions
│   ├── auth.ts
│   └── validation.ts
├── app.ts            # Express + Apollo Server setup
└── server.ts         # Server entry point
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "lib": ["es2018"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### TypeORM Entity Example

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Field, ObjectType, ID } from 'type-graphql';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  name: string;

  @Column()
  password: string;

  @Field()
  @Column({ default: 'user' })
  role: string;

  @Field(() => [Post])
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### GraphQL Resolver Example

```typescript
// src/resolvers/user.resolver.ts
import { Resolver, Query, Arg, Mutation, Ctx, Authorized } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types/context';
import { RegisterInput } from '../types/RegisterInput';
import { LoginInput } from '../types/LoginInput';
import { AuthResponse } from '../types/AuthResponse';
import { Service } from 'typedi';
import { UserService } from '../services/user.service';

@Resolver()
@Service()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @Authorized(['admin'])
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  @Authorized()
  async me(@Ctx() { user }: MyContext): Promise<User | undefined> {
    return this.userService.findById(user!.id);
  }

  @Mutation(() => AuthResponse)
  async register(
    @Arg('input') input: RegisterInput
  ): Promise<AuthResponse> {
    return this.userService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() { res }: MyContext
  ): Promise<AuthResponse> {
    return this.userService.login(input, res);
  }
}
```

### Type Definitions

```typescript
// src/types/context.ts
import { Request, Response } from 'express';
import { User } from '../entities/User';

export interface MyContext {
  req: Request;
  res: Response;
  user?: {
    id: string;
    role: string;
  };
}

// src/types/RegisterInput.ts
import { InputType, Field } from 'type-graphql';

@InputType()
export class RegisterInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

// src/types/AuthResponse.ts
import { Field, ObjectType } from 'type-graphql';
import { User } from '../entities/User';

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
```

### Apollo Server Setup

```typescript
// src/app.ts
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import express from 'express';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { UserResolver } from './resolvers/user.resolver';
import { PostResolver } from './resolvers/post.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { MyContext } from './types/context';
import { verify } from 'jsonwebtoken';
import { config } from './config/env';
import { createAccessToken, createRefreshToken } from './utils/auth';
import { sendRefreshToken } from './utils/sendRefreshToken';

export const createApp = async () => {
  // Initialize TypeORM connection
  await createConnection({
    type: 'postgres',
    url: config.DATABASE_URL,
    logging: true,
    synchronize: true, // Disable in production
    entities: [User],
  });

  // Build TypeGraphQL schema
  const schema = await buildSchema({
    resolvers: [UserResolver, PostResolver, AuthResolver],
    validate: false,
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }): MyContext => ({ req, res }),
    introspection: true,
    playground: true,
  });

  const app = express();

  // Apply middleware
  server.applyMiddleware({ app, cors: false });

  // Refresh token route
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: '' });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: '' });
    }

    // Token is valid, send back access token
    const user = await User.findOne({ id: payload.userId });
    if (!user) {
      return res.send({ ok: false, accessToken: '' });
    }

    // Check token version
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' });
    }

    // Update refresh token
    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  return { app, server };
};

// Start server if this file is run directly
if (require.main === module) {
  (async () => {
    const { app, server } = await createApp();
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
    });
  })();
}

export default createApp;
```

### Authentication Middleware

```typescript
// src/middlewares/auth.middleware.ts
import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/context';
import { verify } from 'jsonwebtoken';
import { config } from '../config/env';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, config.ACCESS_TOKEN_SECRET);
    context.user = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error('Not authenticated');
  }

  return next();
};
```

### Running the Application

```bash
# Add to package.json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typeorm": "ts-node-dev -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
  }
}

# Start development server
npm run dev

# The GraphQL playground will be available at:
# http://localhost:4000/graphql
```

### Example Queries and Mutations

```graphql
# Register a new user
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}

# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}

# Get current user (requires authentication)
query Me {
  me {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Get all users (admin only)
query Users {
  users {
    id
    name
    email
    createdAt
  }
}
```

### Best Practices

1. **Type Safety**
   - Use TypeGraphQL decorators for type safety
   - Define input and output types explicitly
   - Use TypeORM for database operations with TypeScript support

2. **Authentication & Authorization**
   - Implement JWT authentication
   - Use refresh tokens for better security
   - Implement role-based access control

3. **Error Handling**
   - Create custom error classes
   - Handle errors consistently across the application
   - Return meaningful error messages to clients

4. **Performance**
   - Implement DataLoader to solve N+1 problem
   - Use caching where appropriate
   - Optimize database queries

5. **Testing**
   - Write unit tests for resolvers
   - Test authentication flows
   - Mock external services

6. **Security**
   - Validate all inputs
   - Sanitize user input
   - Implement rate limiting
   - Use environment variables for sensitive data

7. **Documentation**
   - Document your GraphQL schema
   - Add comments to resolvers and types
   - Consider using tools like GraphQL Code Generator

8. **Production Readiness**
   - Disable playground in production
   - Enable query complexity analysis
   - Implement query depth limiting
   - Set appropriate CORS policies

## Build and Deployment

### Build Configuration

#### TypeScript Build Process

1. **Basic Build Setup**

```json
// tsconfig.prod.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "noEmitOnError": true,
    "sourceMap": false,
    "inlineSourceMap": false,
    "declaration": true,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "node_modules"]
}
```

2. **Build Scripts**

```json
// package.json
{
  "scripts": {
    "build": "tsc -p tsconfig.prod.json",
    "build:watch": "tsc -w -p tsconfig.prod.json",
    "clean": "rimraf dist",
    "prebuild": "npm run clean",
    "start:prod": "NODE_ENV=production node dist/src/index.js",
    "docker:build": "docker build -t your-app .",
    "docker:run": "docker run -p 3000:3000 your-app"
  }
}
```

### Babel Integration

Babel can be used alongside TypeScript to enable experimental features and better browser compatibility.

#### 1. Install Dependencies

```bash
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-runtime
npm install --save @babel/runtime core-js@3
```

#### 2. Babel Configuration

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: {
          browsers: ['>0.25%', 'not dead'],
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    // Add other plugins as needed
  ],
};
```

#### 3. Update TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowJs": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true, // Let Babel handle the emitting of files
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 4. Update Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      // ... other rules
    ],
  },
  // ... rest of config
};
```

### Bundle Optimization

#### 1. Code Splitting

```javascript
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
    runtimeChunk: 'single',
  },
};
```

#### 2. Tree Shaking

Ensure your `package.json` has:

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.svg"
  ]
}
```

#### 3. Module Federation (for Micro Frontends)

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  // ...
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

#### 4. Performance Hints

```javascript
// webpack.config.js
module.exports = {
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    assetFilter: function(assetFilename) {
      return !assetFilename.endsWith('.map');
    }
  },
};
```

#### 5. Caching Strategy

```javascript
// webpack.config.js
module.exports = {
  output: {
    filename: isProduction
      ? '[name].[contenthash:8].js'
      : '[name].bundle.js',
    chunkFilename: isProduction
      ? '[name].[contenthash:8].chunk.js'
      : '[name].chunk.js',
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### 6. Analyze Bundle Size

```bash
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
    }),
  ],
};
```

### Webpack Configuration (for Frontend)

```javascript
// webpack.config.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    chunkFilename: isProduction ? '[id].[contenthash].js' : '[id].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : {},
    }),
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
    ] : []),
  ],
## Bundle Optimization

### Webpack Optimization
```javascript
// webpack.prod.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

## Production Builds

### Package.json Scripts
```json
{
  "scripts": {
    "build": "webpack --config webpack.prod.js",
    "start": "node dist/bundle.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  }
}
```

### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Best Practices

1. **Type Everything**
   - Use interfaces for props, state, and function parameters
   - Avoid using `any` type

2. **Code Organization**

### 1. Feature-Based Structure

Organize your code by features rather than file types to keep related code together:

```
src/
  features/
    auth/
      components/     # Auth-related components
      hooks/          # Custom hooks for auth
      services/       # API calls and services
      types/          # TypeScript types/interfaces
      utils/          # Utility functions
      index.ts        # Public API of the feature
    dashboard/
      components/
      hooks/
      services/
      types/
      utils/
      index.ts
  shared/             # Shared components and utilities
    components/       # Reusable components
    hooks/            # Global hooks
    utils/            # Utility functions
    types/            # Global types
    constants/        # Global constants
  App.tsx             # Main app component
  main.tsx            # App entry point
  routes.tsx          # Route definitions
  global.d.ts         # Global type declarations
```

### 2. Absolute Imports

Configure your project to use absolute imports for better maintainability:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"]
    }
  }
}

// jsconfig.json (for JavaScript projects)
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"]
    }
  }
}
```

Now you can import like this:

```typescript
// Instead of this
import { Button } from '../../../shared/components/Button';

// Do this
import { Button } from '@shared/components/Button';
import { useAuth } from '@features/auth/hooks/useAuth';
```

### 3. Component Structure

#### Atomic Design Principles

```
components/
  atoms/           # Basic building blocks (Button, Input, etc.)
  molecules/       # Groups of atoms (SearchBar, FormField)
  organisms/       # Complex UI components (Header, Sidebar)
  templates/       # Page layouts
  pages/           # Page components
```

#### Component File Structure

For complex components, use a dedicated directory:

```
components/
  UserProfile/
    UserProfile.tsx      # Main component
    UserProfile.styles.ts # Styled-components or CSS modules
    UserProfile.test.tsx  # Tests
    UserProfile.types.ts  # TypeScript types
    index.ts              # Public API (re-export)
```

### 4. State Management Organization

#### Global State (Redux/Context)

```
store/
  features/
    auth/
      authSlice.ts
      authApi.ts
      authSelectors.ts
    users/
      usersSlice.ts
      usersApi.ts
      usersSelectors.ts
  store.ts
  hooks.ts          # Typed hooks (useAppDispatch, useAppSelector)
```

#### Local State

For component-specific state, use:
- `useState` for simple state
- `useReducer` for complex state logic
- Custom hooks for reusable stateful logic

### 5. API Layer Organization

```
services/
  api/
    client.ts          # API client setup (axios/fetch wrapper)
    endpoints/         # API endpoint definitions
      auth.ts
      users.ts
      posts.ts
    types/             # API response/request types
      auth.types.ts
      users.types.ts
    utils/             # API utilities
      queryClient.ts   # React Query client
      errorHandler.ts
```

### 6. Utility Functions

Organize utilities by domain:

```
utils/
  date/
    formatDate.ts
    parseDate.ts
  string/
    truncate.ts
    slugify.ts
  validation/
    schemas.ts    # Yup/Joi schemas
    validators.ts
  formatters/
    currency.ts
    numbers.ts
  hooks/              # Reusable custom hooks
    useDebounce.ts
    useLocalStorage.ts
```

### 7. Type Organization

```
types/
  global.d.ts        # Global type declarations
  api/
    responses/       # API response types
    auth.ts
    users.ts
    index.ts
    requests/        # API request types
      auth.ts
      users.ts
    index.ts
  components/        # Component prop types
    Button.types.ts
    Form.types.ts
  store/             # Redux state types
    rootState.ts
    appDispatch.ts
```

### 8. Environment Configuration

```
config/
  env.ts             # Environment variables validation
  constants.ts       # App-wide constants
  routes.ts          # Route configurations
  theme/
    colors.ts
    typography.ts
    breakpoints.ts
```

### 9. Testing Structure

```
__tests__/
  components/
    Button/
      Button.test.tsx
      Button.snapshot.test.tsx
  features/
    auth/
      authSlice.test.ts
      LoginForm.test.tsx
  utils/
    formatDate.test.ts
  setupTests.ts       # Test setup
  test-utils.tsx      # Custom test utilities
```

### 10. Documentation

```
docs/
  components/       # Component documentation
    Button.md
    Form.md
  features/         # Feature documentation
    auth.md
    dashboard.md
  api/              # API documentation
    endpoints.md
    types.md
  guides/           # Development guides
    setup.md
    testing.md
    deployment.md
```

### Best Practices

1. **Single Responsibility**
   - Each file/module should have a single responsibility
   - Keep files small and focused (ideally under 300-400 lines)

2. **Naming Conventions**
   - Use PascalCase for components (UserProfile.tsx)
   - Use camelCase for utilities and hooks (formatDate.ts, useAuth.ts)
   - Use kebab-case for files that export a single function (get-user-data.ts)

3. **Barrel Exports**
   Use `index.ts` files to create clean public APIs:
   
   ```typescript
   // components/Button/index.ts
   export { default } from './Button';
   export type { ButtonProps } from './Button.types';
   
   // Then import like this:
   import Button, { ButtonProps } from '@/components/Button';
   ```

4. **Circular Dependencies**
   - Avoid circular dependencies between modules
   - Use dependency injection when needed
   - Consider using a mediator pattern for cross-feature communication

5. **Code Splitting**
   - Split code by routes and features
   - Use dynamic imports for heavy components
   - Consider using React.lazy and Suspense for route-based code splitting

6. **Environment-Specific Code**
   ```typescript
   // config/env.ts
   const env = {
     isDevelopment: process.env.NODE_ENV === 'development',
     isProduction: process.env.NODE_ENV === 'production',
     apiUrl: process.env.REACT_APP_API_URL,
   };
   
   export default env;
   ```

7. **Error Boundaries**
   ```typescript
   // components/ErrorBoundary/ErrorBoundary.tsx
   class ErrorBoundary extends React.Component<Props, State> {
     // Implementation...
   }
   
   // Usage in App.tsx
   <ErrorBoundary fallback={<ErrorFallback />}>
     <YourComponent />
   </ErrorBoundary>
   ```

8. **TypeScript Path Aliases with Webpack
   ```javascript
   // webpack.config.js
   const path = require('path');
   
   module.exports = {
     // ...
     resolve: {
       alias: {
         '@': path.resolve(__dirname, 'src/'),
         '@components': path.resolve(__dirname, 'src/components/'),
         '@hooks': path.resolve(__dirname, 'src/hooks/'),
       },
     },
   };
   ```

9. **Module Resolution
   - Prefer named exports over default exports for better tree-shaking
   - Use `export const` for utilities and hooks
   - Group related exports in a single file when they're always used together

10. **Documentation in Code**
    ```typescript
    /**
     * Formats a date string into a human-readable format
     * @param date - The date to format (string, number, or Date object)
     * @param format - The format string (default: 'MM/DD/YYYY')
     * @returns Formatted date string
     * @example
     * formatDate('2023-01-01') // Returns '01/01/2023'
     */
    export function formatDate(date: Date | string | number, format = 'MM/DD/YYYY'): string {
      // Implementation...
    }
    ```

3. **Error Handling**
   - Use custom error classes
   - Implement proper error boundaries in React

4. **Testing**
   - Use Jest with TypeScript
   - Write integration tests
   - Mock external dependencies

5. **Performance Optimization**

### Frontend Optimizations

#### 1. Advanced Code Splitting
```typescript
// Dynamic imports with React.lazy and Suspense
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// Route-based code splitting with React Router v6
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        lazy: () => import('./pages/Dashboard')
      },
      // ... other routes
    ]
  }
]);
```

#### 2. Advanced Caching Strategies
- **Service Workers**: Implement offline-first with Workbox
- **HTTP Caching**: Use Cache-Control headers effectively
- **Browser Storage**: Leverage IndexedDB for large datasets

#### 3. Rendering Optimizations
```typescript
// Use React.memo for component memoization
const MemoizedComponent = React.memo(function MyComponent({ items }) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.id === nextProps.id;
});

// Use useMemo for expensive calculations
const sortedList = useMemo(() => 
  largeList.sort((a, b) => a.value - b.value)
, [largeList]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

#### 4. Virtualization for Large Lists
```bash
# Using react-window
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

function BigList({ items }) {
  return (
    <FixedSizeList
      height={500}
      width={300}
      itemSize={35}
      itemCount={items.length}
    >
      {({ index, style }) => (
        <div style={style}>
          Item {items[index].id}
        </div>
      )}
    </FixedSizeList>
  );
}
```

### Backend Optimizations

#### 1. Database Query Optimization
```typescript
// Use QueryBuilder for complex queries
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('user.isActive = :isActive', { isActive: true })
  .orderBy('user.createdAt', 'DESC')
  .take(10)
  .cache(60000) // Cache for 1 minute
  .getMany();

// Use indexes for frequently queried fields
@Index()
@Column()
email: string;
```

#### 2. Caching Strategies
```typescript
// Redis caching example
import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient();
const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

async function getCachedData(key: string) {
  const cached = await getAsync(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchDataFromDB();
  await setexAsync(key, 3600, JSON.stringify(data)); // Cache for 1 hour
  return data;
}
```

#### 3. Connection Pooling
```typescript
// TypeORM connection pooling
createConnection({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  poolSize: 20, // Adjust based on your database
  // ... other options
});
```

### Build & Bundle Optimizations

#### 1. Advanced Webpack Configuration
```javascript
// webpack.config.js
export default {
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};
```

#### 2. Tree Shaking and Side Effects
```json
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.png",
    "*.jpg"
  ]
}

// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "target": "es2018",
    "strict": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "importHelpers": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Performance Monitoring

#### 1. Real User Monitoring (RUM)
```typescript
// Using web-vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

function logMetric({ name, value }) {
  console.log(`${name}: ${Math.round(value)}ms`);
  // Send to analytics
}

getCLS(logMetric);
getFID(logMetric);
getLCP(logMetric);
```

#### 2. Performance Budgets
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // ...
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### Advanced Caching Techniques

1. **Stale-While-Revalidate**
   ```typescript
   // Using stale-while-revalidate pattern
   async function getData() {
     const cached = getFromCache('data-key');
     if (cached) {
       // Return cached data immediately
       // Then update in the background
       fetchFreshData().then(updateCache);
       return cached;
     }
     // No cache, fetch fresh data
     const freshData = await fetchFreshData();
     updateCache(freshData);
     return freshData;
   }
   ```

2. **Cache Invalidation**
   - Time-based expiration
   - Event-based invalidation
   - Versioned cache keys

### Advanced Bundle Analysis

1. **Webpack Bundle Analyzer**
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   ```

   ```javascript
   // webpack.config.js
   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
   
   module.exports = {
     plugins: [
       new BundleAnalyzerPlugin({
         analyzerMode: 'static',
         reportFilename: 'bundle-analysis.html',
         openAnalyzer: false,
       })
     ]
   };
   ```

2. **Source Map Explorer**
   ```bash
   npx source-map-explorer 'build/static/js/*.js'
   ```

### Advanced TypeScript Optimizations

1. **Type-Only Imports**
   ```typescript
   import type { SomeType } from './types';
   import { someFunction } from './utils';
   ```

2. **Project References**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "composite": true,
       "declaration": true,
       "declarationMap": true
     },
     "references": [
       { "path": "./packages/common" },
       { "path": "./packages/ui" }
     ]
   }
   ```

3. **Incremental Builds**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": "./dist/.tsbuildinfo"
     }
   }
   ```

### Advanced Memory Management

1. **Weak References**
   ```typescript
   const cache = new WeakMap<object, ExpensiveData>();
   
   function getData(obj: object): ExpensiveData {
     if (!cache.has(obj)) {
       cache.set(obj, computeExpensiveData(obj));
     }
     return cache.get(obj)!;
   }
   ```

2. **Object Pooling**
   ```typescript
   class ObjectPool<T> {
     private objects: T[] = [];
     
     constructor(private factory: () => T) {}
     
     acquire(): T {
       return this.objects.pop() || this.factory();
     }
     
     release(obj: T) {
       this.objects.push(obj);
     }
   }
   ```

### Advanced Network Optimization

1. **HTTP/2 Server Push**
   ```typescript
   // With Express
   import spdy from 'spdy';
   import express from 'express';
   
   const app = express();
   
   app.get('/', (req, res) => {
     const stream = res.push('/main.js', {
       request: { accept: '**/*.js' },
       response: { 'content-type': 'application/javascript' }
     });
     stream.end('// Your JavaScript content');
     res.send('<script src="/main.js"></script>');
   });
   
   spdy.createServer({}, app).listen(3000);
   ```

2. **Preload and Prefetch**
   ```html
   <head>
     <link rel="preload" href="critical.css" as="style">
     <link rel="prefetch" href="next-page.js" as="script">
   </head>
   ```

### Advanced Performance Metrics

1. **Custom Performance Marks**
   ```typescript
   // Mark the beginning of a task
   performance.mark('task-start');
   
   // ... task execution ...
   
   // Measure the duration
   performance.mark('task-end');
   performance.measure('Task Duration', 'task-start', 'task-end');
   
   // Get all measurements
   const measures = performance.getEntriesByType('measure');
   measures.forEach(measure => {
     console.log(`${measure.name}: ${measure.duration}ms`);
   });
   ```

2. **Long Tasks API**
   ```typescript
   const observer = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       console.log('Long task:', entry);
     }
   });
   
   observer.observe({ entryTypes: ['longtask'] });
   ```

## Performance Monitoring Tools & Libraries

### Frontend Monitoring

#### 1. Real User Monitoring (RUM)

- **web-vitals**
  ```bash
  npm install web-vitals
  ```
  ```typescript
  import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
  
  function sendToAnalytics(metric) {
    console.log(metric);
    // Send to your analytics
  }
  
  // Track Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  ```

- **Lighthouse CI**
  ```bash
  npm install -D @lhci/cli @lhci/server
  ```
  ```json
  // lighthouserc.json
  {
    "ci": {
      "collect": {
        "staticDistDir": "./build",
        "url": ["http://localhost:3000"]
      },
      "assert": {
        "preset": "lighthouse:no-pwa",
        "assertions": {
          "categories:performance": ["error", {"minScore": 0.9}],
          "categories:accessibility": ["warn", {"minScore": 0.9}]
        }
      }
    }
  }
  ```

#### 2. Error Tracking

- **Sentry**
  ```bash
  npm install @sentry/react @sentry/tracing
  ```
  ```typescript
  import * as Sentry from "@sentry/react";
  import { BrowserTracing } from "@sentry/tracing";
  
  Sentry.init({
    dsn: "YOUR_DSN",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
  
  // Error boundary
  <Sentry.ErrorBoundary fallback={"An error has occurred"}>
    <YourApp />
  </Sentry.ErrorBoundary>
  ```

- **LogRocket**
  ```bash
  npm install --save logrocket
  ```
  ```typescript
  import LogRocket from 'logrocket';
  LogRocket.init('your/app/id');
  
  // Optional: Identify users
  LogRocket.identify('user123', {
    name: 'John Doe',
    email: 'john@example.com'
  });
  ```

#### 3. Performance Profiling

- **React Profiler**
  ```typescript
  import { Profiler } from 'react';
  
  function onRenderCallback(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) {
    console.log('Render metrics:', {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    });
  }
  
  <Profiler id="Navigation" onRender={onRenderCallback}>
    <Navigation />
  </Profiler>
  ```

- **Why Did You Render**
  ```bash
  npm install @welldone-software/why-did-you-render --save-dev
  ```
  ```typescript
  // wdyr.js
  import React from 'react';
  
  if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      logOwnerReasons: true,
      collapseGroups: true,
    });
  }
  
  // Import this file in your app entry point
  ```

### Backend Monitoring

#### 1. Application Performance Monitoring (APM)

- **New Relic**
  ```bash
  npm install newrelic --save
  ```
  ```javascript
  // Add to the first line of your app
  require('newrelic');
  
  // Configure via environment variables or newrelic.js
  ```

- **Datadog APM**
  ```bash
  npm install dd-trace --save
  ```
  ```typescript
  // Initialize at the start of your app
  require('dd-trace').init({
    logInjection: true,
    runtimeMetrics: true,
    service: 'my-service'
  });
  ```

#### 2. Distributed Tracing

- **OpenTelemetry**
  ```bash
  npm install @opentelemetry/sdk-node \
    @opentelemetry/auto-instrumentations-node \
    @opentelemetry/exporter-trace-otlp-http
  ```
  ```typescript
  // tracing.ts
  import { NodeSDK } from '@opentelemetry/sdk-node';
  import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
  import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
  
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [getNodeAutoInstrumentations()]
  });
  
  sdk.start();
  ```

#### 3. Logging & Metrics

- **Winston + ELK Stack**
  ```bash
  npm install winston winston-elasticsearch
  ```
  ```typescript
  import winston from 'winston';
  import 'winston-elasticsearch';
  
  const esTransport = new winston.transports.Elasticsearch({
    level: 'info',
    clientOpts: { node: 'http://localhost:9200' }
  });
  
  const logger = winston.createLogger({
    transports: [esTransport]
  });
  ```

- **Prometheus + Grafana**
  ```bash
  npm install prom-client express-prom-bundle
  ```
  ```typescript
  import express from 'express';
  import promBundle from 'express-prom-bundle';
  import { collectDefaultMetrics } from 'prom-client';
  
  const app = express();
  
  // Add prometheus middleware
  app.use(promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { app: 'my-app' }
  }));
  
  // Collect default metrics
  collectDefaultMetrics();
  
  // Expose metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  ```

### Synthetic Monitoring

- **Playwright**
  ```bash
  npm install @playwright/test
  ```
  ```typescript
  // tests/performance.spec.ts
  import { test, expect } from '@playwright/test';
  
  test('should load homepage within 2 seconds', async ({ page }) => {
    const response = await page.goto('https://example.com');
    expect(response.status()).toBe(200);
    
    // Measure page load time
    const start = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    console.log(`Page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });
  ```

### Self-Hosted Solutions

- **Sentry (Self-Hosted)**
  ```bash
  # Using Docker
  git clone https://github.com/getsentry/onpremise.git
  cd onpremise
  ./install.sh
  ```

- **Grafana + Prometheus + Loki**
  ```yaml
  # docker-compose.yml
  version: '3'
  services:
    prometheus:
      image: prom/prometheus
      ports:
        - "9090:9090"
      volumes:
        - ./prometheus:/etc/prometheus
    
    grafana:
      image: grafana/grafana
      ports:
        - "3000:3000"
      volumes:
        - grafana-storage:/var/lib/grafana
    
    loki:
      image: grafana/loki:latest
      ports:
        - "3100:3100"
      command: -config.file=/etc/loki/local-config.yaml
  
  volumes:
    grafana-storage:
  ```

### Performance Budgets

- **webpack-bundle-analyzer**
  ```bash
  npm install --save-dev webpack-bundle-analyzer
  ```
  ```javascript
  // webpack.config.js
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  
  module.exports = {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analysis.html',
        openAnalyzer: false,
      })
    ]
  };
  ```

- **bundlesize**
  ```bash
  npm install --save-dev bundlesize
  ```
  ```json
  // package.json
  {
    "bundlesize": [
      {
        "path": "./dist/*.js",
        "maxSize": "100 kB"
      }
    ]
  }
  ```

### CI/CD Integration

- **GitHub Actions**
  ```yaml
  # .github/workflows/performance.yml
  name: Performance
  on: [push, pull_request]
  
  jobs:
    performance:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Setup Node.js
          uses: actions/setup-node@v2
          with:
            node-version: '16'
        - run: npm ci
        - name: Run Lighthouse CI
          run: npx lhci autorun
  ```

# TypeScript with React

## Component Patterns

### 1. Basic Component with TypeScript

```tsx
import React from 'react';

// Type for component props
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

// Functional Component with TypeScript
const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
```

### 2. Generic Components

```tsx
import React from 'react';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <ul className="list">
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
const UserList = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}
      renderItem={(user) => (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      )}
    />
  );
};
```

### 3. Compound Components

```tsx
import React, { createContext, useContext } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  defaultActiveTab: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultActiveTab }) => {
  const [activeTab, setActiveTab] = React.useState(defaultActiveTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="tab-list">{children}</div>;
};

export const Tab: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within a Tabs component');
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="tab-panels">{children}</div>;
};

export const TabPanel: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within a Tabs component');
  
  const { activeTab } = context;
  return activeTab === id ? <div className="tab-panel">{children}</div> : null;
};

// Usage
const App = () => (
  <Tabs defaultActiveTab="profile">
    <TabList>
      <Tab id="profile">Profile</Tab>
      <Tab id="settings">Settings</Tab>
      <Tab id="messages">Messages</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="profile">Profile Content</TabPanel>
      <TabPanel id="settings">Settings Content</TabPanel>
      <TabPanel id="messages">Messages Content</TabPanel>
    </TabPanels>
  </Tabs>
);
```

## Hooks with TypeScript

### 1. useState

```tsx
import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

const UserForm = () => {
  // Primitive type
  const [count, setCount] = useState<number>(0);
  
  // Object type
  const [user, setUser] = useState<User | null>(null);
  
  // Array type
  const [todos, setTodos] = useState<Array<{ id: number; text: string; completed: boolean }>>([]);
  
  // Function initializer
  const [data, setData] = useState<User[]>(() => {
    // Expensive computation
    return fetchUsers();
  });

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} - {todo.completed ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 2. useReducer

```tsx
import React, { useReducer } from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: number }
  | { type: 'REMOVE_TODO'; id: number };

const todoReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: Date.now(),
          text: action.text,
          completed: false,
        },
      ];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case 'REMOVE_TODO':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
};

const TodoApp = () => {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: 'ADD_TODO', text });
    setText('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                marginRight: '10px',
              }}
              onClick={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'REMOVE_TODO', id: todo.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 3. Custom Hooks

```tsx
import { useState, useEffect } from 'react';

// Generic fetch hook
function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json() as T;
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Cancel any pending requests if needed
    };
  }, [url, options]);

  return { data, error, loading };
}

// Usage
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const PostsList = () => {
  const { data: posts, loading, error } = useFetch<Post[]>(
    'https://jsonplaceholder.typicode.com/posts'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
};
```

## State Management

### 1. Context API with TypeScript

```tsx
// context/ThemeContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Usage in components
const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
};
```

### 2. Redux Toolkit with TypeScript

```tsx
// store/slices/todosSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodosState {
  items: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: null,
};

// Async thunk
const API_URL = 'https://api.example.com/todos';

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await fetch(API_URL);
  return (await response.json()) as Todo[];
});

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  async (text: string) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, completed: false }),
    });
    return (await response.json()) as Todo;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch todos';
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { toggleTodo } = todosSlice.actions;
export default todosSlice.reducer;

// Selectors
export const selectAllTodos = (state: RootState) => state.todos.items;
export const selectTodoById = (state: RootState, todoId: string) =>
  state.todos.items.find(todo => todo.id === todoId);

// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './slices/todosSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// components/TodoList.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos, selectAllTodos, toggleTodo } from '../store/slices/todosSlice';
import { AppDispatch } from '../store/store';

const TodoList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectAllTodos);
  const status = useSelector((state: RootState) => state.todos.status);
  const error = useSelector((state: RootState) => state.todos.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch(toggleTodo(todo.id))}
          />
          <span>{todo.text}</span>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
```

### 3. React Query with TypeScript

```tsx
// api/todos.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const API_URL = 'https://api.example.com/todos';

// Fetch all todos
export const useTodos = () => {
  return useQuery<Todo[], Error>('todos', async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
};

// Add a new todo
export const useAddTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (text: string) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, completed: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add todo');
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries('todos');
      },
    }
  );
};

// Toggle todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (todo: Todo) => {
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries('todos');
      },
    }
  );
};

// components/TodoListWithReactQuery.tsx
import React, { useState } from 'react';
import { useTodos, useAddTodo, useToggleTodo } from '../api/todos';

const TodoListWithReactQuery = () => {
  const [text, setText] = useState('');
  const { data: todos, isLoading, error } = useTodos();
  const addTodoMutation = useAddTodo();
  const toggleTodoMutation = useToggleTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodoMutation.mutate(text);
    setText('');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit" disabled={addTodoMutation.isLoading}>
          {addTodoMutation.isLoading ? 'Adding...' : 'Add'}
        </button>
      </form>
      
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodoMutation.mutate(todo)}
              disabled={toggleTodoMutation.isLoading}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoListWithReactQuery;
```

## Advanced Patterns

### 1. Dependency Injection with TypeScript

```typescript
// src/utils/container.ts
import { Container } from 'inversify';
import 'reflect-metadata';

const container = new Container();

export { container };

// Example service with DI
// src/services/user.service.ts
import { injectable } from 'inversify';
import { User } from '../models/user.model';

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
}

@injectable()
export class UserService implements IUserService {
  private users: User[] = []; // In-memory for example
  
  async getUsers(): Promise<User[]> {
    return this.users;
  }
  
  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}

// Register services in container
// src/config/di.config.ts
import { container } from '../utils/container';
import { UserService, IUserService } from '../services/user.service';

container.bind<IUserService>('UserService').to(UserService).inSingletonScope();

// Using the service in a controller
// src/controllers/user.controller.ts
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { IUserService } from '../services/user.service';

export class UserController {
  constructor(
    @inject('UserService') private userService: IUserService
  ) {}
  
  async getUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  // Other controller methods...
}
```

### 2. Repository Pattern with TypeORM

```typescript
// src/models/base.repository.ts
import { Repository, EntityRepository, getRepository } from 'typeorm';
import { validateOrReject } from 'class-validator';

export abstract class BaseRepository<T> extends Repository<T> {
  private entity: new () => T;
  
  constructor(entity: new () => T) {
    super();
    this.entity = entity;
  }
  
  async validateAndSave(entity: T): Promise<T> {
    await validateOrReject(entity);
    return getRepository(this.entity).save(entity as any);
  }
  
  async findById(id: string | number): Promise<T | undefined> {
    return getRepository(this.entity).findOne(id as any);
  }
  
  // Common methods...
}

// src/models/user.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  @IsNotEmpty()
  name: string;
  
  @Column({ unique: true })
  @IsEmail()
  email: string;
  
  @Column()
  @MinLength(8)
  password: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}

// src/repositories/user.repository.ts
import { EntityRepository } from 'typeorm';
import { User } from '../models/user.model';
import { BaseRepository } from './base.repository';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }
  
  // User-specific methods...
}
```

### 3. CQRS Pattern

```typescript
// src/cqrs/command.interface.ts
export interface ICommand<T = any> {
  execute(): Promise<T>;
}

// src/cqrs/command-handler.interface.ts
export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}

// Example command
// src/features/users/commands/create-user.command.ts
export class CreateUserCommand implements ICommand<string> {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
  
  async execute(): Promise<string> {
    // In a real app, this would be handled by a command handler
    // This is just for demonstration
    return 'User created';
  }
}

// Command handler
// src/features/users/commands/handlers/create-user.handler.ts
import { ICommandHandler } from '../../../cqrs/command-handler.interface';
import { CreateUserCommand } from './create-user.command';

export class CreateUserHandler implements ICommandHandler<CreateUserCommand, string> {
  async execute(command: CreateUserCommand): Promise<string> {
    const { name, email, password } = command;
    
    // Business logic here
    console.log(`Creating user: ${name} (${email})`);
    
    // Return user ID or some result
    return 'user-123';
  }
}
```

## Performance Considerations

### 1. Memory Management

```typescript
// src/utils/memory-manager.ts
export class MemoryManager {
  private static instance: MemoryManager;
  private constructor() {}
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  // Track memory usage
  logMemoryUsage() {
    const used = process.memoryUsage();
    
    console.log('Memory Usage:');
    Object.entries(used).forEach(([key, value]) => {
      console.log(`  ${key}: ${Math.round((value / 1024 / 1024) * 100) / 100} MB`);
    });
  }
  
  // Force garbage collection (Node.js flag: --expose-gc)
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('Garbage collection performed');
    } else {
      console.warn('Garbage collection not available. Run Node with --expose-gc flag.');
    }
  }
}

// Usage
const memoryManager = MemoryManager.getInstance();
setInterval(() => memoryManager.logMemoryUsage(), 60000); // Log every minute
```

### 2. Connection Pooling

```typescript
// src/config/database.ts
import { createPool, Pool, PoolConfig } from 'pg';
import config from './config';

class Database {
  private static instance: Database;
  private pool: Pool;
  
  private constructor() {
    const dbConfig: PoolConfig = {
      connectionString: config.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
    };
    
    this.pool = createPool(dbConfig);
    
    // Test the connection
    this.pool.query('SELECT NOW()')
      .then(() => console.log('Database connected'))
      .catch(err => console.error('Database connection error', err));
  }
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  public async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error', { text, error });
      throw error;
    }
  }
  
  // Add methods for transactions, etc.
  public async withTransaction(callback: (client: any) => Promise<any>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Database.getInstance();
```

### 3. Caching with Redis

```typescript
// src/utils/cache.ts
import { createClient, RedisClientType } from 'redis';
import config from '../config/config';
import logger from './logger';

class Cache {
  private static instance: Cache;
  private client: RedisClientType;
  private connected = false;
  
  private constructor() {
    this.client = createClient({
      url: config.REDIS_URL || 'redis://localhost:6379',
    });
    
    this.client.on('error', (err) => {
      logger.error('Redis Client Error', err);
      this.connected = false;
    });
    
    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.connected = true;
    });
    
    this.client.connect().catch(err => {
      logger.error('Redis connection error', err);
    });
  }
  
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }
  
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const strValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, strValue);
      } else {
        await this.client.set(key, strValue);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }
  
  public async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }
  
  public async del(key: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }
  
  public async withCache<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl = 3600 // 1 hour default
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    
    logger.debug('Cache miss', { key });
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}

export default Cache.getInstance();

// Usage example
const getUserWithCache = async (userId: string) => {
  const cache = Cache.getInstance();
  const cacheKey = `user:${userId}`;
  
  return cache.withCache(
    cacheKey,
    async () => {
      // This function is only called if the cache misses
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('User not found');
      return user;
    },
    300 // Cache for 5 minutes
  );
};
```

### 4. Performance Monitoring

```typescript
// src/utils/performance.ts
import { performance, PerformanceObserver, PerformanceEntry } from 'perf_hooks';
import logger from './logger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observer: PerformanceObserver;
  private measurements: Record<string, number[]> = {};
  
  private constructor() {
    this.observer = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        this.recordMeasurement(entry.name, entry.duration);
      });
    });
    
    this.observer.observe({ entryTypes: ['measure'], buffered: true });
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  public startMark(name: string) {
    performance.mark(`start-${name}`);
  }
  
  public endMark(name: string) {
    performance.mark(`end-${name}`);
    performance.measure(name, `start-${name}`, `end-${name}`);
  }
  
  private recordMeasurement(name: string, duration: number) {
    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);
    
    // Log slow operations
    if (duration > 100) { // 100ms threshold
      logger.warn('Slow operation detected', { name, duration });
    }
  }
  
  public getStats() {
    const stats: Record<string, {
      count: number;
      avg: number;
      min: number;
      max: number;
      p90: number;
    }> = {};
    
    Object.entries(this.measurements).forEach(([name, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const avg = sum / sorted.length;
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const p90 = sorted[Math.floor(sorted.length * 0.9)];
      
      stats[name] = {
        count: sorted.length,
        avg: parseFloat(avg.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        p90: parseFloat(p90.toFixed(2)),
      };
    });
    
    return stats;
  }
  
  public logStats() {
    const stats = this.getStats();
    logger.info('Performance Statistics', { stats });
  }
}

// Usage example
const perf = PerformanceMonitor.getInstance();

// In your route handlers or service methods
async function someOperation() {
  perf.startMark('database-query');
  // Perform database query
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate DB query
  perf.endMark('database-query');
  
  return { success: true };
}

// Log stats periodically
setInterval(() => perf.logStats(), 5 * 60 * 1000); // Every 5 minutes
```

## Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter)
- [web-vitals](https://github.com/GoogleChrome/web-vitals)
- [Sentry Documentation](https://docs.sentry.io/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)
