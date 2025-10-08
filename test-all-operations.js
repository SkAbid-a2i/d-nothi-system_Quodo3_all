const axios = require('axios');

async function testAllOperations() {
  let authToken = null;
  let testUser = null;
  
  try {
    console.log('🧪 Testing all database operations...\n');
    
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    const config = { 
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      } 
    };
    
    // 2. Test fetching current user
    console.log('2. Testing fetch current user...');
    const currentUserResponse = await axios.get('http://localhost:5001/api/auth/me', config);
    console.log('✅ Current user fetched successfully\n');
    
    // 3. Test fetching all users
    console.log('3. Testing fetch all users...');
    const usersResponse = await axios.get('http://localhost:5001/api/users', config);
    console.log(`✅ Fetched ${usersResponse.data.length} users\n`);
    
    // 4. Test creating a new user
    console.log('4. Testing create user...');
    const newUser = {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@example.com`,
      password: 'testpass123',
      fullName: 'Test User',
      role: 'Agent',
      office: 'Test Office'
    };
    
    const createUserResponse = await axios.post('http://localhost:5001/api/users', newUser, config);
    testUser = createUserResponse.data;
    console.log('✅ User created successfully\n');
    
    // 5. Test updating user
    console.log('5. Testing update user...');
    const updatedUser = {
      fullName: 'Updated Test User',
      email: testUser.email,
      role: 'Supervisor',
      office: 'Updated Office'
    };
    
    const updateUserResponse = await axios.put(`http://localhost:5001/api/users/${testUser.id}`, updatedUser, config);
    console.log('✅ User updated successfully\n');
    
    // 6. Test fetching all tasks
    console.log('6. Testing fetch all tasks...');
    const tasksResponse = await axios.get('http://localhost:5001/api/tasks', config);
    console.log(`✅ Fetched ${tasksResponse.data.length} tasks\n`);
    
    // 7. Test creating a new task
    console.log('7. Testing create task...');
    const newTask = {
      date: new Date().toISOString().split('T')[0],
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      description: 'Test task for integration testing',
      status: 'Pending'
    };
    
    console.log('Creating task with user info:', {
      userId: currentUserResponse.data.id,
      fullName: currentUserResponse.data.fullName,
      office: currentUserResponse.data.office
    });
    
    const createTaskResponse = await axios.post('http://localhost:5001/api/tasks', newTask, config);
    const testTask = createTaskResponse.data;
    console.log('✅ Task created successfully\n');
    
    // 8. Test updating task
    console.log('8. Testing update task...');
    const updatedTask = {
      status: 'Completed',
      description: 'Test task - Updated'
    };
    
    const updateTaskResponse = await axios.put(`http://localhost:5001/api/tasks/${testTask.id}`, updatedTask, config);
    console.log('✅ Task updated successfully\n');
    
    // 9. Test fetching all leaves
    console.log('9. Testing fetch all leaves...');
    const leavesResponse = await axios.get('http://localhost:5001/api/leaves', config);
    console.log(`✅ Fetched ${leavesResponse.data.length} leaves\n`);
    
    // 10. Test fetching all dropdowns
    console.log('10. Testing fetch all dropdowns...');
    const dropdownsResponse = await axios.get('http://localhost:5001/api/dropdowns', config);
    console.log(`✅ Fetched ${dropdownsResponse.data.length} dropdowns\n`);
    
    // 11. Test fetching dropdowns by type
    console.log('11. Testing fetch dropdowns by type...');
    const sourceDropdownsResponse = await axios.get('http://localhost:5001/api/dropdowns/Source', config);
    console.log(`✅ Fetched ${sourceDropdownsResponse.data.length} source dropdowns\n`);
    
    // 12. Test updating profile
    console.log('12. Testing update profile...');
    const profileUpdate = {
      fullName: 'Admin User - Updated',
      email: currentUserResponse.data.email
    };
    
    const updateProfileResponse = await axios.put('http://localhost:5001/api/auth/profile', profileUpdate, config);
    console.log('✅ Profile updated successfully\n');
    
    // 13. Test deleting task
    console.log('13. Testing delete task...');
    await axios.delete(`http://localhost:5001/api/tasks/${testTask.id}`, config);
    console.log('✅ Task deleted successfully\n');
    
    // 14. Test deleting user
    console.log('14. Testing delete user...');
    await axios.delete(`http://localhost:5001/api/users/${testUser.id}`, config);
    console.log('✅ User deleted successfully\n');
    
    console.log('🎉 All database operations tested successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAllOperations();