// Display command line arguments
console.log('=== Command Line Arguments ===');
console.log('Process arguments:', process.argv);
console.log('Node executable:', process.argv[0]);
console.log('Script path:', process.argv[1]);
console.log('Script arguments:', process.argv.slice(2));

// Environment variables
console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('USER:', process.env.USER || process.env.USERNAME);
console.log('SHELL:', process.env.SHELL);

// Process information
console.log('\n=== Process Information ===');
console.log('Process ID:', process.pid);
console.log('Parent Process ID:', process.ppid);
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current Working Directory:', process.cwd());
console.log('Process Title:', process.title);

// Memory usage
console.log('\n=== Memory Usage ===');
const memoryUsage = process.memoryUsage();
console.log('RSS:', Math.round(memoryUsage.rss / 1024 / 1024) + ' MB');
console.log('Heap Total:', Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB');
console.log('Heap Used:', Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB');
console.log('External:', Math.round(memoryUsage.external / 1024 / 1024) + ' MB');

// Process events
process.on('exit', (code) => {
  console.log(`\nProcess is about to exit with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform cleanup if needed
  process.exit(1);
});

// Command line interface
console.log('\n=== Interactive Mode ===');
console.log('Type something and press Enter (type "exit" to quit)');

process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  const input = data.trim();
  if (input === 'exit') {
    console.log('Goodbye!');
    process.exit(0);
  }
  console.log(`You entered: ${input}`);
});

// Uncomment to test uncaught exception
// setTimeout(() => {
//   throw new Error('This is an uncaught exception!');
// }, 2000);
