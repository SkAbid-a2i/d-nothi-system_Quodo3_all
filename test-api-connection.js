const axios = require('axios');

async function testApi() {
  try {
    console.log('Testing API connection...');
    
    // Test login
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Token:', loginResponse.data.token ? 'Received' : 'Not received');
    console.log('User:', loginResponse.data.user ? loginResponse.data.user.username : 'Not received');
    
    // Test getting current user with token
    if (loginResponse.data.token) {
      const token = loginResponse.data.token;
      const userResponse = await axios.get('https://quodo3-backend.onrender.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Current user fetched successfully');
      console.log('User ID:', userResponse.data.id);
      console.log('User role:', userResponse.data.role);
    }
    
    // Test getting users (should work for SystemAdmin)
    if (loginResponse.data.token) {
      const token = loginResponse.data.token;
      const usersResponse = await axios.get('https://quodo3-backend.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Users fetched successfully');
      console.log('User count:', usersResponse.data.length);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    process.exit(1);
  }
}

testApi();