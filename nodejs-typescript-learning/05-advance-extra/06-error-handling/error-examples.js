// Custom Error Class
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

// Function that might throw different types of errors
function processUserData(user) {
  // Check if user object exists
  if (!user) {
    throw new Error('User object is required');
  }

  // Validate required fields
  if (!user.name) {
    throw new ValidationError('Name is required', 'name');
  }

  if (!user.email) {
    throw new ValidationError('Email is required', 'email');
  }

  // Simulate an async operation that might fail
  return new Promise((resolve, reject) => {
    // Simulate database operation
    setTimeout(() => {
      if (user.email.includes('example.com')) {
        reject(new Error('Example email domains are not allowed'));
      } else {
        resolve({ id: 123, ...user });
      }
    }, 1000);
  });
}

// Example 1: Basic try/catch with synchronous code
console.log('=== Example 1: Basic try/catch ===');
try {
  const result = JSON.parse('{invalid json}');
  console.log(result);
} catch (err) {
  console.error('Error parsing JSON:', err.message);
}

// Example 2: Handling custom errors
console.log('\n=== Example 2: Custom Error Handling ===');
try {
  processUserData({});
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`Validation Error (${err.field}):`, err.message);
  } else {
    console.error('Unexpected error:', err.message);
  }
}

// Example 3: Async/await error handling
console.log('\n=== Example 3: Async/Await Error Handling ===');
async function saveUser(user) {
  try {
    const result = await processUserData(user);
    console.log('User saved successfully:', result);
    return result;
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(`Validation failed for ${err.field}:`, err.message);
    } else {
      console.error('Failed to save user:', err.message);
    }
    throw err; // Re-throw if needed
  }
}

// Call the async function
saveUser({ name: 'John', email: 'john@example.com' })
  .catch(() => console.log('Error was handled in the catch block'));

// Example 4: Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=== Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Uncomment to test unhandled rejection
// Promise.reject(new Error('This is an unhandled rejection'));

// Example 5: Global error handler
process.on('uncaughtException', (err) => {
  console.error('\n=== Uncaught Exception ===');
  console.error(err);
  // Perform cleanup if needed
  process.exit(1); // Exit with failure
});

// Uncomment to test uncaught exception
// setTimeout(() => {
//   throw new Error('This is an uncaught exception!');
// }, 2000);

console.log('\n=== End of Script (check async results above) ===');
