# 2.2. File System (fs) Module

The `fs` module in Node.js provides an API for interacting with the file system. You can use it to read, write, update, and delete files.

## Reading Files

You can read files synchronously or asynchronously.

### Asynchronous Read

This is the recommended way to read files in Node.js, as it doesn't block the event loop.

**Example: `read-file-async.js`**

```javascript
const fs = require('fs');

fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

### Synchronous Read

This method blocks the event loop until the file is read. It can be useful for simple scripts or configuration loading.

**Example: `read-file-sync.js`**

```javascript
const fs = require('fs');

try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}
```

## Writing Files

Similar to reading, you can write to files synchronously or asynchronously.

### Asynchronous Write

**Example: `write-file-async.js`**

```javascript
const fs = require('fs');

const content = 'This is some content to write to the file.';

fs.writeFile('new-file-async.txt', content, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File written successfully!');
});
```

### Synchronous Write

**Example: `write-file-sync.js`**

```javascript
const fs = require('fs');

const content = 'This is some content for the sync file.';

try {
  fs.writeFileSync('new-file-sync.txt', content);
  console.log('File written successfully!');
} catch (err) {
  console.error(err);
}
```

---

Next, we will explore asynchronous programming in more detail.
