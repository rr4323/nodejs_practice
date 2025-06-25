const fs = require('fs');

const content = 'This is some content for the sync file.';

try {
  fs.writeFileSync('new-file-sync.txt', content);
  console.log('File written successfully!');
} catch (err) {
  console.error(err);
}
