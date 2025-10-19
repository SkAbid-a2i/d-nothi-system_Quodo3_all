// Script to test profile update functionality

const axios = require('axios');

async function testProfileUpdate() {
  console.log('=== TESTING PROFILE UPDATE ===\n');
  
  try {
    // 1. Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      const token = loginResponse.data.token;
      console.log('   Token:', token.substring(0, 20) + '...');
      
      // Log initial user data
      console.log('   Initial user data:', loginResponse.data.user);
      
      // 2. Update profile with new fields
      console.log('\n2. Updating profile with new fields...');
      const profileData = {
        fullName: 'Admin User Updated',
        email: 'admin@example.com',
        office: 'Main Office',
        bloodGroup: 'AB+',
        phoneNumber: '+1987654321',
        bio: 'This is an updated admin bio for testing'
      };
      
      console.log('   Sending profile data:', profileData);
      
      const updateResponse = await axios.put('http://localhost:5000/api/auth/profile', 
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (updateResponse.status === 200) {
        console.log('   ✅ Profile update successful');
        console.log('   Response data:', updateResponse.data);
        
        // Check if all fields are present
        const userData = updateResponse.data;
        const requiredFields = ['bloodGroup', 'phoneNumber', 'bio'];
        const missingFields = requiredFields.filter(field => !(field in userData));
        
        if (missingFields.length === 0) {
          console.log('   ✅ All new fields present in response');
        } else {
          console.log('   ❌ Missing fields in response:', missingFields);
        }
        
        // Verify field values
        if (userData.bloodGroup === 'AB+' && 
            userData.phoneNumber === '+1987654321' && 
            userData.bio === 'This is an updated admin bio for testing') {
          console.log('   ✅ Field values are correct');
        } else {
          console.log('   ❌ Field values are incorrect');
          console.log('   Expected bloodGroup: AB+, got:', userData.bloodGroup);
          console.log('   Expected phoneNumber: +1987654321, got:', userData.phoneNumber);
          console.log('   Expected bio: This is an updated admin bio for testing, got:', userData.bio);
        }
      } else {
        console.log('   ❌ Profile update failed with status:', updateResponse.status);
      }
    } else {
      console.log('   ❌ Login failed with status:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Response status:', error.response.status);
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the test
if (require.main === module) {
  testProfileUpdate();
}

module.exports = testProfileUpdate;
