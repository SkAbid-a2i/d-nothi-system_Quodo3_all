const axios = require('axios');

async function testFrontendDropdowns() {
  let authToken = null;
  
  try {
    console.log('Testing frontend dropdown functionality...\n');
    
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
    
    // 2. Test fetching dropdown values
    console.log('2. Testing dropdown fetching...');
    
    // Test sources
    const sourcesResponse = await axios.get('http://localhost:5001/api/dropdowns/Source', config);
    console.log(`✅ Fetched ${sourcesResponse.data.length} sources`);
    
    // Test categories
    const categoriesResponse = await axios.get('http://localhost:5001/api/dropdowns/Category', config);
    console.log(`✅ Fetched ${categoriesResponse.data.length} categories`);
    
    // Test services
    const servicesResponse = await axios.get('http://localhost:5001/api/dropdowns/Service', config);
    console.log(`✅ Fetched ${servicesResponse.data.length} services`);
    
    console.log('\n🎉 All dropdown tests passed!');
    console.log('Frontend should now be able to fetch dropdown values correctly.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testFrontendDropdowns();