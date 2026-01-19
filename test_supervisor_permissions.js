const axios = require('axios');

// Test script to verify supervisor permissions for tasks
async function testSupervisorPermissions() {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
  
  console.log('Testing supervisor permissions...\n');
  
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
        
        // For Admin, SystemAdmin, and Supervisors, expect to see multiple offices/users
        if ((user.role === 'Admin' || user.role === 'SystemAdmin' || user.role === 'Supervisor') && uniqueOffices.length > 1) {
          console.log(`  ✓ ${user.role} can see tasks from multiple offices`);
        } else if ((user.role === 'Admin' || user.role === 'SystemAdmin' || user.role === 'Supervisor') && uniqueUsers.length > 1) {
          console.log(`  ✓ ${user.role} can see tasks from multiple users`);
        } else if (user.role === 'Agent') {
          console.log(`  ✓ Agent sees tasks limited to ${uniqueUsers.length <= 1 ? 'their own' : 'multiple users'}`);
        }
      }
      
      // Test creating a task
      if (user.role !== 'Agent') { // Assuming supervisors and higher can create tasks
        try {
          const createResponse = await axios.post(`${baseURL}/api/tasks`, {
            date: new Date().toISOString().split('T')[0],
            description: `Test task created by ${user.role}`,
            status: 'Pending'
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`  ✓ ${user.role} can create tasks`);
          
          // Test updating a task (try to update the task just created)
          if (createResponse.data && createResponse.data.id) {
            const updateResponse = await axios.put(`${baseURL}/api/tasks/${createResponse.data.id}`, {
              status: 'Completed'
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log(`  ✓ ${user.role} can update tasks`);
            
            // Clean up - delete the test task
            await axios.delete(`${baseURL}/api/tasks/${createResponse.data.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log(`  ✓ ${user.role} can delete tasks`);
          }
        } catch (createErr) {
          console.log(`  ⚠ ${user.role} task creation/modification failed:`, createErr.response?.data?.message || createErr.message);
        }
      }
      
    } catch (error) {
      console.log(`  ✗ Error testing ${user.role}:`, error.response?.data?.message || error.message);
    }
    
    console.log('');
  }

  console.log('Supervisor permission test completed.');
}

// Run the test
testSupervisorPermissions().catch(console.error);