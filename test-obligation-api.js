const axios = require('axios');

// Test the dropdown API endpoint for Obligation values
async function testObligationAPI() {
  try {
    console.log('Testing Obligation API endpoint...');
    
    // Test getting all dropdown values
    const response = await axios.get('http://localhost:5000/api/dropdowns');
    console.log('All dropdowns response status:', response.status);
    console.log('Total dropdowns count:', response.data.data?.length || response.data.length);
    
    // Test getting Obligation values specifically
    const obligationResponse = await axios.get('http://localhost:5000/api/dropdowns/Obligation');
    console.log('Obligation dropdowns response status:', obligationResponse.status);
    console.log('Obligation dropdowns count:', obligationResponse.data.data?.length || obligationResponse.data.length);
    console.log('Obligation dropdowns data:', obligationResponse.data);
    
    // Test creating a new Obligation value
    const newObligation = {
      type: 'Obligation',
      value: 'Test Obligation ' + Date.now()
    };
    
    console.log('Testing creation of new Obligation value:', newObligation);
    const createResponse = await axios.post('http://localhost:5000/api/dropdowns', newObligation);
    console.log('Create Obligation response status:', createResponse.status);
    console.log('Created Obligation data:', createResponse.data);
    
    // Clean up - delete the test Obligation
    if (createResponse.data && createResponse.data.id) {
      const deleteResponse = await axios.delete(`http://localhost:5000/api/dropdowns/${createResponse.data.id}`);
      console.log('Delete test Obligation response status:', deleteResponse.status);
    }
    
  } catch (error) {
    console.error('Error testing Obligation API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testObligationAPI();