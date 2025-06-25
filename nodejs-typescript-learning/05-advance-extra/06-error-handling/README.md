# Error Handling in Node.js

Proper error handling is crucial for building robust Node.js applications. This section covers various error handling techniques and best practices.

## Error Types in Node.js

1. **Standard JavaScript Errors** (SyntaxError, ReferenceError, TypeError, etc.)
2. **System Errors** (from Node.js core)
3. **User-specified Errors** (custom errors)
4. **Assertion Errors** (from the `assert` module)

## Basic Error Handling

### Try/Catch with Synchronous Code

```javascript
try {
  // Synchronous code that might throw an error
  const data = JSON.parse('{invalid json}');
} catch (err) {
  console.error('Error parsing JSON:', err.message);
  // Handle the error or rethrow
  // throw err;
}
```

### Error-First Callbacks

```javascript
const fs = require('fs');

fs.readFile('nonexistent.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err.message);
    return;
  }
  console.log(data);
});
```

### Promises with .catch()

```javascript
const fs = require('fs').promises;

fs.readFile('nonexistent.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error('Error reading file:', err.message));
```

### Async/Await with Try/Catch

```javascript
async function readFile() {
  try {
    const data = await fs.promises.readFile('nonexistent.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
}

readFile();
```

## Creating Custom Errors

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

function validateUser(user) {
  if (!user.name) {
    throw new ValidationError('Name is required', 'name');
  }
  if (!user.email) {
    throw new ValidationError('Email is required', 'email');
  }
}

try {
  validateUser({});
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`Validation Error (${err.field}):`, err.message);
  } else {
    console.error('Unexpected error:', err);
  }
}
```

## Error Handling in Express.js

```javascript
const express = require('express');
const app = express();

// Route with error
app.get('/user/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.json(user);
  } catch (err) {
    next(err); // Pass to error handling middleware
  }
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Best Practices

1. Always handle errors at the right level of abstraction
2. Use custom error types for different error scenarios
3. Don't swallow errors (avoid empty catch blocks)
4. Log errors appropriately
5. Fail fast and fail loudly in development
6. Handle unhandled promise rejections
7. Handle uncaught exceptions

## Exercise
1. Create a custom error class for API errors
2. Implement a global error handler for unhandled promise rejections
3. Build a middleware for logging errors in an Express application
4. Create a function that retries a failed operation with exponential backoff
