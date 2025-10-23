const axios = require('axios');

// Test the obligation API endpoint with authentication
async function testObligationAPI() {
  try {
    console.log('Testing obligation API endpoint...');
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');
    
    // Configure axios to use the token
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Test getting all dropdowns
    const allDropdownsResponse = await api.get('/dropdowns');
    console.log('All dropdowns count:', allDropdownsResponse.data.length);
    console.log('Obligation dropdowns:', allDropdownsResponse.data.filter(d => d.type === 'Obligation'));
    
    // Test getting obligation dropdowns specifically
    const obligationResponse = await api.get('/dropdowns/Obligation');
    console.log('Obligation dropdowns specifically:', obligationResponse.data);
    
    console.log('API test completed successfully');
  } catch (error) {
    console.error('Error testing obligation API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testObligationAPI();