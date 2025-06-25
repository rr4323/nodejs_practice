# 5.1. Middleware in Express

Middleware is a fundamental concept in Express.js. It allows you to execute code on incoming requests before they reach your route handlers. Middleware is often used for:

-   Logging requests
-   Parsing request bodies
-   Authenticating users
-   Handling errors

## How Middleware Works

A middleware function is simply a function that takes three arguments: `req`, `res`, and `next`.

-   `req`: The HTTP request object.
-   `res`: The HTTP response object.
-   `next`: A function that, when called, passes control to the next middleware function in the stack. If the current middleware function does not end the request-response cycle, it must call `next()` to pass control to the next middleware function. Otherwise, the request will be left hanging.

## Example: A Logger Middleware

Let's create a simple middleware that logs the HTTP method and URL of every incoming request.

**`src/middleware/logger.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to the next middleware
};
```

**`src/index.ts`**
```typescript
import express from 'express';
import { logger } from './middleware/logger';

const app = express();

// Apply the logger middleware to all routes
app.use(logger);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/users', (req, res) => {
  res.send('Users list');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

When you run this server and make requests to `/` or `/users`, you will see the request details logged to the console.

## Running the Example

I have provided all the necessary files. To run it:

1.  Install dependencies: `npm install`
2.  Build and run: `npm run build && npm start`

---

Next, we'll learn how to create a centralized error-handling mechanism.
