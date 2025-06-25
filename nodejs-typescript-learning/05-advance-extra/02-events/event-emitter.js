const EventEmitter = require('events');

// Create a new event emitter instance
const myEmitter = new EventEmitter();

// Register an event listener for 'greet' event
myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Register a one-time event listener
myEmitter.once('welcome', () => {
  console.log('Welcome! This message will only show once.');
});

// Emit events
console.log('Emitting greet event...');
myEmitter.emit('greet', 'John');
myEmitter.emit('greet', 'Jane');

console.log('\nEmitting welcome event...');
myEmitter.emit('welcome');
myEmitter.emit('welcome'); // This won't trigger the listener again

// Error handling
myEmitter.on('error', (err) => {
  console.error('An error occurred:', err.message);
});

// This will trigger the error event
myEmitter.emit('error', new Error('Something went wrong!'));
