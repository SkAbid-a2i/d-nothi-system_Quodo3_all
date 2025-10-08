// Script to check IP address and provide whitelisting instructions
const os = require('os');
const https = require('https');

console.log('=== IP Address Check ===');

// Get local IP addresses
const interfaces = os.networkInterfaces();
console.log('Local IP addresses:');
Object.keys(interfaces).forEach(interfaceName => {
  interfaces[interfaceName].forEach(interface => {
    if (!interface.internal && interface.family === 'IPv4') {
      console.log(`- ${interfaceName}: ${interface.address}`);
    }
  });
});

// Get public IP address
console.log('\nChecking public IP address...');
https.get('https://api.ipify.org', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Public IP address: ${data}`);
    console.log('\n=== TiDB Cloud Whitelisting Instructions ===');
    console.log('To fix the authentication issue:');
    console.log('1. Log in to your TiDB Cloud dashboard');
    console.log('2. Navigate to your cluster settings');
    console.log('3. Go to "Access Control" or "IP Whitelist" section');
    console.log(`4. Add your public IP address (${data}) to the whitelist`);
    console.log('5. If you have a dynamic IP, you may need to add a broader range');
    console.log('   or use "Allow All" (0.0.0.0/0) for testing (not recommended for production)');
    console.log('6. Save the changes and wait a few minutes for them to take effect');
    console.log('7. Try connecting again');
  });
}).on('error', (err) => {
  console.log('Error getting public IP:', err.message);
  console.log('\n=== TiDB Cloud Whitelisting Instructions ===');
  console.log('To fix the authentication issue:');
  console.log('1. Log in to your TiDB Cloud dashboard');
  console.log('2. Navigate to your cluster settings');
  console.log('3. Go to "Access Control" or "IP Whitelist" section');
  console.log('4. Add your current IP address to the whitelist');
  console.log('5. If you have a dynamic IP, you may need to add a broader range');
  console.log('   or use "Allow All" (0.0.0.0/0) for testing (not recommended for production)');
  console.log('6. Save the changes and wait a few minutes for them to take effect');
  console.log('7. Try connecting again');
});