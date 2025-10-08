// Test connection without specifying database initially
const mysql = require('mysql2/promise');

console.log('=== Testing Connection Without Database ===');

async function testConnection() {
  let connection;
  
  try {
    console.log('Connecting without specifying database...');
    
    // Create connection without specifying database
    connection = await mysql.createConnection({
      host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: '4VmPGSU3EFyEhLJ.root',
      password: 'gWe9gfuhBBE50H1u',
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 15000
    });
    
    console.log('✅ Initial connection successful!');
    console.log('Connection info:', {
      threadId: connection.threadId,
      serverVersion: connection.serverVersion
    });
    
    // Test a simple query
    console.log('Testing simple query...');
    const [results] = await connection.execute('SELECT VERSION() as version');
    console.log('✅ Server version:', results[0].version);
    
    // List available databases
    console.log('Listing available databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('✅ SHOW DATABASES successful');
    const dbNames = databases.map(row => row.Database);
    console.log('Available databases:', dbNames.filter(db => db.includes('nothi') || db.includes('d_')));
    
    // Try to use the specific database
    console.log('Attempting to use d_nothi_db...');
    await connection.execute('USE `d_nothi_db`');
    console.log('✅ Database selected successfully');
    
    // Test table listing
    console.log('Listing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ SHOW TABLES successful');
    console.log('Tables found:', tables.length > 0 ? tables : 'No tables found');
    
    await connection.end();
    console.log('🔒 Connection closed.');
    console.log('\n🎉 All tests passed! Connection is working.');
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    // Try to close connection if it exists
    if (connection) {
      try {
        await connection.end();
        console.log('🔒 Connection closed.');
      } catch (closeError) {
        console.error('❌ Error closing connection:', closeError.message);
      }
    }
    
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (!success) {
    console.log('\n=== Troubleshooting Steps ===');
    console.log('1. Verify the database name "d_nothi_db" exists in TiDB Cloud');
    console.log('2. Check if the user has privileges to access this database');
    console.log('3. Try creating a new database with a simpler name');
    console.log('4. Contact TiDB support with the detailed error information');
  }
});