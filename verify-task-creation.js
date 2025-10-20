// Test script to verify task creation with correct userId
const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Task = require('./models/Task');
const User = require('./models/User');

async function verifyTaskCreation() {
  try {
    console.log('Verifying task creation with correct userId...');
    
    // Find a test user
    const user = await User.findOne({
      where: {
        role: 'Agent'
      }
    });
    
    if (!user) {
      console.log('No agent user found, creating a test user...');
      // Create a test user if none exists
      const testUser = await User.create({
        username: 'testagent',
        email: 'testagent@example.com',
        password: 'password123',
        fullName: 'Test Agent',
        role: 'Agent',
        office: 'Test Office'
      });
      console.log('Created test user:', testUser.toJSON());
    } else {
      console.log('Found user:', user.toJSON());
    }
    
    // Create a test task
    const testTask = await Task.create({
      date: new Date(),
      description: 'Test task for verification',
      userId: user.id,
      userName: user.fullName || user.username,
      office: user.office || null,
      status: 'Pending'
    });
    
    console.log('Created test task:', testTask.toJSON());
    
    // Verify the task was created with correct userId
    const fetchedTask = await Task.findByPk(testTask.id);
    console.log('Fetched task:', fetchedTask.toJSON());
    
    if (fetchedTask.userId === user.id) {
      console.log('✓ Task created with correct userId');
    } else {
      console.log('✗ Task created with incorrect userId');
    }
    
    // Test fetching tasks for this user
    const userTasks = await Task.findAll({
      where: {
        userId: user.id
      }
    });
    
    console.log(`Found ${userTasks.length} tasks for user ${user.id}`);
    userTasks.forEach(task => {
      console.log(`  - Task ${task.id}: ${task.description} (userId: ${task.userId})`);
    });
    
    // Clean up test data
    await Task.destroy({
      where: {
        id: testTask.id
      }
    });
    
    console.log('Cleaned up test task');
    
  } catch (error) {
    console.error('Error verifying task creation:', error);
  }
}

// Run the verification
verifyTaskCreation();