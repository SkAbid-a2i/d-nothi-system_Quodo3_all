require('dotenv').config();

console.log('Password test:');
console.log('Raw password:', process.env.DB_PASSWORD);
console.log('Password length:', process.env.DB_PASSWORD.length);
console.log('Password char codes:', process.env.DB_PASSWORD.split('').map(c => c.charCodeAt(0)));

// Test with a simple connection string
const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log('Connection string (without password for security):', 
  connectionString.replace(process.env.DB_PASSWORD, '***REDACTED***'));