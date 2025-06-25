// Debugging with console methods
console.log('=== Debugging Examples ===');

// 1. Basic console logging
function calculateTotal(price, quantity, taxRate) {
  console.log('Input values:', { price, quantity, taxRate });
  
  const subtotal = price * quantity;
  console.log('Subtotal:', subtotal);
  
  const tax = subtotal * taxRate;
  console.log('Tax:', tax);
  
  const total = subtotal + tax;
  console.log('Total:', total);
  
  return total;
}

console.log('\n=== Basic Calculation ===');
calculateTotal(10, 2, 0.1);

// 2. Console assertions
console.log('\n=== Assertions ===');
console.assert(2 + 2 === 4, 'Math works!');
console.assert(2 + 2 === 5, 'This will trigger an assertion error');

// 3. Console timing
console.time('Array initialization');
const array = new Array(1000000).fill('test');
console.timeEnd('Array initialization');

// 4. Debugger statement
function complexCalculation() {
  const a = 5;
  const b = 10;
  
  // The debugger statement will pause execution if running with --inspect
  // Run with: node --inspect debug-examples.js
  debugger;
  
  const result = a * b + Math.pow(a, b);
  return result;
}

console.log('\n=== Debugger Example ===');
console.log('Run with --inspect flag to trigger debugger');
// complexCalculation();

// 5. Stack traces
function firstFunction() {
  secondFunction();
}

function secondFunction() {
  thirdFunction();
}

function thirdFunction() {
  console.trace('Here is the call stack:');
}

console.log('\n=== Stack Trace Example ===');
firstFunction();

// 6. Logging with different levels
console.log('\n=== Logging Levels ===');
console.log('This is a log message');
console.info('This is an info message');
console.warn('This is a warning message');
console.error('This is an error message');

// 7. Table output for objects/arrays
console.log('\n=== Table Output ===');
const users = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Doe', age: 40 }
];
console.table(users);

// 8. Grouping logs
console.log('\n=== Grouped Logs ===');
console.group('User Details');
console.log('Name: John Doe');
console.log('Age: 30');
console.group('Address');
console.log('Street: 123 Main St');
console.log('City: Anytown');
console.groupEnd();
console.groupEnd();

// 9. Count occurrences
console.log('\n=== Counting ===');
console.count('counter');
console.count('counter');
console.count('another-counter');
console.count('counter');

// 10. Clear console (works in browser, not in Node.js)
// console.clear();

console.log('\n=== Debugging Complete ===');

// To use the debugger:
// 1. Run with: node --inspect-brk debug-examples.js
// 2. Open Chrome and go to: chrome://inspect
// 3. Click on "Open dedicated DevTools for Node"
// 4. The debugger will pause at the first line of execution
