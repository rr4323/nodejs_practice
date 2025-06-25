# Streams in Node.js

Streams are collections of data — just like arrays or strings. The difference is that streams might not be available all at once, and they don't have to fit in memory. This makes streams really powerful when working with large amounts of data, or data that's coming from an external source one chunk at a time.

## Types of Streams

- **Readable** - Streams from which data can be read (e.g., `fs.createReadStream`)
- **Writable** - Streams to which data can be written (e.g., `fs.createWriteStream`)
- **Duplex** - Streams that are both Readable and Writable
- **Transform** - Duplex streams that can modify or transform the data as it is written and read

## Basic Examples

### Reading from a Stream
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('./example.txt', 'utf8');

readStream.on('data', (chunk) => {
  console.log('New chunk received:');
  console.log(chunk);
});

readStream.on('end', () => {
  console.log('Finished reading the file');
});
```

### Piping Streams
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('source.txt');
const writeStream = fs.createWriteStream('destination.txt');

// Pipe the read stream to the write stream
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('File writing completed');
});
```

## Exercise
1. Create a simple HTTP server that serves a large file using streams
2. Create a transform stream that converts text to uppercase
3. Pipe multiple streams together to process data
