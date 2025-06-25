# Process Module in Node.js

The `process` object is a global that provides information about, and control over, the current Node.js process. It's available without requiring it.

## Common Process Properties and Methods

### `process.argv`
An array containing the command-line arguments passed when the Node.js process was launched.

```javascript
// Save as args.js
console.log('Arguments:', process.argv);

// Run with: node args.js one two=three four
// Output will include the full command and arguments
```

### `process.env`
An object containing the user environment.

```javascript
console.log('Current environment:', process.env.NODE_ENV || 'development');
console.log('Home directory:', process.env.HOME || process.env.USERPROFILE);
```

### `process.cwd()`
Returns the current working directory of the process.

```javascript
console.log('Current working directory:', process.cwd());
```

### `process.exit([code])`
Instructs Node.js to terminate the process synchronously with an exit status.

```javascript
if (someCondition) {
  console.error('An error occurred');
  process.exit(1); // Exit with failure
}
```

### `process.memoryUsage()`
Returns an object describing the memory usage of the Node.js process.

```javascript
const memoryUsage = process.memoryUsage();
console.log('Memory Usage:', {
  rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
  heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
});
```

## Process Events

### `process.on('exit', (code) => {})`
Emitted when the Node.js process is about to exit.

```javascript
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});
```

### `process.on('uncaughtException', (err) => {})`
Emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.

```javascript
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform cleanup if needed
  process.exit(1); // Exit with failure
});
```

## Practical Example: Environment Configuration

```javascript
// config.js
const config = {
  // Default configuration (development)
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'myapp_dev'
  },
  // Add other configuration as needed
};

// Production overrides
if (config.env === 'production') {
  config.port = process.env.PORT || 80;
  // Add other production-specific configurations
}

module.exports = config;
```

## Exercise
1. Create a CLI tool that accepts command-line arguments
2. Build a simple configuration loader that reads from environment variables
3. Implement a graceful shutdown handler for your Node.js application
