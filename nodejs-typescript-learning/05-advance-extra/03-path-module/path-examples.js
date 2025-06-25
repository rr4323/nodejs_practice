const path = require('path');

// Get the current file's directory
console.log('Current directory:', __dirname);

// Join path segments
const fullPath = path.join(__dirname, '..', 'data', 'files', 'example.txt');
console.log('\nJoined path:', fullPath);

// Get the file extension
console.log('\nFile extension of example.txt:', path.extname('example.txt'));

// Get the base name
console.log('Base name of example.txt:', path.basename('example.txt'));
console.log('Base name without extension:', path.basename('example.txt', '.txt'));

// Get the directory name
console.log('\nDirectory name of /path/to/file.txt:', path.dirname('/path/to/file.txt'));

// Get the current working directory
console.log('\nCurrent working directory:', process.cwd());

// Resolve a path
console.log('\nResolved path:', path.resolve('data', 'config', 'app.json'));

// Normalize a path
console.log('\nNormalized path:', path.normalize('/foo/bar//baz/asdf/quux/..'));

// Get path segments
const pathObj = path.parse('/home/user/dir/file.txt');
console.log('\nPath object:', JSON.stringify(pathObj, null, 2));

// Format a path object
console.log('\nFormatted path:', path.format({
  dir: '/home/user/dir',
  base: 'file.txt'
}));
