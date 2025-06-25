# 2.3. Asynchronous Programming in Node.js

Asynchronous programming is a fundamental concept in Node.js. Because Node.js is single-threaded, it uses non-blocking, asynchronous operations to handle multiple requests concurrently without getting stuck waiting for I/O operations (like reading a file or making a network request) to complete.

We will explore three common patterns for handling asynchronous code in Node.js:

1.  **Callbacks**: The original way to handle asynchronous operations in Node.js.
2.  **Promises**: A more robust and flexible way to handle asynchronous operations, introduced in ES6.
3.  **Async/Await**: Modern syntactic sugar built on top of Promises that makes asynchronous code look and feel more like synchronous code.

## 1. Callbacks

A callback is a function that is passed as an argument to another function and is executed after the outer function has completed.

**Example: `callbacks.js`**

```javascript
const fs = require('fs');

console.log('Reading file...');

fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log('File content:', data);
});

console.log('This will log before the file content.');
```

## 2. Promises

A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation.

**Example: `promises.js`**

```javascript
const fs = require('fs').promises; // Use the promise-based version of fs

console.log('Reading file...');

fs.readFile('example.txt', 'utf8')
  .then(data => {
    console.log('File content:', data);
  })
  .catch(err => {
    console.error('Error reading file:', err);
  });

console.log('This will also log before the file content.');
```

## 3. Async/Await

`async/await` provides a cleaner and more readable syntax for working with Promises.

**Example: `async-await.js`**

```javascript
const fs = require('fs').promises;

async function readFile() {
  console.log('Reading file...');
  try {
    const data = await fs.readFile('example.txt', 'utf8');
    console.log('File content:', data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

readFile();
console.log('This will *still* log before the file content.');
```

---

This concludes the Node.js fundamentals section. Next, we will dive into **TypeScript Fundamentals**.
