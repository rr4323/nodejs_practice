const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

// Create a transform stream to convert text to uppercase
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    // Convert chunk to string and uppercase it
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Create read and write streams
const sourcePath = path.join(__dirname, 'example.txt');
const destinationPath = path.join(__dirname, 'uppercase.txt');

const readStream = fs.createReadStream(sourcePath, 'utf8');
const writeStream = fs.createWriteStream(destinationPath);

console.log('Starting to process file...');

// Pipe the streams together
readStream
  .pipe(upperCaseTransform)  // Transform the data
  .pipe(writeStream)         // Write to file
  .on('finish', () => {
    console.log('File processing complete!');
    console.log(`Uppercase content written to: ${destinationPath}`);
  })
  .on('error', (err) => {
    console.error('Error processing file:', err);
  });
