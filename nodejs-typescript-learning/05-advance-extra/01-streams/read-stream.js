const fs = require('fs');
const path = require('path');

// Create a read stream
const filePath = path.join(__dirname, 'example.txt');
const readStream = fs.createReadStream(filePath, 'utf8');

console.log('Starting to read file using streams...\n');

// Handle data events
readStream.on('data', (chunk) => {
  console.log('=== New Chunk Received ===');
  console.log(chunk);
});

// Handle end of file
readStream.on('end', () => {
  console.log('\n=== Finished reading the file ===');
});

// Handle errors
readStream.on('error', (err) => {
  console.error('Error reading file:', err);
});
