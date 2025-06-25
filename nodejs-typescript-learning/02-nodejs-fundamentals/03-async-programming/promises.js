const fs = require('fs').promises; // Use the promise-based version of fs

console.log('Reading file...');

fs.readFile('example.txt', 'utf8')
  .then(data => {
    console.log('File content:', data);
  })
  .catch(err => {
    console.error('Error reading file:', err);
  });

console.log('This will also log before the file content.');
