const axios = require('axios');

async function testAdminComponents() {
  try {
    console.log('Testing admin components...');
    
    // Test permission templates endpoint
    const permissionResponse = await axios.get('https://quodo3-backend.onrender.com/api/permissions/templates', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcwMDExLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlN5c3RlbUFkbWluIiwiaWF0IjoxNzI4MTk1MjYzLCJleHAiOjE3MjgxOTg4NjN9.5JQX9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9'
      }
    });
    
    console.log('Permission templates fetched successfully');
    console.log('Template count:', permissionResponse.data.length);
    
    // Test dropdowns endpoint
    const dropdownResponse = await axios.get('https://quodo3-backend.onrender.com/api/dropdowns', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcwMDExLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlN5c3RlbUFkbWluIiwiaWF0IjoxNzI4MTk1MjYzLCJleHAiOjE3MjgxOTg4NjN9.5JQX9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9'
      }
    });
    
    console.log('Dropdown values fetched successfully');
    console.log('Dropdown count:', dropdownResponse.data.length);
    
  } catch (error) {
    console.error('Admin components test failed:', error.response?.data || error.message);
  }
}

testAdminComponents();