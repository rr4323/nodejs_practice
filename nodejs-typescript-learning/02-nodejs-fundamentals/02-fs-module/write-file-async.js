const fs = require('fs');

const content = 'This is some content to write to the file.';

fs.writeFile('new-file-async.txt', content, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File written successfully!');
});
