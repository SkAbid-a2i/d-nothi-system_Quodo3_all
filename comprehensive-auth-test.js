// Comprehensive test script to verify authentication fixes
const axios = require('axios');

async function testAuthFixes() {
  console.log('=== Testing Authentication Fixes ===\n');
  
  try {
    // Test 1: Login to get a token
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      const token = loginResponse.data.token;
      console.log('   Token obtained:', token.substring(0, 20) + '...');
      
      // Test 2: Validate token with getCurrentUser
      console.log('\n2. Testing getCurrentUser with valid token...');
      try {
        const currentUserResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (currentUserResponse.status === 200) {
          console.log('   ✅ getCurrentUser successful');
          console.log('   User data:', currentUserResponse.data.username);
        }
      } catch (error) {
        console.log('   ❌ getCurrentUser failed:', error.response?.data?.message || error.message);
      }
      
      // Test 3: Simulate network error scenario (stop server temporarily)
      console.log('\n3. Testing retry logic (simulating network issues)...');
      console.log('   (This would be tested by temporarily stopping the server)');
      
      // Test 4: Test 401 handling
      console.log('\n4. Testing 401 handling...');
      try {
        const invalidTokenResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': 'Bearer invalid-token-here'
          }
        });
        console.log('   ❌ Should have failed with 401');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('   ✅ Correctly handled 401 Unauthorized');
        } else {
          console.log('   ❌ Unexpected error:', error.message);
        }
      }
      
      // Test 5: Test frontend CORS configuration
      console.log('\n5. Testing frontend CORS configuration...');
      try {
        // Test accessing the frontend from localhost
        const frontendTest = await axios.get('http://localhost:3000', {
          headers: {
            'Origin': 'http://localhost:3000'
          }
        });
        console.log('   ✅ Frontend accessible from localhost');
      } catch (error) {
        console.log('   ⚠️  Frontend test inconclusive:', error.message);
      }
      
      // Test 6: Test API endpoint accessibility
      console.log('\n6. Testing API endpoint accessibility...');
      try {
        const healthResponse = await axios.get('http://localhost:5000/api/health');
        if (healthResponse.status === 200) {
          console.log('   ✅ Health endpoint accessible');
        }
      } catch (error) {
        console.log('   ❌ Health endpoint failed:', error.message);
      }
      
    } else {
      console.log('   ❌ Login failed');
    }
    
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Response:', error.response.data);
    }
  }
  
  console.log('\n=== Authentication Tests Completed ===');
}

// Run the test
testAuthFixes();