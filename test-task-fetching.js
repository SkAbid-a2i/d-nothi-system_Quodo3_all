// Test script to verify task fetching for a specific user
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Task = require('./models/Task');

async function testTaskFetching() {
  try {
    console.log('Testing task fetching for a specific user...');
    
    // Find a test agent user
    const user = await User.findOne({
      where: {
        role: 'Agent'
      }
    });
    
    if (!user) {
      console.log('No agent user found');
      return;
    }
    
    console.log('Found user:', user.toJSON());
    
    // Check how many tasks this user has in the database
    const userTasksInDb = await Task.findAll({
      where: {
        userId: user.id
      }
    });
    
    console.log(`User has ${userTasksInDb.length} tasks in database:`);
    userTasksInDb.forEach(task => {
      console.log(`  - Task ${task.id}: ${task.description} (userId: ${task.userId})`);
    });
    
    // Create a JWT token for this user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Created token for user:', user.id);
    
    // Test fetching tasks with the API
    console.log('Fetching tasks via API...');
    
    const response = await axios.get('http://localhost:5000/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Task fetching response:', response.data);
    console.log(`API returned ${response.data.length} tasks`);
    
    // Verify that all returned tasks belong to this user
    const allTasksBelongToUser = response.data.every(task => task.userId === user.id);
    if (allTasksBelongToUser) {
      console.log('✓ All returned tasks belong to the correct user');
    } else {
      console.log('✗ Some returned tasks do not belong to the correct user');
    }
    
  } catch (error) {
    console.error('Error testing task fetching:', error.response?.data || error.message);
  }
}

// Run the test
testTaskFetching();