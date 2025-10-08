/**
 * TiDB Cloud Connection Verification Script
 * 
 * This script helps verify your connection to TiDB Cloud
 * and provides troubleshooting information
 */

const dotenv = require('dotenv');
dotenv.config();

console.log('=== TiDB Cloud Connection Verification ===\n');

// Check environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

console.log('✅ Environment variables found:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT || 4000}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   SSL: ${process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled'}`);

// Get your public IP
console.log('\n📡 Checking your public IP address...');
const { exec } = require('child_process');

exec('curl -s ifconfig.me', (error, stdout, stderr) => {
  if (error) {
    console.log('   Could not determine public IP (curl command failed)');
  } else {
    console.log(`   Your public IP: ${stdout.trim()}`);
    console.log('   Make sure this IP is whitelisted in your TiDB Cloud cluster');
  }

  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Verify your credentials in the TiDB Cloud console');
  console.log('2. Check that your IP is whitelisted in TiDB Cloud Access Control');
  console.log('3. Ensure the database exists and user has access');
  console.log('4. Try connecting with the MySQL client:');
  console.log(`   mysql --ssl-mode=REQUIRED --host=${process.env.DB_HOST} --port=${process.env.DB_PORT || 4000} --user=${process.env.DB_USER} --password --database=${process.env.DB_NAME}`);
  console.log('\n💡 For the password prompt, enter:');
  console.log(`   ${process.env.DB_PASSWORD}`);
});