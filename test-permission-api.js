// Test script to verify permission templates API functionality
const axios = require('axios');

async function testPermissionAPI() {
  try {
    console.log('Testing Permission Templates API...');
    
    // Login as admin
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test creating a permission template
    console.log('\nCreating a permission template...');
    const createResponse = await axios.post('http://localhost:5000/api/permissions/templates', {
      name: 'API Test Template',
      permissions: {
        manageTasks: true,
        editTasks: true,
        deleteTasks: false,
        manageLeaves: true,
        manageUsers: false,
        manageDropdowns: true
      }
    }, { headers });
    
    console.log('✅ Permission template created with ID:', createResponse.data.id);
    
    // Test fetching all permission templates
    console.log('\nFetching all permission templates...');
    const fetchResponse = await axios.get('http://localhost:5000/api/permissions/templates', { headers });
    console.log('✅ Found', fetchResponse.data.length, 'permission templates');
    
    // Test updating a permission template
    console.log('\nUpdating permission template...');
    const updateResponse = await axios.put(`http://localhost:5000/api/permissions/templates/${createResponse.data.id}`, {
      name: 'Updated API Test Template',
      permissions: {
        manageTasks: false,
        editTasks: false,
        deleteTasks: false,
        manageLeaves: false,
        manageUsers: false,
        manageDropdowns: false
      }
    }, { headers });
    
    console.log('✅ Permission template updated');
    
    // Test deleting a permission template
    console.log('\nDeleting permission template...');
    await axios.delete(`http://localhost:5000/api/permissions/templates/${createResponse.data.id}`, { headers });
    console.log('✅ Permission template deleted');
    
    console.log('\n🎉 All Permission Templates API tests passed!');
    
  } catch (error) {
    console.error('❌ Permission Templates API test failed:', error.response?.data || error.message);
  }
}

testPermissionAPI();