const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Token:', response.data.token ? 'Received' : 'Not received');
    console.log('User:', response.data.user.username);
    console.log('User role:', response.data.user.role);
    
    // Test getting current user with the token
    const userResponse = await axios.get('https://quodo3-backend.onrender.com/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('Current user fetched successfully');
    console.log('User ID:', userResponse.data.id);
    console.log('User role:', userResponse.data.role);
    
  } catch (error) {
    console.error('Login test failed:', error.response?.data || error.message);
  }
}

testLogin();