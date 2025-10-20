// Test script to verify task creation with correct user information
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function testTaskCreation() {
  try {
    console.log('Testing task creation with correct user information...');
    
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
    
    // Create a JWT token for this user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Created token for user:', user.id);
    
    // Test creating a task with the API
    const taskData = {
      date: new Date().toISOString().split('T')[0],
      description: 'Test task created via API',
      source: 'Test Source',
      category: 'Test Category',
      service: 'Test Service',
      userInformation: 'Test user info',
      status: 'Pending'
    };
    
    console.log('Creating task with data:', taskData);
    
    const response = await axios.post('http://localhost:5000/api/tasks', taskData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Task creation response:', response.data);
    
    // Verify the task was created with correct user information
    if (response.data.userId === user.id && response.data.userName === (user.fullName || user.username)) {
      console.log('✓ Task created with correct user information');
    } else {
      console.log('✗ Task created with incorrect user information');
      console.log('Expected userId:', user.id, 'Got:', response.data.userId);
      console.log('Expected userName:', user.fullName || user.username, 'Got:', response.data.userName);
    }
    
  } catch (error) {
    console.error('Error testing task creation:', error.response?.data || error.message);
  }
}

// Run the test
testTaskCreation();