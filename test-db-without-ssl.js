require('dotenv').config();
const mysql = require('mysql2');

console.log('Testing MySQL connection without SSL...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Try without SSL first
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    if (err.code) {
      console.error('Error code:', err.code);
    }
    return;
  }
  console.log('✅ Connected to database successfully!');
  
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('❌ Error executing query:', error.message);
      connection.end();
      return;
    }
    console.log('✅ Query result:', results[0].solution);
    connection.end();
    console.log('🔒 Database connection closed.');
  });
});