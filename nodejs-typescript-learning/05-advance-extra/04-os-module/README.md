# OS Module in Node.js

The `os` module provides operating system-related utility methods and properties. It can be used to get information about the operating system, such as CPU architecture, memory, network interfaces, and more.

## Common OS Methods and Properties

### `os.platform()`
Returns a string identifying the operating system platform.

```javascript
const os = require('os');
console.log('Platform:', os.platform());
// Possible values: 'darwin', 'freebsd', 'linux', 'openbsd', 'win32', etc.
```

### `os.arch()`
Returns the operating system CPU architecture.

```javascript
console.log('Architecture:', os.arch());
// Possible values: 'x64', 'arm', 'arm64', 'ia32', 'mips', etc.
```

### `os.cpus()`
Returns an array of objects containing information about each logical CPU core.

```javascript
const cpus = os.cpus();
console.log('CPU Cores:', cpus.length);
console.log('CPU Model:', cpus[0].model);
```

### `os.freemem()` and `os.totalmem()`
Get free and total system memory.

```javascript
const totalMem = os.totalmem();
const freeMem = os.freemem();
console.log(`Total Memory: ${(totalMem / (1024 * 1024 * 1024)).toFixed(2)} GB`);
console.log(`Free Memory: ${(freeMem / (1024 * 1024 * 1024)).toFixed(2)} GB`);
console.log(`Memory Usage: ${((totalMem - freeMem) / totalMem * 100).toFixed(2)}%`);
```

### `os.hostname()`
Returns the hostname of the operating system.

```javascript
console.log('Hostname:', os.hostname());
```

### `os.networkInterfaces()`
Returns an object containing network interfaces that have been assigned a network address.

```javascript
const networkInterfaces = os.networkInterfaces();
console.log('Network Interfaces:', Object.keys(networkInterfaces));
```

## Practical Example: System Monitoring Tool

```javascript
const os = require('os');

function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMem: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMem: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
    uptime: (os.uptime() / 60 / 60).toFixed(2) + ' hours'
  };
}

console.log('=== System Information ===');
console.table(getSystemInfo());
```

## Exercise
1. Create a system monitoring dashboard that updates in real-time
2. Build a script that alerts when system resources are running low
3. Create a simple network scanner using the network interfaces information
