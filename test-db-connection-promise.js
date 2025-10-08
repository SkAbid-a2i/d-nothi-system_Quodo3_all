// Promise-based database connection test with detailed error handling
const mysql = require('mysql2/promise');

console.log('=== Promise-based MySQL Connection Test ===');

async function testConnection() {
  let connection;
  
  try {
    console.log('Attempting to connect...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: '4VmPGSU3EFyEhLJ.root',
      password: 'gWe9gfuhBBE50H1u',
      database: 'd_nothi_db',
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 30000, // 30 second timeout
      trace: true // Enable tracing for better error messages
    });
    
    console.log('✅ Connection established successfully!');
    console.log('Connection info:', {
      threadId: connection.threadId,
      authorized: connection.authorized,
      serverVersion: connection.serverVersion
    });
    
    // Test a simple query
    console.log('Testing simple query...');
    const [results] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', results);
    
    // Test database access
    console.log('Testing database access...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('✅ SHOW DATABASES successful');
    const dbNames = databases.map(row => row.Database);
    console.log('Available databases:', dbNames.filter(db => db.includes('nothi')));
    
    // Test specific database access
    console.log('Testing specific database access...');
    await connection.execute(`USE \`d_nothi_db\``);
    console.log('✅ Database access successful');
    
    // Test table listing
    console.log('Testing table listing...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Table listing successful');
    console.log('Tables found:', tables);
    
    await connection.end();
    console.log('🔒 Connection closed.');
    console.log('\n🎉 All tests passed! Database connection is working.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    // Detailed error analysis
    switch (error.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('\n🔐 ACCESS DENIED - Detailed Analysis:');
        console.error('1. Username or password is incorrect');
        console.error('2. User does not have access from this host');
        console.error('3. User does not have privileges for the specified database');
        console.error('4. Account may be locked or expired');
        break;
      case 'ECONNREFUSED':
        console.error('\n🔌 CONNECTION REFUSED - Detailed Analysis:');
        console.error('1. Database server is not accepting connections');
        console.error('2. Host or port is incorrect');
        console.error('3. Network firewall is blocking the connection');
        break;
      case 'ENOTFOUND':
        console.error('\n🔍 HOST NOT FOUND - Detailed Analysis:');
        console.error('1. Hostname is incorrect');
        console.error('2. DNS resolution is failing');
        console.error('3. Network connectivity issues');
        break;
      case 'ETIMEDOUT':
        console.error('\n⏰ CONNECTION TIMEOUT - Detailed Analysis:');
        console.error('1. Network latency is too high');
        console.error('2. Database server is overloaded');
        console.error('3. Connection timeout settings are too short');
        break;
      default:
        console.error('\n❓ UNKNOWN ERROR - Detailed Analysis:');
        console.error('1. Check TiDB Cloud status dashboard');
        console.error('2. Verify all connection parameters');
        console.error('3. Try connecting from a different network or machine');
    }
    
    // Try to close connection if it exists
    if (connection) {
      try {
        await connection.end();
        console.log('🔒 Connection closed.');
      } catch (closeError) {
        console.error('❌ Error closing connection:', closeError.message);
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection();