// app.js
const fs = require('fs');
const path = require('path');
const fsExample = require('./fs-example');

// Directory and file paths
const dirName = 'example-files';
const fileName = path.join(dirName, 'example.txt');
const fileContent = 'Hello, this is some example content!\nThis is the second line.';

// Create directory
fsExample.createDirectory(dirName);

// Write to file
fsExample.writeToFile(fileName, fileContent);

// Read from file (with a small delay to ensure write completes)
setTimeout(() => {
  fsExample.readFromFile(fileName);
  
  // List files in directory
  fsExample.listFiles('.');
  x x 
  // Get file information
  fsExample.getFileInfo(fileName);
}, 100);

// Example of using fs.promises (Node.js 10+)
async function processFile() {
  try {
    const stats = await fs.promises.stat(fileName);
    console.log('\nUsing fs.promises:');
    console.log(`File size using promises: ${stats.size} bytes`);
  } catch (err) {
    console.error('Error with fs.promises:', err);
  }
}

processFile();

/*
Why This is a Bad Practice (It's a Race Condition)

This approach is extremely fragile and unreliable. It creates a race condition: your code is "racing" the file system, and you are betting that your 100ms delay is longer than the time it takes to write the file.

Here's why this will eventually fail:

    Slow System or Large File: What if the file being written is very large, or the server's disk is slow or busy? The write operation could easily take more than 100ms. In this case, readFromFile will execute before the write is complete, leading to:

        Reading an empty or partially written (corrupt) file.

        An error because the file hasn't even been created yet.

    Unnecessary Delay: What if the write operation is instant (a tiny file on a fast SSD)? Your program still waits for an unnecessary 100ms, making it less efficient.

    Unpredictability: This code might work perfectly on your fast developer machine but fail randomly and unpredictably in a different environment (like a busy production server). These are the worst kinds of bugs to track down.
*/

/*
Better way to use callback and modern way is to use promises.
// CORRECT WAY - USING ASYNC/AWAIT (BEST)

async function main() {
  try {
    // Step 1: Write to the file. The 'await' keyword pauses the function
    // here until the write operation is fully complete.
    await fsExample.writeToFile(fileName, 'Hello, World!');

    // This code is GUARANTEED to run only AFTER the await line is done.
    console.log('--- Write has completed, now reading... ---');
    
    await fsExample.readFromFile(fileName);
    await fsExample.listFiles('.');
    await fsExample.getFileInfo(fileName);

  } catch (err) {
    console.error("An error occurred:", err);
  }
}

main();
*/