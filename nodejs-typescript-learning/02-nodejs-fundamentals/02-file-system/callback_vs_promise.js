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