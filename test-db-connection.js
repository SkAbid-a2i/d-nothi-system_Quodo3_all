// Simple database connection test
require('dotenv').config();

console.log('Database Connection Parameters:');
console.log('============================');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('SSL Enabled:', process.env.DB_SSL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test if we can connect using mysql2 directly
const mysql = require('mysql2');

console.log('\nTesting direct MySQL connection...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

connection.connect((err) => {
  if (err) {
    console.error('Direct MySQL connection failed:', err.message);
    console.error('Error code:', err.code);
    console.error('Error number:', err.errno);
    process.exit(1);
  }
  console.log('✅ Direct MySQL connection successful!');
  connection.end();
  process.exit(0);
});