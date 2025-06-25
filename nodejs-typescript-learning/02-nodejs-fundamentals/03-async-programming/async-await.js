const fs = require('fs').promises;

async function readFile() {
  console.log('Reading file...');
  try {
    const data = await fs.readFile('example.txt', 'utf8');
    console.log('File content:', data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

readFile();
console.log('This will *still* log before the file content.');
