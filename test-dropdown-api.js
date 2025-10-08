const axios = require('axios');

async function testDropdownAPI() {
  let authToken = null;
  
  try {
    // First, let's try to login to get an auth token
    console.log('Testing login to get auth token...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log('✓ Login successful');
    console.log('Token:', authToken.substring(0, 20) + '...');
    
  } catch (loginError) {
    console.error('Login failed:', loginError.message);
    if (loginError.response) {
      console.error('Login response:', loginError.response.data);
    }
    return;
  }
  
  try {
    const config = authToken ? { 
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      } 
    } : {};
    
    // Test getting all dropdowns
    console.log('\nTesting GET /api/dropdowns');
    const allResponse = await axios.get('http://localhost:5001/api/dropdowns', config);
    console.log(`✓ Got ${allResponse.data.length} dropdowns`);
    
    // Test getting dropdowns by type
    console.log('\nTesting GET /api/dropdowns/Office');
    const officeResponse = await axios.get('http://localhost:5001/api/dropdowns/Office', config);
    console.log(`✓ Got ${officeResponse.data.length} office dropdowns`);
    console.log('Office values:', officeResponse.data.map(d => d.value));
    
    console.log('\nTesting GET /api/dropdowns/Source');
    const sourceResponse = await axios.get('http://localhost:5001/api/dropdowns/Source', config);
    console.log(`✓ Got ${sourceResponse.data.length} source dropdowns`);
    console.log('Source values:', sourceResponse.data.map(d => d.value));
    
    console.log('\nTesting GET /api/dropdowns/Category');
    const categoryResponse = await axios.get('http://localhost:5001/api/dropdowns/Category', config);
    console.log(`✓ Got ${categoryResponse.data.length} category dropdowns`);
    console.log('Category values:', categoryResponse.data.map(d => d.value));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testDropdownAPI();