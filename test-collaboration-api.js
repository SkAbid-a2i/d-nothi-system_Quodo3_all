const axios = require('axios');

// Test the collaboration API
async function testCollaborationAPI() {
  try {
    console.log('Testing collaboration API...');
    
    // First, let's try to access the test endpoint
    const testResponse = await axios.get('http://localhost:5000/api/collaborations/test');
    console.log('Test endpoint response:', testResponse.data);
    
    // Try to access the main endpoint (should fail without auth)
    try {
      const response = await axios.get('http://localhost:5000/api/collaborations');
      console.log('Collaborations endpoint response:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error testing collaboration API:', error.message);
  }
}

testCollaborationAPI();