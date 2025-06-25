# Events in Node.js

Node.js is built around an event-driven architecture. The `events` module allows us to create, fire, and listen for our own events.

## EventEmitter Class

Most of Node's core API is built around an event-driven architecture where certain kinds of objects (called "emitters") emit named events that cause `Function` objects ("listeners") to be called.

### Basic Example

```javascript
const EventEmitter = require('events');

// Create an instance of EventEmitter
const myEmitter = new EventEmitter();

// Register an event listener
myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Emit the event
myEmitter.emit('greet', 'John');
```

## Common EventEmitter Methods

- `emitter.on(eventName, listener)` - Adds a listener to the end of the listeners array
- `emitter.emit(eventName[, ...args])` - Synchronously calls each of the listeners
- `emitter.once(eventName, listener)` - Adds a one-time listener
- `emitter.removeListener(eventName, listener)` - Removes a specific listener
- `emitter.removeAllListeners([eventName])` - Removes all listeners

## Practical Example: Creating a Logger

```javascript
const EventEmitter = require('events');

class Logger extends EventEmitter {
  log(message) {
    // Send an HTTP request
    console.log(message);
    
    // Raise an event
    this.emit('messageLogged', { id: 1, url: 'http://example.com' });
  }
}

const logger = new Logger();

logger.on('messageLogged', (arg) => {
  console.log('Listener called', arg);
});

logger.log('Message');
```

## Exercise
1. Create a simple chat application using EventEmitter
2. Implement a simple pub/sub system
3. Create a module that emits events when a file is modified
