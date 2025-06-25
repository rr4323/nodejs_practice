const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs');
const crypto = require('crypto');

console.log('=== Performance Measurement Examples ===\n');

// 1. Using console.time and console.timeEnd
console.log('1. Measuring with console.time:');
console.time('hashing');
const hash = crypto.createHash('sha256');
for (let i = 0; i < 1e6; i++) {
  hash.update('some data');
}
const digest = hash.digest('hex');
console.timeEnd('hashing');

// 2. Using performance.now()
console.log('\n2. Measuring with performance.now():');
const start = performance.now();
let total = 0;
for (let i = 0; i < 1e8; i++) {
  total += i;
}
const end = performance.now();
console.log(`Loop took ${(end - start).toFixed(2)}ms`);

// 3. Using Performance Observer
console.log('\n3. Measuring with PerformanceObserver:');
const obs = new PerformanceObserver((items) => {
  const entries = items.getEntries();
  console.log(`\nPerformance Entry: ${entries[0].name}`);
  console.log(`Duration: ${entries[0].duration.toFixed(2)}ms`);
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('A');
let result = 0;
for (let i = 0; i < 1e7; i++) {
  result += Math.sqrt(i);
}
performance.mark('B');
performance.measure('A to B', 'A', 'B');

// 4. Memory usage
console.log('\n4. Memory Usage:');
const initialMemory = process.memoryUsage();
console.log('Initial Memory Usage:');
console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// Allocate some memory
const bigArray = [];
for (let i = 0; i < 1000000; i++) {
  bigArray.push({ id: i, data: 'x'.repeat(100) });
}

const afterMemory = process.memoryUsage();
console.log('\nMemory Usage after allocation:');
console.log(`  RSS: ${(afterMemory.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Total: ${(afterMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Used: ${(afterMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// 5. Garbage collection (requires --expose-gc flag)
if (global.gc) {
  console.log('\n5. Forcing Garbage Collection:');
  const beforeGC = process.memoryUsage().heapUsed;
  global.gc();
  const afterGC = process.memoryUsage().heapUsed;
  console.log(`Freed ${((beforeGC - afterGC) / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('\n5. Run with --expose-gc flag to test garbage collection');
}

// 6. Benchmarking with hrtime
console.log('\n6. Benchmarking with process.hrtime:');
function benchmark() {
  const start = process.hrtime();
  
  // Operation to benchmark
  let sum = 0;
  for (let i = 0; i < 1e8; i++) {
    sum += i;
  }
  
  const diff = process.hrtime(start);
  return (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
}

// Run benchmark multiple times
const iterations = 5;
let totalTime = 0;
for (let i = 0; i < iterations; i++) {
  const time = benchmark();
  console.log(`Run ${i + 1}: ${time.toFixed(2)}ms`);
  totalTime += time;
}
console.log(`Average: ${(totalTime / iterations).toFixed(2)}ms`);

// 7. Profiling with --prof and --prof-process
console.log('\n7. To profile this script:');
console.log('  1. Run: node --prof performance-examples.js');
console.log('  2. Then: node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt');

// 8. CPU profiling with --cpu-prof
console.log('\n8. For CPU profiling:');
console.log('  1. Run: node --cpu-prof performance-examples.js');
console.log('  2. Open the generated .cpuprofile file in Chrome DevTools');

console.log('\n=== Performance Testing Complete ===');
