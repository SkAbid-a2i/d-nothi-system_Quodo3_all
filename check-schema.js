// This script tries to check the database schema
require('dotenv').config();
const mysql = require('mysql2');

console.log('Checking database schema...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err.message);
    return;
  }
  
  console.log('Connected successfully!');
  
  // Check tasks table structure
  connection.query('DESCRIBE tasks', (error, results) => {
    if (error) {
      console.error('Failed to describe tasks table:', error.message);
      connection.end();
      return;
    }
    
    console.log('Tasks table structure:');
    results.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default ? 'DEFAULT ' + row.Default : ''}`);
    });
    
    connection.end();
  });
});