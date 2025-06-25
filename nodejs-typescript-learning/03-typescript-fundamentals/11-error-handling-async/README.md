# 11. Error Handling and Async Patterns in TypeScript

This section covers error handling strategies and asynchronous programming patterns in TypeScript, including Promises, async/await, and error handling best practices.

## Table of Contents
- [Error Handling in TypeScript](#error-handling-in-typescript)
- [Custom Error Classes](#custom-error-classes)
- [Promises](#promises)
- [Async/Await](#asyncawait)
- [Error Boundaries](#error-boundaries)
- [Error Handling Patterns](#error-handling-patterns)
- [Concurrency Control](#concurrency-control)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Error Handling in TypeScript

### Basic Try/Catch

```typescript
try {
  // Code that might throw an error
  const result = riskyOperation();
  console.log('Result:', result);
} catch (error) {
  // TypeScript 4.0+ makes error of type 'unknown'
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('An unknown error occurred');
  }
} finally {
  // This code will always run
  console.log('Operation attempted');
}
```

### Type Assertion for Errors

```typescript
try {
  // Some operation that might throw
} catch (error) {
  // Type assertion if you're sure about the error type
  const typedError = error as Error;
  console.error(typedError.message);
  
  // Or type guard for better safety
  if (error instanceof Error) {
    console.error(error.stack);
  }
}
```

## Custom Error Classes

### Basic Custom Error

```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Usage
function validateInput(input: string) {
  if (!input.trim()) {
    throw new ValidationError('Input cannot be empty', 'input');
  }
  return input;
}

try {
  validateInput('');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed on field ${error.field}: ${error.message}`);
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

### Error with Error Codes

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

// Usage
function fetchUser(id: string) {
  if (!id) {
    throw new ApiError('User ID is required', 400, 'MISSING_USER_ID');
  }
  // Fetch user...
}
```

## Promises

### Basic Promise Usage

```typescript
function fetchData(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({ data: 'Some data' });
      } else {
        reject(new Error('Failed to fetch data'));
      }
    }, 1000);
  });
}

// Using .then() and .catch()
fetchData('https://api.example.com/data')
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error:', error.message));

// Using async/await
try {
  const data = await fetchData('https://api.example.com/data');
  console.log('Data:', data);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

### Promise Utility Functions

```typescript
// Promise.all - Wait for all promises to resolve
async function fetchMultiple(urls: string[]) {
  try {
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const data = await Promise.all(responses.map(res => res.json()));
    return data;
  } catch (error) {
    console.error('One or more requests failed:', error);
    throw error;
  }
}

// Promise.race - Get the first resolved promise
async function fetchWithTimeout(url: string, timeout: number) {
  const fetchPromise = fetch(url);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  );
  
  return Promise.race([fetchPromise, timeoutPromise]);
}

// Promise.allSettled - Get all results, even if some promises reject
async function fetchAllSettled(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(res => res.json()))
  );
  
  const successful = results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .map(result => result.value);
    
  const failed = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => result.reason);
    
  return { successful, failed };
}
```

## Async/Await

### Basic Async/Await

```typescript
async function getUserProfile(userId: string) {
  try {
    // These run in series
    const user = await fetchUser(userId);
    const profile = await fetchProfile(user.profileId);
    const posts = await fetchUserPosts(userId);
    
    return { user, profile, posts };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error (${error.statusCode}): ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

### Parallel Execution with Async/Await

```typescript
async function getDashboardData(userId: string) {
  // These run in parallel
  const [user, settings, notifications] = await Promise.all([
    fetchUser(userId),
    fetchUserSettings(userId),
    fetchNotifications(userId)
  ]);
  
  return { user, settings, notifications };
}
```

### Error Handling with Async/Await

```typescript
// Utility function for error handling
function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler: (error: unknown) => T | Promise<T>
): Promise<T> {
  return promise.catch(errorHandler);
}

// Usage
async function safeFetch(url: string) {
  return handleAsyncError(
    fetch(url).then(res => res.json()),
    error => ({
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      status: 'error'
    })
  );
}
```

## Error Boundaries

### React Error Boundary Example

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (typeof fallback === 'function') {
        return fallback(error!, errorInfo!);
      }
      return fallback || <div>Something went wrong. Please try again later.</div>;
    }

    return children;
  }
}

export default ErrorBoundary;
```

## Error Handling Patterns

### Result Pattern

```typescript
type Success<T> = {
  success: true;
  data: T;
};

type Failure = {
  success: false;
  error: Error;
};

type Result<T> = Success<T> | Failure;

function createSuccess<T>(data: T): Success<T> {
  return { success: true, data };
}

function createFailure(error: Error): Failure {
  return { success: false, error };
}

async function fetchData<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return createSuccess(data as T);
  } catch (error) {
    return createFailure(
      error instanceof Error ? error : new Error('Unknown error occurred')
    );
  }
}

// Usage
async function displayUserData(userId: string) {
  const result = await fetchData<User>(`/api/users/${userId}`);
  
  if (result.success) {
    console.log('User data:', result.data);
  } else {
    console.error('Failed to fetch user:', result.error.message);
  }
  
  return result;
}
```

## Concurrency Control

### Rate Limiting

```typescript
class RateLimiter {
  private queue: Array<() => void> = [];
  private active = 0;

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Usage
const limiter = new RateLimiter(3); // 3 concurrent operations

async function processItems(items: any[]) {
  return Promise.all(
    items.map(item =>
      limiter.run(async () => {
        // Your async operation here
        await processItem(item);
      })
    )
  );
}
```

## Key Takeaways

1. **Error Handling**: Always handle errors appropriately at the right level of abstraction.
2. **Custom Errors**: Create custom error classes for better error categorization and handling.
3. **Async/Await**: Prefer async/await over raw Promises for better readability and error handling.
4. **Error Boundaries**: Implement error boundaries in UI components to prevent the entire app from crashing.
5. **Result Pattern**: Use the Result pattern for more predictable error handling in async operations.
6. **Concurrency Control**: Implement rate limiting and concurrency control for operations that interact with external services.
7. **Promise Utilities**: Use Promise.all, Promise.race, and Promise.allSettled for better control over async operations.
8. **Error Logging**: Always log errors with sufficient context for debugging.

## Exercises

1. Implement a retry mechanism for failed API calls with exponential backoff.
2. Create a generic cache wrapper that handles errors and stale data.
3. Implement a circuit breaker pattern for API calls.
4. Create a higher-order function that adds timeout functionality to any async function.
5. Implement a queue system that processes items with a concurrency limit and error handling.

## Next Steps

Now that you understand error handling and async patterns in TypeScript, you're ready to explore how to work with the TypeScript compiler and configuration in the next section.
