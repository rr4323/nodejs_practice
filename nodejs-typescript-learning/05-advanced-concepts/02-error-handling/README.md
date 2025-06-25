# 5.2. Centralized Error Handling in Express

In a real-world application, you need a consistent way to handle errors. Instead of using `try...catch` blocks in every route handler, Express allows you to define a special type of middleware called an error-handling middleware.

## How Error-Handling Middleware Works

An error-handling middleware function is defined in the same way as other middleware functions, but with four arguments instead of three: `(err, req, res, next)`.

-   `err`: The error object.
-   `req`: The request object.
-   `res`: The response object.
-   `next`: The next middleware function.

This middleware must be added **after** all other `app.use()` and routes calls for it to function correctly.

## Example: A Custom Error Handler

Let's create an error handler that catches errors and sends a standardized JSON response.

**`src/middleware/errorHandler.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging

  // Default to a 500 server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
```

**`src/index.ts`**
```typescript
import express from 'express';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// This route will intentionally throw an error
app.get('/error', (req, res, next) => {
  const err = new Error('Something went wrong!');
  next(err); // Pass the error to the error handler
});

// Use the error-handling middleware
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

When you visit `/error`, the error will be passed to the `errorHandler` middleware, which will then send a formatted JSON response.

## Running the Example

I have provided all the necessary files. To run it:

1.  Install dependencies: `npm install`
2.  Build and run: `npm run build && npm start`

---

Next, we'll learn about connecting to a database.
