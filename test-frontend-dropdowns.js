const axios = require('axios');

async function testFrontendDropdowns() {
  try {
    // Test getting dropdowns by type - simulating frontend calls
    console.log('Testing GET /api/dropdowns/Source');
    const sourceResponse = await axios.get('http://localhost:5001/api/dropdowns/Source');
    console.log(`✓ Got ${sourceResponse.data.length} source dropdowns`);
    console.log('Source values:', sourceResponse.data.map(d => d.value));
    
    console.log('\nTesting GET /api/dropdowns/Category');
    const categoryResponse = await axios.get('http://localhost:5001/api/dropdowns/Category');
    console.log(`✓ Got ${categoryResponse.data.length} category dropdowns`);
    console.log('Category values:', categoryResponse.data.map(d => d.value));
    
    console.log('\nTesting GET /api/dropdowns/Service');
    const serviceResponse = await axios.get('http://localhost:5001/api/dropdowns/Service');
    console.log(`✓ Got ${serviceResponse.data.length} service dropdowns`);
    console.log('Service values:', serviceResponse.data.map(d => d.value));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testFrontendDropdowns();