require('dotenv').config();
const mysql = require('mysql2');

console.log('Database Connection Diagnosis');
console.log('============================');

// Check environment variables
console.log('Environment Variables:');
console.log('- DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('- DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('- DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('- DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET - LENGTH: ' + process.env.DB_PASSWORD.length + ']' : 'NOT SET');

console.log('\nAttempting connection with SSL...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000 // 10 second timeout
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:');
    console.error('  Error message:', err.message);
    console.error('  Error code:', err.code);
    console.error('  Error number:', err.errno);
    
    // Common error explanations
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Possible causes:');
      console.log('  1. Incorrect username or password');
      console.log('  2. User does not have permission to connect from this IP');
      console.log('  3. User does not have permissions on this database');
      console.log('  4. Account is locked or expired');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible causes:');
      console.log('  1. Database server is not running');
      console.log('  2. Incorrect host or port');
      console.log('  3. Network/firewall issues');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('\n💡 Possible causes:');
      console.log('  1. Network connectivity issues');
      console.log('  2. Firewall blocking connection');
      console.log('  3. Database server overload');
    }
    
    return;
  }
  
  console.log('✅ Connected successfully!');
  
  // Test basic query
  connection.query('SELECT USER(), DATABASE()', (error, results) => {
    if (error) {
      console.error('❌ Query failed:', error.message);
      connection.end();
      return;
    }
    
    console.log('✅ Query successful:');
    console.log('  Current user:', results[0]['USER()']);
    console.log('  Current database:', results[0]['DATABASE()']);
    
    // Test table access
    connection.query('SHOW TABLES', (error, results) => {
      if (error) {
        console.error('❌ SHOW TABLES failed:', error.message);
        connection.end();
        return;
      }
      
      console.log('✅ Database tables:');
      results.forEach(row => {
        console.log('  -', Object.values(row)[0]);
      });
      
      connection.end();
      console.log('\n🔒 Connection closed.');
    });
  });
});