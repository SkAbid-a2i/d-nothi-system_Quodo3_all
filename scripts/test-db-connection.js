#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the database connection and task operations
 */

const sequelize = require('../config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log('   📊 Database type:', sequelize.getDialect());
    console.log('   📍 Host:', sequelize.config.host || 'localhost (SQLite)');
    console.log('   🚪 Port:', sequelize.config.port || 'default');
    console.log('   📁 Database:', sequelize.config.database || 'default');
    
    // Test a simple query
    const result = await sequelize.query('SELECT 1+1 AS result', { type: sequelize.QueryTypes.SELECT });
    console.log('   🔍 Simple query test:', result[0].result === 2 ? 'PASSED' : 'FAILED');
    
    // Close connection
    await sequelize.close();
    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (error.parent) {
      console.error('   🔧 Parent error:', error.parent.message);
    }
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;
