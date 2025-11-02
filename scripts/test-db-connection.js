// Test database connection and schema
require('dotenv').config();
const sequelize = require('../config/database');
const Leave = require('../models/Leave');

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test if the Leave model can be synchronized
    console.log('Testing Leave model synchronization...');
    await Leave.sync({ alter: true });
    console.log('✅ Leave model synchronized successfully');
    
    // Check table structure
    console.log('Checking leaves table structure...');
    const tableInfo = await sequelize.getQueryInterface().describeTable('leaves');
    console.log('Leaves table columns:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`  - ${column}: ${tableInfo[column].type}`);
    });
    
    // Check if requestedBy column exists
    if (tableInfo.requestedBy) {
      console.log('✅ requestedBy column exists');
    } else {
      console.log('❌ requestedBy column is missing');
    }
    
    if (tableInfo.requestedByName) {
      console.log('✅ requestedByName column exists');
    } else {
      console.log('❌ requestedByName column is missing');
    }
    
    await sequelize.close();
    console.log('✅ Database connection test completed');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDbConnection();