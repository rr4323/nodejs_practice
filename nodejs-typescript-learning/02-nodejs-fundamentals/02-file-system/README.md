# 2.2. File System (fs) Module in Node.js

The File System (fs) module in Node.js provides an API for interacting with the file system. It allows you to work with files and directories on your computer.

## Table of Contents

- [Synchronous vs Asynchronous](#synchronous-vs-asynchronous)
- [Common File Operations](#common-file-operations)
  - [Reading Files](#reading-files)
  - [Writing Files](#writing-files)
  - [File Information](#file-information)
  - [Working with Directories](#working-with-directories)
- [Example Code](#example-code)
- [Best Practices](#best-practices)

## Synchronous vs Asynchronous

Node.js fs module provides both synchronous and asynchronous methods:

- **Asynchronous methods** (recommended for most cases)
  - Non-blocking
  - Use callbacks or Promises
  - Example: `fs.readFile()`, `fs.writeFile()`

- **Synchronous methods**
  - Blocking (avoid in production)
  - Simpler to use but can block the event loop
  - Example: `fs.readFileSync()`, `fs.writeFileSync()`

## Common File Operations

### Reading Files

```javascript
// Asynchronous
const fs = require('fs');

fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Using Promises (Node.js 10+)
const fs = require('fs').promises;

async function readFile() {
  try {
    const data = await fs.readFile('example.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}
```

### Writing Files

```javascript
// Asynchronous
fs.writeFile('example.txt', 'Hello, World!', (err) => {
  if (err) throw err;
  console.log('File written successfully');
});

// Append to file
fs.appendFile('example.txt', '\nNew content', (err) => {
  if (err) throw err;
  console.log('Content appended');
});
```

### File Information

```javascript
fs.stat('example.txt', (err, stats) => {
  if (err) throw err;
  
  console.log(`File size: ${stats.size} bytes`);
  console.log(`Created: ${stats.birthtime}`);
  console.log(`Is directory: ${stats.isDirectory()}`);
  console.log(`Is file: ${stats.isFile()}`);
});
```

### Working with Directories

```javascript
// Create directory
if (!fs.existsSync('new-directory')) {
  fs.mkdir('new-directory', (err) => {
    if (err) throw err;
    console.log('Directory created');
  });
}

// Read directory contents
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log('Files in current directory:');
  files.forEach(file => {
    console.log(`- ${file}`);
  });
});
```

## Example Code

This directory contains two example files:

1. `fs-example.js` - A module with common file system operations
2. `app.js` - Demonstrates how to use the fs-example module

To run the example:

```bash
node app.js
```

## Best Practices

1. **Use Async Methods**: Prefer asynchronous methods to avoid blocking the event loop.
2. **Handle Errors**: Always handle errors in callbacks or use try/catch with async/await.
3. **Use Path Module**: Use the `path` module for cross-platform file paths.
4. **Check File Existence**: Use `fs.access()` or `fs.stat()` to check if a file exists.
5. **Use Streams for Large Files**: For large files, use streams to avoid high memory usage.
6. **Close File Descriptors**: When using `fs.open()`, remember to close the file descriptor with `fs.close()`.

---

Next: [HTTP Module](./03-http-module/README.md)

Of course. This is a fantastic set of topics that forms the foundation of modern, efficient Node.js development.

Let's break it down, starting with the problem of large files and how streams solve it, then connecting that to the asynchronous patterns of Callbacks and Promises.

### The Problem: Handling a Large File (The "Bad" Way)

Imagine you have a very large video file, `large-video.mp4` (e.g., 2 GB). A naive approach to read it and write a copy would be:

```javascript
// WARNING: DO NOT RUN THIS ON A VERY LARGE FILE
const fs = require('fs');

console.log('Reading the file into memory...');

// This reads the ENTIRE 2 GB file into a single variable.
fs.readFile('./large-video.mp4', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // At this point, your program is using 2 GB of RAM!
  console.log('File read complete. Now writing the copy...');

  fs.writeFile('./video-copy.mp4', data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File copy complete.');
  });
});
```
**Why is this bad?**
Your program's memory usage will spike to 2 GB. If the file is larger than the available RAM on your server, the program will crash. If you have multiple users doing this at once, your server will quickly run out of memory.

---

### The Solution: Use Streams

A **stream** is a sequence of data that is moved from one point to another over time in small pieces, called **chunks**.

**Analogy:** Instead of trying to carry a swimming pool's worth of water in one giant, impossibly large bucket (the `readFile` method), you use a **hose** (a stream). Water flows through the hose continuously, and you never have to hold all the water at once.

Streams in Node.js allow you to process a file (or a network request, etc.) chunk by chunk, without ever loading the whole thing into memory.

Here’s how you would copy the large file using streams:

```javascript
// The efficient, streaming way
const fs = require('fs');

// 1. Create a stream to READ from the source file.
const readStream = fs.createReadStream('./large-video.mp4');

// 2. Create a stream to WRITE to the destination file.
const writeStream = fs.createWriteStream('./video-copy.mp4');

// 3. Listen for errors on both streams. This is important!
readStream.on('error', (err) => console.error('Read Stream Error:', err));
writeStream.on('error', (err) => console.error('Write Stream Error:', err));

// 4. Listen for the 'finish' event on the write stream to know when it's done.
writeStream.on('finish', () => {
  console.log('File copy complete using streams.');
});

// 5. The magic part: .pipe()
// pipe() automatically takes the chunks from the readStream
// and sends them to the writeStream. It also handles backpressure
// (pausing the reader if the writer is too slow).
console.log('Starting stream pipe...');
readStream.pipe(writeStream);
```

**Why is this great?**
The memory usage of this script will be incredibly low and constant, regardless of whether the file is 2 GB or 200 GB. It only ever holds one small chunk of data in memory at a time.

---

### Connecting to Callbacks and Promises

Reading a file is an **asynchronous operation**. The computer's hard drive needs time to find and read the data. Your main Node.js program shouldn't just freeze and wait. It needs a way to say, "Go do this disk operation, and let me know when you're done."

**Callbacks** and **Promises** are the two primary patterns for managing the outcome of these asynchronous operations.

#### 1. Callbacks

A **callback** is a function you pass as an argument to another function, which will be executed ("called back") when the asynchronous operation completes.

The `fs.readFile` example we saw first is a perfect example of the callback pattern.

```javascript
//           |---------------------- This whole function is the callback --------------------|
fs.readFile('./some-file.txt', (err, data) => {
  // This code runs LATER, only after the file has been read.
  if (err) {
    // Handle the error.
    return;
  }
  // Use the 'data'.
  console.log(data.toString());
});

console.log('This message will appear FIRST!'); // The program continues immediately.
```

**The Problem: "Callback Hell"**
When you need to do multiple async operations in a sequence, you get deeply nested callbacks, which is hard to read and maintain. This is known as the "Pyramid of Doom."

```javascript
// Callback Hell / Pyramid of Doom
fs.readFile('file1.txt', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', (err, data2) => {
    if (err) throw err;
    fs.writeFile('newFile.txt', data1 + data2, (err) => {
      if (err) throw err;
      console.log('All done!');
    });
  });
});
```

#### 2. Promises

A **Promise** is an object that represents the *eventual completion (or failure)* of an asynchronous operation. It's like an IOU or a receipt. You get the Promise object immediately, and it promises to give you a result in the future.

A Promise has three states:
*   **Pending:** The initial state; the operation hasn't finished yet.
*   **Fulfilled:** The operation completed successfully (the promise has a result value).
*   **Rejected:** The operation failed (the promise has an error reason).

Modern Node.js has a built-in `fs.promises` API that makes this easy.

We can rewrite the "Callback Hell" example cleanly using Promises with `async/await` syntax, which is the modern standard.

```javascript
const fs = require('fs').promises; // Note the .promises

async function combineFiles() {
  try {
    console.log('Reading file 1...');
    const data1 = await fs.readFile('file1.txt');

    console.log('Reading file 2...');
    const data2 = await fs.readFile('file2.txt');

    console.log('Writing new file...');
    await fs.writeFile('newFile.txt', data1 + data2);

    console.log('All done!');
  } catch (err) {
    // A single catch block handles errors from any of the 'await' calls.
    console.error('An error occurred:', err);
  }
}

combineFiles();
```
This code does the exact same thing as the "Callback Hell" example, but it's flat, readable, and looks like synchronous code, making it much easier to reason about.

### Summary Table

| Concept | What it is | Best For | Key Syntax / Pattern |
| :--- | :--- | :--- | :--- |
| **Streams** | A way to process data in sequential chunks over time. | **Handling very large files or data sets** (e.g., file I/O, network requests/responses) with low memory usage. | `createReadStream`, `createWriteStream`, `.pipe()`, `.on('data')`, `.on('end')` |
| **Callbacks** | A function passed to another function to be executed upon completion. | A simple, fundamental pattern for handling a single async operation. | `function(err, data) { ... }` |
| **Promises** | An object representing the future result of an async operation. | **Managing any async operation**, especially when you need to chain them sequentially or run them in parallel. | `.then()/.catch()` and the modern **`async/await`** with `try/catch` |


Absolutely. This is a fantastic question because understanding the *workflow* is the key to mastering asynchronous JavaScript. It's all about how the JavaScript engine, specifically its **Event Loop**, juggles tasks.

Let's break down the execution workflow for both, using the same core components.

### The Core Components of the Async Workflow

First, you need to know the four key players inside the Node.js (or browser) environment:

1.  **Call Stack:** The main worker. It executes code line by line. It's a "Last-In, First-Out" (LIFO) stack. When a function is called, it's pushed onto the stack. When it returns, it's popped off. **The Call Stack can only do one thing at a time.**
2.  **Node APIs (or Web APIs):** The "background workers". These are parts of the Node.js environment (written in C++) that can handle long-running tasks like timers (`setTimeout`), file system operations (`fs.readFile`), or network requests. They work in parallel to the Call Stack.
3.  **Callback Queue (or Task Queue):** The "To-Do" list for regular tasks. When a background Node API finishes its job (e.g., a timer finishes), the callback function associated with it is placed in this queue, waiting to be executed.
4.  **Microtask Queue:** A **high-priority "To-Do" list**. This is where the callbacks for Promises (`.then()`, `.catch()`, `.finally()`) and some other special functions go.

And the manager overseeing it all:

**The Event Loop:** The manager's job is simple: "As long as the **Call Stack** is empty, take the first task from one of the queues and push it onto the Call Stack to be executed." **Crucially, the Event Loop always checks the Microtask Queue first and empties it completely before checking the Callback Queue.**

---

### Workflow 1: The Callback (`setTimeout`)

Let's trace this code step-by-step:

```javascript
console.log('Start'); // 1

setTimeout(() => { // 2
  console.log('Callback executed'); // 4
}, 1000);

console.log('End'); // 3
```

**Step-by-Step Execution:**

1.  `console.log('Start')` is pushed onto the **Call Stack**.
    *   It runs, printing "Start".
    *   It's popped off the stack.
    *   **Call Stack:** `[ ]`

2.  `setTimeout(...)` is pushed onto the **Call Stack**.
    *   `setTimeout` is a Node API, not plain JavaScript. The Call Stack hands off the timer (1000ms) and the callback function `() => { ... }` to the **Node APIs**.
    *   The Node API starts a 1-second timer in the background.
    *   `setTimeout`'s job on the stack is done, so it's popped off. The program continues immediately.
    *   **Call Stack:** `[ ]`
    *   **Node APIs:** `[ Timer (1s) ]`

3.  `console.log('End')` is pushed onto the **Call Stack**.
    *   It runs, printing "End".
    *   It's popped off the stack.
    *   **Call Stack:** `[ ]`

4.  **(1 second later...)** The timer in the **Node APIs** finishes. It takes its associated callback function `() => { console.log('Callback executed'); }` and places it in the **Callback Queue**.
    *   **Callback Queue:** `[ () => { console.log('Callback executed'); } ]`

5.  The **Event Loop** is constantly checking: "Is the Call Stack empty?" Yes, it is! "Is there anything in the Microtask Queue?" No. "Is there anything in the Callback Queue?" Yes!
    *   The Event Loop takes the callback from the **Callback Queue** and pushes it onto the **Call Stack**.
    *   **Call Stack:** `[ () => { console.log('Callback executed'); } ]`
    *   **Callback Queue:** `[ ]`

6.  The callback function executes. `console.log('Callback executed')` is pushed to the stack, runs, prints "Callback executed", and is popped off. The callback function then finishes and is popped off. The program is now complete.

**Final Output:**
```
Start
End
Callback executed
```

---

### Workflow 2: The Promise

Now, let's trace a promise. We'll use a resolved promise to see the workflow clearly.

```javascript
console.log('Start'); // 1

const myPromise = new Promise((resolve, reject) => { // 2
  resolve('Promise Resolved!');
});

myPromise.then((result) => { // 3
  console.log(result); // 5
});

console.log('End'); // 4
```

**Step-by-Step Execution:**

1.  `console.log('Start')` is pushed onto the **Call Stack**, runs, and is popped off.
    *   **Call Stack:** `[ ]`

2.  `new Promise(...)` is pushed onto the **Call Stack**. The function passed to the promise constructor `(resolve, reject) => { ... }` runs **IMMEDIATELY and SYNCHRONOUSLY**.
    *   Inside the constructor, `resolve('Promise Resolved!')` is called.
    *   **This is the key step:** Calling `resolve()` changes the promise's state from *pending* to *fulfilled* and schedules any associated `.then()` callbacks to be placed on the **Microtask Queue** as soon as the current synchronous code is finished.
    *   The promise constructor finishes, and the `myPromise` object is created and returned. `new Promise(...)` is popped off the stack.
    *   **Call Stack:** `[ ]`

3.  `myPromise.then(...)` is pushed onto the **Call Stack**.
    *   This method sees that `myPromise` is already resolved. It takes its callback function `(result) => { ... }` and places it on the **Microtask Queue**.
    *   `myPromise.then(...)` is popped off the stack.
    *   **Call Stack:** `[ ]`
    *   **Microtask Queue:** `[ (result) => { console.log(result); } ]`

4.  `console.log('End')` is pushed onto the **Call Stack**, runs, prints "End", and is popped off.
    *   **Call Stack:** `[ ]`

5.  The synchronous part of the script is now finished. The **Event Loop** checks: "Is the Call Stack empty?" Yes! "Is there anything in the **Microtask Queue**?" **YES!**
    *   The Event Loop takes the callback from the **Microtask Queue** and pushes it onto the **Call Stack**.
    *   **Call Stack:** `[ (result) => { console.log(result); } ]`
    *   **Microtask Queue:** `[ ]`

6.  The `.then()` callback executes. `console.log(result)` is pushed to the stack, runs, prints "Promise Resolved!", and is popped off. The callback then finishes and is popped off. The program is now complete.

**Final Output:**
```
Start
End
Promise Resolved!
```

### The Ultimate Test: A Race Between Them

What happens when you have both?

```javascript
console.log('Start');

// Callback (goes to Callback Queue)
setTimeout(() => {
  console.log('setTimeout Callback');
}, 0); // 0ms delay!

// Promise (goes to Microtask Queue)
Promise.resolve().then(() => {
  console.log('Promise .then()');
});

console.log('End');
```

**Output:**

```
Start
End
Promise .then()
setTimeout Callback
```

**Why?**
Even though the `setTimeout` has a 0ms delay, its callback *must* go to the **Callback Queue**. The Promise's `.then()` callback goes to the **high-priority Microtask Queue**. After "Start" and "End" are printed and the Call Stack is empty, the Event Loop checks the Microtask Queue *first*, runs the promise callback, and only *then* checks the Callback Queue for the `setTimeout` callback.

### Summary Table of Differences

| Aspect | Callback Workflow | Promise Workflow |
| :--- | :--- | :--- |
| **Queue Used** | **Callback Queue** (low priority) | **Microtask Queue** (high priority) |
| **Control** | "Inversion of Control": You give your callback to another function. | You get a `Promise` object back, giving you more control. |
| **Execution Order** | Executes *after* all synchronous code and *after* all microtasks. | Executes *after* all synchronous code but *before* any regular callbacks. |
| **Chaining** | Leads to "Callback Hell" (deep nesting). | Clean chaining with `.then()` or flat code with `async/await`. |
| **Error Handling** | Error-first convention (`(err, data)`). Must be handled in every callback. | Centralized `.catch()` or `try/catch` block for `async/await`. |


This is a brilliant and very insightful question. You've pinpointed the exact "magic" that needs demystifying.

You are correct that a promise-returning function gives you a `Promise` object *immediately*, not the final value. The final value only becomes available *later*, when the promise resolves.

So how does `await` seem to magically get that final value and assign it to a variable?

The answer is that **`async` and `await` are syntactic sugar built on top of Promises**. They are a special syntax that tells the JavaScript engine to handle the `.then()` chaining and callbacks for you, making the code look clean and synchronous.

Let's break down the workflow.

### 1. The `async` Keyword: The "Promise Factory"

When you put the `async` keyword in front of a function definition, you are telling JavaScript two things:

1.  **This function will *always* return a Promise.** Even if you `return` a plain value like the number `5`, `async` will automatically wrap it in a resolved promise for you (`Promise.resolve(5)`).
2.  **Inside this function, I am now allowed to use the `await` keyword.**

```javascript
async function myFunc() {
  return 'Hello'; // This function actually returns Promise.resolve('Hello')
}

// You would use it like this:
myFunc().then(value => console.log(value)); // Prints "Hello"
```

### 2. The `await` Keyword: The "Pause and Unwrap" Operator

This is where the magic happens. The `await` keyword can only be used inside an `async` function.

When you `await` a promise, you are telling the JavaScript engine:

1.  **Pause this `async` function's execution** at this exact spot.
2.  Wait for the promise on the right-hand side to either **resolve** or **reject**.
3.  **Crucially, do not block anything else!** While this one function is paused, the Node.js Event Loop is free to run other code, handle other requests, etc.
4.  Once the promise **resolves**, **"unwrap" the resolved value** and assign it to the variable on the left. Then, resume executing this function from where it left off.
5.  If the promise **rejects**, **throw an error** at this exact spot, which can then be caught by a standard `try...catch` block.

---

### The Workflow: From `.then()` to `async/await`

Let's look at the same task done two ways.

**Scenario:** Fetch a user, then use their ID to fetch their posts.

#### The "Old" Way: Using `.then()`

```javascript
function fetchUserAndPosts() {
  console.log('Starting to fetch user...');
  fetchUser() // Returns a promise for the user
    .then(user => {
      // This callback runs when the user promise resolves
      console.log(`Got user: ${user.name}. Fetching posts...`);
      return fetchPosts(user.id); // Returns a promise for posts
    })
    .then(posts => {
      // This callback runs when the posts promise resolves
      console.log(`Got ${posts.length} posts.`);
    })
    .catch(err => {
      // This runs if ANY of the promises in the chain reject
      console.error('An error occurred:', err);
    });
}
```
This is a chain of callbacks. It works, but the logic is nested inside `.then()` blocks.

#### The "New" Way: Using `async/await`

```javascript
async function fetchUserAndPosts() {
  try {
    console.log('Starting to fetch user...');
    
    // 1. PAUSE here until fetchUser() promise resolves
    // 2. UNWRAP the resolved user object into the 'user' variable
    const user = await fetchUser();
    
    console.log(`Got user: ${user.name}. Fetching posts...`);

    // 3. PAUSE here until fetchPosts() promise resolves
    // 4. UNWRAP the resolved posts array into the 'posts' variable
    const posts = await fetchPosts(user.id);
    
    console.log(`Got ${posts.length} posts.`);
    
  } catch (err) {
    // If ANY 'await'ed promise rejects, execution jumps to this block.
    console.error('An error occurred:', err);
  }
}
```

### How `await` *Really* Works (Under the Hood)

When the JavaScript engine sees `const user = await fetchUser();`, it essentially transforms your code back into something that looks like the `.then()` version.

1.  The `fetchUserAndPosts` function starts running.
2.  It hits `await fetchUser()`.
3.  The engine **pauses `fetchUserAndPosts`** and effectively attaches a "hidden" `.then()` callback to the `fetchUser()` promise. This hidden callback contains *all the rest of the code in your function*.
4.  The `fetchUserAndPosts` function immediately returns a **new pending promise** to whatever called it.
5.  The Event Loop is now free to do other work.
6.  Later, the `fetchUser()` promise resolves with the user object.
7.  The Event Loop sees this and schedules the "hidden" callback (the rest of your function) to be run via the Microtask Queue.
8.  Your function resumes. The resolved user object is assigned to the `user` variable, and execution continues to the next line.

So, `async/await` is a powerful abstraction. It lets you write asynchronous code that looks and behaves like simple, readable, synchronous code, while the engine handles the complex promise-chaining and callback management for you behind the scenes.



You have hit on the absolute most important concept for understanding Promises. Your observation is **100% correct** and is the key to their power.

Let's rephrase your statement to be very precise, and then we'll break down why it works this way.

**Your Correct Observation:**
The code *inside* the `new Promise` constructor (which starts the async work and eventually calls `resolve`) begins running **immediately**. However, the code you put *inside* the `.then()` method will only be executed **later**, after the promise has been successfully resolved.

This separation is the entire point of promises.

---

### The Restaurant Order Analogy (Revisited)

This analogy perfectly illustrates the separation:

1.  **`new Promise((resolve, reject) => { ... })` is PLACING THE ORDER.**
    *   You walk up to the counter and tell the kitchen what you want (`fs.readFile(...)`, `fetch(...)`).
    *   **The kitchen starts cooking your food *immediately*.** The work has begun.
    *   The function returns a `Promise` object, which is your **receipt/buzzer**. This receipt is a placeholder for your future meal.

2.  **`.then(onFulfilledCallback)` is DECIDING WHAT TO DO WITH THE FOOD.**
    *   You take your receipt/buzzer and find a table.
    *   You tell yourself, "Okay, *when* my buzzer goes off (the promise resolves), I will take the food (the result) and start eating it (run the callback)."
    *   The `onFulfilledCallback` function is your "plan for eating." It doesn't run while the food is cooking. It only runs after the food has been delivered to you.

---

### The Detailed Workflow

Let's trace this code, focusing on the two separate "executions."

```javascript
console.log('Script start'); // A

// PHASE 1: Creating the Promise and Starting the Work
const myPromise = new Promise((resolve, reject) => { // B
  // This executor function runs IMMEDIATELY and SYNCHRONOUSLY.
  console.log('Promise executor started (Kitchen is cooking)'); // C
  
  // Start an asynchronous operation
  setTimeout(() => {
    // This async work happens in the background.
    console.log('Async work complete, calling resolve()...'); // E
    
    // The promise is now FULFILLED and holds the value 'Pizza!'.
    resolve('Pizza!');
    
  }, 2000);
});

// PHASE 2: Registering what to do with the result
console.log('Promise has been created. Registering .then() handler.'); // D

myPromise.then((result) => { // F
  // This callback is now registered. It will only run LATER.
  console.log(`Success! We got: ${result}`); // G
});

console.log('Script end');
```

#### Step-by-Step Execution Order:

1.  **A: `console.log('Script start')` runs.**
    *   Output: `Script start`

2.  **B: `new Promise(...)` is called.** The JavaScript engine immediately runs the executor function `(resolve, reject) => { ... }`.
    *   **C: `console.log('Promise executor started...')` runs.**
    *   Output: `Promise executor started (Kitchen is cooking)`
    *   **The `setTimeout` is handed to the Node API.** A 2-second timer starts in the background. The code does NOT wait here.
    *   The `Promise` constructor finishes and returns a **pending** promise object, which is stored in `myPromise`.

3.  **D: `console.log('Promise has been created...')` runs.** The main script continues without waiting for the timer.
    *   Output: `Promise has been created. Registering .then() handler.`

4.  **F: `myPromise.then(...)` is called.**
    *   This registers the callback function `(result) => { ... }` with the promise. It tells the promise, "When you are eventually fulfilled, run this function for me."
    *   The registration is instant. The code does NOT run the callback yet.

5.  **The main script finishes.** `console.log('Script end')` would run here if we added it. The Call Stack is now empty.

6.  **(2 seconds later...)** The `setTimeout` timer in the Node API finishes. Its callback `() => { resolve('Pizza!') }` is placed on the **Callback Queue**.

7.  The **Event Loop** moves this callback to the Call Stack.
    *   **E: `console.log('Async work complete...')` runs.**
    *   Output: `Async work complete, calling resolve()...`
    *   **`resolve('Pizza!')` is called.** This is the critical moment. The `myPromise` object's internal state changes from `pending` to `fulfilled`, and it now stores the value `'Pizza!'`.
    *   The engine sees that a function was registered with `.then()` for this promise, so it places that function `(result) => { ... }` on the **Microtask Queue**.

8.  The **Event Loop** sees the Microtask Queue is not empty, so it immediately moves the `.then()` callback to the Call Stack.
    *   **G: `console.log(`Success! We got: ${result}`)` runs.** The `result` argument is `'Pizza!'`.
    *   Output: `Success! We got: Pizza!`

### Why is this separation so important?

1.  **Decoupling:** The code that *starts* an operation (placing the order) is completely separate from the code that *handles* its result (eating the food). You can create a promise in one file, export it, and then import it and use `.then()` in a totally different file. This makes code much cleaner and more modular.

2.  **Composability:** Because promises are objects (placeholders/receipts), you can pass them around, store them in arrays, and manage them. This allows powerful patterns like `Promise.all()`, which waits for an array of promises to *all* complete—something that is a nightmare to manage with simple callbacks.

3.  **Predictability:** A promise can only be resolved or rejected **once**. This prevents bugs where a callback might accidentally be called multiple times. It provides a much more robust and predictable flow for asynchronous logic.



