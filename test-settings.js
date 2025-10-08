const axios = require('axios');

async function testSettings() {
  let authToken = null;
  
  try {
    console.log('🧪 Testing Settings page operations...\n');
    
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
    console.log('User data:', {
      id: currentUserResponse.data.id,
      username: currentUserResponse.data.username,
      fullName: currentUserResponse.data.fullName,
      email: currentUserResponse.data.email,
      office: currentUserResponse.data.office
    });
    console.log('');
    
    // 3. Test updating profile
    console.log('3. Testing update profile...');
    const profileUpdate = {
      fullName: 'System Administrator - Updated',
      email: currentUserResponse.data.email
    };
    
    const updateProfileResponse = await axios.put('http://localhost:5001/api/auth/profile', profileUpdate, config);
    console.log('✅ Profile updated successfully');
    console.log('Updated user data:', {
      id: updateProfileResponse.data.id,
      username: updateProfileResponse.data.username,
      fullName: updateProfileResponse.data.fullName,
      email: updateProfileResponse.data.email,
      office: updateProfileResponse.data.office
    });
    console.log('');
    
    // 4. Test reverting profile update
    console.log('4. Testing revert profile update...');
    const revertProfileUpdate = {
      fullName: 'System Administrator',
      email: currentUserResponse.data.email
    };
    
    const revertProfileResponse = await axios.put('http://localhost:5001/api/auth/profile', revertProfileUpdate, config);
    console.log('✅ Profile reverted successfully\n');
    
    console.log('🎉 All Settings page operations tested successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testSettings();