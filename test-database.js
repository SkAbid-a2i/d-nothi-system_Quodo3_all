// Test script to verify database connectivity and table structure
require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Task = require('./models/Task');
const Leave = require('./models/Leave');
const Dropdown = require('./models/Dropdown');

async function testDatabase() {
  try {
    console.log('Testing database connectivity...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Test table existence and structure
    console.log('Checking table structures...');
    
    const userTable = await sequelize.getQueryInterface().describeTable('users');
    console.log('Users table structure:', Object.keys(userTable));
    
    const taskTable = await sequelize.getQueryInterface().describeTable('tasks');
    console.log('Tasks table structure:', Object.keys(taskTable));
    
    const leaveTable = await sequelize.getQueryInterface().describeTable('leaves');
    console.log('Leaves table structure:', Object.keys(leaveTable));
    
    const dropdownTable = await sequelize.getQueryInterface().describeTable('dropdowns');
    console.log('Dropdowns table structure:', Object.keys(dropdownTable));
    
    // Test sample data
    console.log('Testing sample data...');
    const userCount = await User.count();
    console.log(`Total users: ${userCount}`);
    
    const taskCount = await Task.count();
    console.log(`Total tasks: ${taskCount}`);
    
    const leaveCount = await Leave.count();
    console.log(`Total leaves: ${leaveCount}`);
    
    const dropdownCount = await Dropdown.count();
    console.log(`Total dropdowns: ${dropdownCount}`);
    
    console.log('Database test completed successfully');
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase();