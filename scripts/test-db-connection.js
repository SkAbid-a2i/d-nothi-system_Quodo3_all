#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the database connection and task operations
 */

const sequelize = require('../config/database');
const Task = require('../models/Task');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get database info
    const dialect = sequelize.getDialect();
    const host = sequelize.config.host;
    const port = sequelize.config.port;
    const database = sequelize.config.database;
    
    console.log(`   Dialect: ${dialect}`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${database}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testTaskOperations() {
  console.log('\n🔍 Testing task operations...');
  
  try {
    // Test creating a task
    const testTask = {
      date: new Date(),
      source: 'Test Script',
      category: 'Testing',
      service: 'Database Test',
      description: 'Test task for database connection verification',
      status: 'Pending',
      userId: 1,
      userName: 'Test User'
    };
    
    console.log('   Creating test task...');
    const task = await Task.create(testTask);
    console.log('✅ Task creation successful');
    console.log(`   Task ID: ${task.id}`);
    
    // Test retrieving tasks
    console.log('   Retrieving tasks...');
    const tasks = await Task.findAll({ limit: 5 });
    console.log('✅ Task retrieval successful');
    console.log(`   Retrieved ${tasks.length} tasks`);
    
    // Test updating task
    console.log('   Updating test task...');
    await task.update({ status: 'Completed' });
    console.log('✅ Task update successful');
    
    // Test deleting task
    console.log('   Deleting test task...');
    await task.destroy();
    console.log('✅ Task deletion successful');
    
    return true;
  } catch (error) {
    console.error('❌ Task operations failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Database Connection and Task Operations Test');
  console.log('===============================================');
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n⚠️  Skipping task operations due to database connection failure');
    process.exit(1);
  }
  
  // Test task operations
  const tasksWorking = await testTaskOperations();
  
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Task Operations: ${tasksWorking ? '✅ PASS' : '❌ FAIL'}`);
  
  if (dbConnected && tasksWorking) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  process.exit(0);
});

// Run the test
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test failed with unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseConnection,
  testTaskOperations,
  main
};