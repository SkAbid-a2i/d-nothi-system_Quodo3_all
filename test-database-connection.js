require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const Task = require('./models/Task');
const Leave = require('./models/Leave');

async function testDatabase() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database successfully');
    
    // Check if tables exist by querying them
    console.log('Checking Users table...');
    const userCount = await User.count();
    console.log(`Users table exists with ${userCount} records`);
    
    if (userCount > 0) {
      const users = await User.findAll({ limit: 5 });
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.role}) - Active: ${user.isActive}`);
      });
    }
    
    console.log('Checking Tasks table...');
    try {
      const taskCount = await Task.count();
      console.log(`Tasks table exists with ${taskCount} records`);
    } catch (error) {
      console.log('Tasks table may not exist yet:', error.message);
    }
    
    console.log('Checking Leaves table...');
    try {
      const leaveCount = await Leave.count();
      console.log(`Leaves table exists with ${leaveCount} records`);
    } catch (error) {
      console.log('Leaves table may not exist yet:', error.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing database:', error);
    process.exit(1);
  }
}

testDatabase();