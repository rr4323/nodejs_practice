# Path Module in Node.js

The `path` module provides utilities for working with file and directory paths. It's especially useful for handling cross-platform path differences between Windows and POSIX systems.

## Common Path Methods

### `path.join([...paths])`
Joins all given path segments together using the platform-specific separator.

```javascript
const path = require('path');

// On Windows
console.log(path.join('dir', 'subdir', 'file.txt'));
// Output: dir\subdir\file.txt

// On POSIX (Unix-like)
// Output: dir/subdir/file.txt
```

### `path.resolve([...paths])`
Resolves a sequence of paths or path segments into an absolute path.

```javascript
console.log(path.resolve('app.js'));
// Output: /Users/username/projects/app.js (or similar absolute path)

console.log(path.resolve('/foo/bar', './baz'));
// Output: /foo/bar/baz
```

### `path.basename(path[, ext])`
Returns the last portion of a path.

```javascript
console.log(path.basename('/foo/bar/baz.txt'));
// Output: baz.txt

console.log(path.basename('/foo/bar/baz.txt', '.txt'));
// Output: baz
```

### `path.dirname(path)`
Returns the directory name of a path.

```javascript
console.log(path.dirname('/foo/bar/baz.txt'));
// Output: /foo/bar
```

### `path.extname(path)`
Returns the extension of the path.

```javascript
console.log(path.extname('index.html'));
// Output: .html
```

## Practical Example: Working with File Paths

```javascript
const path = require('path');

// Get the directory name of the current module
console.log('Directory name:', __dirname);

// Create a path to a file in the same directory
const filePath = path.join(__dirname, 'data', 'users.json');
console.log('File path:', filePath);

// Get file extension
console.log('File extension:', path.extname(filePath));

// Get the base name without extension
const baseName = path.basename(filePath, path.extname(filePath));
console.log('Base name:', baseName);
```

## Exercise
1. Create a script that finds all files with a specific extension in a directory
2. Create a function that normalizes file paths for different operating systems
3. Build a simple file path resolver that handles relative paths
