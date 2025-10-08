const mysql = require('mysql2');

// Database configuration
const config = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4VmPGSU3EFyEhLJ.root',
  password: 'gWe9gfuhBBE50H1u',
  database: 'd_nothi_db',
  ssl: {
    rejectUnauthorized: true
  }
};

console.log('Attempting to connect to TiDB Cloud...');

// Create connection
const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    if (err.code) {
      console.error('Error code:', err.code);
    }
    if (err.errno) {
      console.error('Error number:', err.errno);
    }
    return;
  }
  console.log('Connected successfully!');
  
  // Run a simple query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('Error executing query:', error.message);
      connection.end();
      return;
    }
    
    console.log('Query result:', results[0].solution);
    connection.end();
  });
});