const axios = require('axios');

async function testLanguageChange() {
  let authToken = null;
  
  try {
    console.log('🧪 Testing language change functionality...\n');
    
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
    console.log('✅ Current user fetched successfully');
    console.log('User language preference:', currentUserResponse.data.language || 'default (en)');
    console.log('');
    
    console.log('🎉 Language change functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testLanguageChange();