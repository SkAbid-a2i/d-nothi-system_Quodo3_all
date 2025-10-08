/**
 * Database Connection Verification Script
 * This script helps verify TLS connection and provides troubleshooting information
 */

const dotenv = require('dotenv');
dotenv.config();

console.log('=== Database Connection Verification ===\n');

// Display current configuration
console.log('Current Configuration:');
console.log('  Host:', process.env.DB_HOST || 'Not set');
console.log('  Port:', process.env.DB_PORT || '4000');
console.log('  User:', process.env.DB_USER || 'Not set');
console.log('  Database:', process.env.DB_NAME || 'Not set');
console.log('  SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');

// Check if all required environment variables are present
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing Environment Variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
}

// Get public IP for whitelist verification
console.log('\n=== Network Information ===');
console.log('Your public IP address (add this to TiDB Cloud whitelist):');
console.log('  curl ifconfig.me');

// Provide connection commands
console.log('\n=== Connection Commands ===');
console.log('1. MySQL CLI with TLS (recommended):');
console.log(`   mysql --ssl-mode=REQUIRED \\`);
console.log(`         --host=${process.env.DB_HOST || 'your-host'} \\`);
console.log(`         --port=${process.env.DB_PORT || '4000'} \\`);
console.log(`         --user=${process.env.DB_USER || 'your-user'} \\`);
console.log(`         --password \\`);
console.log(`         --database=${process.env.DB_NAME || 'your-database'}`);

console.log('\n2. If you have SSL certificates:');
console.log(`   mysql --ssl-ca=/path/to/ca.pem \\`);
console.log(`         --host=${process.env.DB_HOST || 'your-host'} \\`);
console.log(`         --port=${process.env.DB_PORT || '4000'} \\`);
console.log(`         --user=${process.env.DB_USER || 'your-user'} \\`);
console.log(`         --password \\`);
console.log(`         --database=${process.env.DB_NAME || 'your-database'}`);

// Provide troubleshooting steps
console.log('\n=== Troubleshooting Steps ===');
console.log('1. 🔐 Verify Credentials:');
console.log('   - Log in to TiDB Cloud console');
console.log('   - Check your cluster connection details');
console.log('   - Verify username and password');

console.log('\n2. 🌐 IP Whitelist:');
console.log('   - In TiDB Cloud, go to your cluster');
console.log('   - Navigate to "Access Control"');
console.log('   - Add your public IP to the whitelist');
console.log('   - Your IP: Run "curl ifconfig.me" to find it');

console.log('\n3. 🗄️  Database Access:');
console.log('   - Ensure user has access to the database');
console.log('   - Check if database exists');
console.log('   - Verify user permissions');

console.log('\n4. 🔧 Connection Test:');
console.log('   - Test with MySQL CLI first');
console.log('   - Then test with application');

console.log('\n5. 📋 Schema Verification:');
console.log('   - Once connected, check for tasks table:');
console.log('     SHOW TABLES LIKE \'tasks\';');
console.log('   - Verify table schema:');
console.log('     DESCRIBE tasks;');