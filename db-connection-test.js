const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  
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
  
  try {
    console.log('Attempting to connect to database...');
    const connection = await mysql.createConnection(config);
    console.log('✓ Successfully connected to database');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✓ Simple query executed successfully:', rows);
    
    await connection.end();
    console.log('✓ Database connection closed');
    
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    if (error.errno) {
      console.error('  Error code:', error.errno);
    }
    if (error.code) {
      console.error('  Error code:', error.code);
    }
  }
}

testConnection();