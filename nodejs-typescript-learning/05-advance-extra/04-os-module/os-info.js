const os = require('os');

// Basic OS information
console.log('=== OS Information ===');
console.log('Platform:', os.platform());
console.log('OS Type:', os.type());
console.log('OS Release:', os.release());
console.log('Architecture:', os.arch());
console.log('Hostname:', os.hostname());
console.log('Home Directory:', os.homedir());
console.log('Temporary Directory:', os.tmpdir());

// CPU information
console.log('\n=== CPU Information ===');
console.log('CPU Cores:', os.cpus().length);
console.log('CPU Model:', os.cpus()[0].model);
console.log('CPU Speed:', os.cpus()[0].speed + 'MHz');

// Memory information
console.log('\n=== Memory Information ===');
console.log('Total Memory:', (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB');
console.log('Free Memory:', (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB');
console.log('Memory Usage:', ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%');

// Network interfaces
console.log('\n=== Network Interfaces ===');
const networks = os.networkInterfaces();
Object.keys(networks).forEach(interfaceName => {
  console.log(`\n${interfaceName}:`);
  networks[interfaceName].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`  ${iface.address} (${iface.netmask})`);
    }
  });
});

// System uptime
console.log('\n=== System Uptime ===');
console.log('Uptime:', (os.uptime() / 3600).toFixed(2) + ' hours');
console.log('Load Average:', os.loadavg().map(load => load.toFixed(2)).join(', '));

// User information
console.log('\n=== User Information ===');
console.log('Current User:', os.userInfo().username);
console.log('User Home:', os.homedir());
console.log('Shell:', os.userInfo().shell);
