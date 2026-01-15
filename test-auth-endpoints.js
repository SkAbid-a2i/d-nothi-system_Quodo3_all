// Test script to verify authentication endpoints work correctly
const axios = require('axios');

async function testAuthEndpoints() {
  console.log('=== Testing Authentication Endpoints ===\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000');
      console.log('   ✅ Server is running');
    } catch (error) {
      console.log('   ❌ Server not responding:', error.message);
      return;
    }
    
    // Test 2: Try to login with admin credentials
    console.log('\n2. Testing login with admin credentials...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200) {
        console.log('   ✅ Login successful');
        const token = loginResponse.data.token;
        console.log('   Token obtained:', token ? 'Yes' : 'No');
        
        // Test 3: Use token to access /auth/me endpoint
        console.log('\n3. Testing getCurrentUser with valid token...');
        try {
          const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (meResponse.status === 200) {
            console.log('   ✅ getCurrentUser successful');
            console.log('   User data received:', meResponse.data.username || 'Available');
          } else {
            console.log('   ❌ getCurrentUser failed with status:', meResponse.status);
          }
        } catch (error) {
          console.log('   ❌ getCurrentUser failed:', error.response?.data?.message || error.message);
        }
      } else {
        console.log('   ❌ Login failed with status:', loginResponse.status);
      }
    } catch (error) {
      console.log('   ❌ Login failed:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Try accessing /auth/me without token (should return 401)
    console.log('\n4. Testing getCurrentUser without token (should fail)...');
    try {
      const unauthorizedResponse = await axios.get('http://localhost:5000/api/auth/me');
      console.log('   ❌ Should have failed but got status:', unauthorizedResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Correctly rejected unauthorized request');
      } else {
        console.log('   ⚠️  Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }
  
  console.log('\n=== Authentication Test Complete ===');
}

// Run the test
testAuthEndpoints();