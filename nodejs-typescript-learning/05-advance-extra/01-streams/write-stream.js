const fs = require('fs');
const path = require('path');

// Create a write stream
const outputPath = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(outputPath);

// Write data to the stream
writeStream.write('Hello, this is line 1\n');
writeStream.write('This is line 2\n');
writeStream.write('And this is the last line!\n');

// Mark the end of file
writeStream.end('=== End of file ===\n');

// Handle finish event
writeStream.on('finish', () => {
  console.log('Data has been written to output.txt');
  console.log('Check the file at:', outputPath);
});

// Handle errors
writeStream.on('error', (err) => {
  console.error('Error writing to file:', err);
});
