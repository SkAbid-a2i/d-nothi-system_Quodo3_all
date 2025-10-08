// Script to verify credentials and provide detailed troubleshooting
const crypto = require('crypto');

console.log('=== Credential Verification ===');

// Provided credentials
const credentials = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4VmPGSU3EFyEhLJ.root',
  password: 'gWe9gfuhBBE50H1u',
  database: 'd_nothi_db'
};

console.log('Credentials Analysis:');
console.log('- Host:', credentials.host);
console.log('- Port:', credentials.port);
console.log('- User:', credentials.user);
console.log('- Password length:', credentials.password.length);
console.log('- Database:', credentials.database);

// Check for special characters in password
const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
console.log('- Password has special characters:', specialChars.test(credentials.password));

// Check password encoding
console.log('- Password encoding check:');
for (let i = 0; i < credentials.password.length; i++) {
  const char = credentials.password[i];
  console.log(`  Char ${i}: '${char}' (code: ${char.charCodeAt(0)})`);
}

// Generate connection string
const connectionString = `mysql://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.database}`;
console.log('\nConnection String:');
console.log(connectionString);

// Check if connection string needs encoding
const encodedPassword = encodeURIComponent(credentials.password);
const encodedConnectionString = `mysql://${credentials.user}:${encodedPassword}@${credentials.host}:${credentials.port}/${credentials.database}`;
console.log('\nEncoded Connection String:');
console.log(encodedConnectionString);

console.log('\n=== Troubleshooting Steps ===');
console.log('1. Try connecting with MySQL command line:');
console.log(`   mysql -h ${credentials.host} -P ${credentials.port} -u ${credentials.user} -p`);
console.log('   (Enter password when prompted)');
console.log('\n2. Try with encoded password:');
console.log(`   mysql -h ${credentials.host} -P ${credentials.port} -u ${credentials.user} -p"${credentials.password}"`);
console.log('\n3. Verify database exists:');
console.log('   After connecting, run: SHOW DATABASES;');
console.log(`   Look for: ${credentials.database}`);
console.log('\n4. Check user privileges:');
console.log('   After connecting, run: SHOW GRANTS;');
console.log('\n5. If still failing, try creating a new user in TiDB Cloud with simpler credentials');

console.log('\n=== Alternative Connection Methods ===');
console.log('1. Use MySQL Workbench with these credentials');
console.log('2. Use phpMyAdmin if available');
console.log('3. Try connecting from a different machine/network');
console.log('4. Contact TiDB support with error details');