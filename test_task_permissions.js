const axios = require('axios');

// Test script to verify task permissions for different user roles
async function testTaskPermissions() {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
  
  console.log('Testing task permissions...\n');
  
  // Test credentials - these should be valid users in your system
  const testUsers = [
    {
      role: 'Admin',
      credentials: {
        username: 'admin',  // Replace with actual admin username
        password: 'adminpassword'  // Replace with actual admin password
      }
    },
    {
      role: 'SystemAdmin',
      credentials: {
        username: 'systemadmin',  // Replace with actual system admin username
        password: 'systemadminpassword'  // Replace with actual system admin password
      }
    },
    {
      role: 'Supervisor',
      credentials: {
        username: 'supervisor',  // Replace with actual supervisor username
        password: 'supervisorpassword'  // Replace with actual supervisor password
      }
    },
    {
      role: 'Agent',
      credentials: {
        username: 'agent',  // Replace with actual agent username
        password: 'agentpassword'  // Replace with actual agent password
      }
    }
  ];

  for (const user of testUsers) {
    console.log(`Testing ${user.role} user...`);
    
    try {
      // Login
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        username: user.credentials.username,
        password: user.credentials.password
      });
      
      const token = loginResponse.data.token;
      console.log(`  ✓ Logged in as ${user.role}`);
      
      // Get tasks
      const tasksResponse = await axios.get(`${baseURL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`  ✓ Retrieved ${tasksResponse.data.length} tasks`);
      
      // Check if user can see tasks from multiple offices/users
      if (tasksResponse.data.length > 0) {
        const uniqueOffices = [...new Set(tasksResponse.data.map(task => task.office))];
        const uniqueUsers = [...new Set(tasksResponse.data.map(task => task.userName))];
        
        console.log(`  ✓ Tasks from ${uniqueOffices.length} offices:`, uniqueOffices);
        console.log(`  ✓ Tasks from ${uniqueUsers.length} users:`, uniqueUsers.slice(0, 5)); // Show first 5
        
        // For Admin and SystemAdmin, expect to see multiple offices/users
        if ((user.role === 'Admin' || user.role === 'SystemAdmin') && uniqueOffices.length > 1) {
          console.log(`  ✓ ${user.role} can see tasks from multiple offices`);
        } else if ((user.role === 'Admin' || user.role === 'SystemAdmin') && uniqueUsers.length > 1) {
          console.log(`  ✓ ${user.role} can see tasks from multiple users`);
        } else if (user.role === 'Supervisor') {
          console.log(`  ✓ Supervisor sees tasks from their office: ${uniqueOffices.length <= 1 ? 'Yes' : 'No'}`);
        } else if (user.role === 'Agent') {
          console.log(`  ✓ Agent sees tasks limited to ${uniqueUsers.length <= 1 ? 'their own' : 'multiple users'}`);
        }
      }
      
    } catch (error) {
      console.log(`  ✗ Error testing ${user.role}:`, error.response?.data?.message || error.message);
    }
    
    console.log('');
  }

  console.log('Task permission test completed.');
}

// Run the test
testTaskPermissions().catch(console.error);