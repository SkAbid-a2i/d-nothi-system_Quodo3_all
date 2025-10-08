// Explicit database connection test with detailed configuration
const mysql = require('mysql2');

console.log('=== Explicit MySQL Connection Test ===');

const config = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4VmPGSU3EFyEhLJ.root',
  password: 'gWe9gfuhBBE50H1u',
  database: 'd_nothi_db',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('Connection Configuration:');
console.log('- Host:', config.host);
console.log('- Port:', config.port);
console.log('- User:', config.user);
console.log('- Database:', config.database);

// Create connection
const connection = mysql.createConnection({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    
    // Check specific error codes
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔐 ACCESS DENIED - Troubleshooting steps:');
      console.error('1. Double-check username and password');
      console.error('2. Verify user has privileges for this database');
      console.error('3. Check if user can connect from this host');
      console.error('4. Try connecting with a MySQL client directly');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔌 CONNECTION REFUSED - Troubleshooting steps:');
      console.error('1. Verify host and port are correct');
      console.error('2. Check if database server is running');
      console.error('3. Verify network connectivity');
    } else {
      console.error('\n❓ OTHER ERROR - Troubleshooting steps:');
      console.error('1. Check TiDB Cloud status');
      console.error('2. Verify all connection parameters');
      console.error('3. Try connecting from a different network');
    }
    
    process.exit(1);
  }
  
  console.log('✅ Connection successful!');
  
  // Test a simple query
  connection.query('SELECT 1 as test', (error, results) => {
    if (error) {
      console.error('❌ Query failed:', error.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('✅ Query successful:', results);
    
    // Test database access
    connection.query('SHOW DATABASES', (error, results) => {
      if (error) {
        console.error('❌ SHOW DATABASES failed:', error.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('✅ SHOW DATABASES successful');
      const databases = results.map(row => row.Database);
      console.log('Available databases:', databases.filter(db => db.includes('nothi')));
      
      connection.end();
      console.log('🔒 Connection closed.');
      console.log('\n🎉 All tests passed! Database connection is working.');
    });
  });
});