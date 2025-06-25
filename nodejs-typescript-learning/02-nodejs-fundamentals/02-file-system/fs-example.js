// fs-example.js
const fs = require('fs');
const path = require('path');

// Create a directory if it doesn't exist
const createDirectory = (dirName) => {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
    console.log(`Directory '${dirName}' created successfully.`);
  } else {
    console.log(`Directory '${dirName}' already exists.`);
  }
};

// Write content to a file
const writeToFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log(`Successfully wrote to ${fileName}`);
  });
};

// Read content from a file
const readFromFile = (fileName) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    console.log(`Content of ${fileName}:`);
    console.log(data);
  });
};

// List files in a directory
const listFiles = (dirPath) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    console.log(`Files in ${dirPath}:`);
    files.forEach(file => {
      console.log(`- ${file}`);
    });
  });
};

// Get file information
const getFileInfo = (filePath) => {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error('Error getting file stats:', err);
      return;
    }
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Size: ${stats.size} bytes`);
    console.log(`Created: ${stats.birthtime}`);
    console.log(`Is directory: ${stats.isDirectory()}`);
    console.log(`Is file: ${stats.isFile()}`);
  });
};

// Export all functions
module.exports = {
  createDirectory,
  writeToFile,
  readFromFile,
  listFiles,
  getFileInfo
};
