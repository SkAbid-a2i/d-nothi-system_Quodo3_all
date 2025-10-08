const mysql = require('mysql2');

console.log('Testing TLS connection to TiDB Cloud...');

// Database configuration with TLS
const config = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4VmPGSU3EFyEhLJ.root',
  password: 'gWe9gfuhBBE50H1u',
  database: 'd_nothi_db',
  ssl: {
    rejectUnauthorized: true
  },
  connectTimeout: 30000
};

// Create connection
const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) {
      console.error('   Error code:', err.code);
    }
    if (err.errno) {
      console.error('   Error number:', err.errno);
    }
    process.exit(1);
  }
  console.log('✅ Connected successfully with TLS!');
  
  // Verify password by running a simple query
  connection.query('SELECT USER(), DATABASE()', (error, results) => {
    if (error) {
      console.error('❌ Query failed:', error.message);
      connection.end();
      return;
    }
    
    console.log('✅ User authenticated:', results[0]['USER()']);
    console.log('✅ Database connected:', results[0]['DATABASE()']);
    
    // Now verify the tasks table schema
    verifyTasksTableSchema(connection);
  });
});

function verifyTasksTableSchema(connection) {
  console.log('\n🔍 Verifying tasks table schema...');
  
  const schemaQuery = `
    SELECT 
      COLUMN_NAME,
      COLUMN_TYPE,
      IS_NULLABLE,
      COLUMN_DEFAULT,
      COLUMN_KEY,
      EXTRA
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'd_nothi_db' 
    AND TABLE_NAME = 'tasks'
    ORDER BY ORDINAL_POSITION
  `;
  
  connection.query(schemaQuery, (error, results) => {
    if (error) {
      console.error('❌ Schema verification failed:', error.message);
      connection.end();
      return;
    }
    
    if (results.length === 0) {
      console.log('⚠️  Tasks table not found in database');
      checkForAnyTasksTable(connection);
      return;
    }
    
    console.log('✅ Tasks table found with the following schema:');
    console.log('\nColumn Name'.padEnd(20) + 'Type'.padEnd(20) + 'Nullable'.padEnd(12) + 'Key'.padEnd(10) + 'Extra');
    console.log('-'.repeat(80));
    
    results.forEach(row => {
      console.log(
        row.COLUMN_NAME.padEnd(20) +
        row.COLUMN_TYPE.padEnd(20) +
        row.IS_NULLABLE.padEnd(12) +
        row.COLUMN_KEY.padEnd(10) +
        row.EXTRA
      );
    });
    
    // Check for essential columns
    checkEssentialColumns(results);
    
    connection.end();
  });
}

function checkForAnyTasksTable(connection) {
  console.log('\n🔍 Checking for any table with "task" in the name...');
  
  const searchQuery = `
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'd_nothi_db' 
    AND TABLE_NAME LIKE '%task%'
  `;
  
  connection.query(searchQuery, (error, results) => {
    if (error) {
      console.error('❌ Table search failed:', error.message);
      connection.end();
      return;
    }
    
    if (results.length === 0) {
      console.log('❌ No tables with "task" in the name found');
    } else {
      console.log('✅ Found tables with "task" in the name:');
      results.forEach(row => {
        console.log('   -', row.TABLE_NAME);
      });
    }
    
    connection.end();
  });
}

function checkEssentialColumns(columns) {
  console.log('\n📋 Checking for essential task columns...');
  
  const essentialColumns = [
    'id', 'title', 'description', 'status', 'priority', 
    'assigned_to', 'created_by', 'created_at', 'updated_at'
  ];
  
  const columnNames = columns.map(col => col.COLUMN_NAME);
  
  essentialColumns.forEach(column => {
    if (columnNames.includes(column)) {
      console.log(`✅ Found essential column: ${column}`);
    } else {
      console.log(`⚠️  Missing essential column: ${column}`);
    }
  });
}