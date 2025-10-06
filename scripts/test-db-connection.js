const sequelize = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Dropdown = require('../models/Dropdown');
const PermissionTemplate = require('../models/PermissionTemplate');

async function testDatabaseConnection() {
  console.log('🚀 Starting database connection test...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!\n');
    
    // Test each table
    console.log('🔍 Testing database tables...\n');
    
    // Test Users table
    try {
      const userCount = await User.count();
      console.log(`✅ Users table: ${userCount} records found`);
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    // Test Tasks table
    try {
      const taskCount = await Task.count();
      console.log(`✅ Tasks table: ${taskCount} records found`);
    } catch (error) {
      console.log('❌ Tasks table error:', error.message);
    }
    
    // Test Leaves table
    try {
      const leaveCount = await Leave.count();
      console.log(`✅ Leaves table: ${leaveCount} records found`);
    } catch (error) {
      console.log('❌ Leaves table error:', error.message);
    }
    
    // Test Dropdowns table
    try {
      const dropdownCount = await Dropdown.count();
      console.log(`✅ Dropdowns table: ${dropdownCount} records found`);
    } catch (error) {
      console.log('❌ Dropdowns table error:', error.message);
    }
    
    // Test PermissionTemplates table
    try {
      const templateCount = await PermissionTemplate.count();
      console.log(`✅ PermissionTemplates table: ${templateCount} records found`);
    } catch (error) {
      console.log('❌ PermissionTemplates table error:', error.message);
    }
    
    // Test sample data retrieval
    console.log('\n🔍 Testing sample data retrieval...\n');
    
    try {
      const sampleUsers = await User.findAll({ limit: 3 });
      console.log(`✅ Sample users retrieved: ${sampleUsers.length} records`);
      
      const sampleDropdowns = await Dropdown.findAll({ limit: 3 });
      console.log(`✅ Sample dropdowns retrieved: ${sampleDropdowns.length} records`);
      
      const sampleTemplates = await PermissionTemplate.findAll({ limit: 3 });
      console.log(`✅ Sample permission templates retrieved: ${sampleTemplates.length} records`);
    } catch (error) {
      console.log('❌ Sample data retrieval error:', error.message);
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();