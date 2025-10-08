// Script to verify database schema after fixes
const mysql = require('mysql2/promise');

console.log('=== Database Schema Verification ===');

async function verifySchema() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
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
      connectTimeout: 15000
    });
    
    console.log('✅ Connected successfully!');
    
    // Get table structure
    console.log('\n--- Checking tasks table structure ---');
    const [columns] = await connection.execute('DESCRIBE tasks');
    
    console.log('Current table structure:');
    columns.forEach(column => {
      console.log(`${column.Field}: ${column.Type}, Null: ${column.Null}, Default: ${column.Default || 'NULL'}`);
    });
    
    // Verify required columns and constraints
    console.log('\n--- Verification Results ---');
    let issues = 0;
    
    // Check userInformation column
    const userInformationColumn = columns.find(col => col.Field === 'userInformation');
    if (userInformationColumn) {
      console.log('✅ userInformation column exists');
    } else {
      console.log('❌ userInformation column is missing');
      issues++;
    }
    
    // Check source column
    const sourceColumn = columns.find(col => col.Field === 'source');
    if (sourceColumn) {
      if (sourceColumn.Null === 'YES') {
        console.log('✅ source column allows NULL');
      } else {
        console.log('❌ source column does not allow NULL (should be YES)');
        issues++;
      }
      if (sourceColumn.Default === '') {
        console.log('✅ source column has correct default value');
      } else {
        console.log('⚠️  source column default is not empty string (current: ' + (sourceColumn.Default || 'NULL') + ')');
      }
    } else {
      console.log('❌ source column is missing');
      issues++;
    }
    
    // Check category column
    const categoryColumn = columns.find(col => col.Field === 'category');
    if (categoryColumn) {
      if (categoryColumn.Null === 'YES') {
        console.log('✅ category column allows NULL');
      } else {
        console.log('❌ category column does not allow NULL (should be YES)');
        issues++;
      }
      if (categoryColumn.Default === '') {
        console.log('✅ category column has correct default value');
      } else {
        console.log('⚠️  category column default is not empty string (current: ' + (categoryColumn.Default || 'NULL') + ')');
      }
    } else {
      console.log('❌ category column is missing');
      issues++;
    }
    
    // Check service column
    const serviceColumn = columns.find(col => col.Field === 'service');
    if (serviceColumn) {
      if (serviceColumn.Null === 'YES') {
        console.log('✅ service column allows NULL');
      } else {
        console.log('❌ service column does not allow NULL (should be YES)');
        issues++;
      }
      if (serviceColumn.Default === '') {
        console.log('✅ service column has correct default value');
      } else {
        console.log('⚠️  service column default is not empty string (current: ' + (serviceColumn.Default || 'NULL') + ')');
      }
    } else {
      console.log('❌ service column is missing');
      issues++;
    }
    
    // Check office column
    const officeColumn = columns.find(col => col.Field === 'office');
    if (officeColumn) {
      if (officeColumn.Null === 'YES') {
        console.log('✅ office column allows NULL');
      } else {
        console.log('❌ office column does not allow NULL (should be YES)');
        issues++;
      }
    } else {
      console.log('❌ office column is missing');
      issues++;
    }
    
    // Summary
    console.log('\n--- Summary ---');
    if (issues === 0) {
      console.log('🎉 All schema checks passed! Database is correctly configured.');
    } else {
      console.log(`⚠️  ${issues} issue(s) found. Please address them.`);
    }
    
    await connection.end();
    console.log('🔒 Connection closed.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
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

// Run verification
verifySchema();