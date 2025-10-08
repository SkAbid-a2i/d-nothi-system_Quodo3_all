const axios = require('axios');

async function testTaskLoggerDropdowns() {
  let authToken = null;
  
  try {
    console.log('🧪 Testing Task Logger dropdown fetching...\n');
    
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
    console.log('2. Testing dropdown values fetch...');
    
    // Test Source dropdowns
    const sourceResponse = await axios.get('http://localhost:5001/api/dropdowns/Source', config);
    console.log(`✅ Fetched ${sourceResponse.data.length} source dropdowns`);
    console.log('Source values:', sourceResponse.data.map(d => d.value));
    
    // Test Category dropdowns
    const categoryResponse = await axios.get('http://localhost:5001/api/dropdowns/Category', config);
    console.log(`✅ Fetched ${categoryResponse.data.length} category dropdowns`);
    console.log('Category values:', categoryResponse.data.map(d => d.value));
    
    // Test Service dropdowns
    const serviceResponse = await axios.get('http://localhost:5001/api/dropdowns/Service', config);
    console.log(`✅ Fetched ${serviceResponse.data.length} service dropdowns`);
    console.log('Service values:', serviceResponse.data.map(d => d.value));
    
    console.log('\n🎉 All dropdowns fetched successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testTaskLoggerDropdowns();