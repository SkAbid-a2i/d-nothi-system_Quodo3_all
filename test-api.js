// Test script to verify API functionality
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJTeXN0ZW1BZG1pbiIsImlhdCI6MTc1OTkyNjc5NiwiZXhwIjoxNzU5OTMwMzk2fQ.BeezsdaVeeizeHw6KBAVS9s0oOE_j5ybMaVYgxki1Kc';

async function testDropdownAPI() {
  try {
    // Test Sources
    const sourcesRes = await axios.get('http://localhost:5001/api/dropdowns/Source', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Sources response:', sourcesRes.data);
    
    // Test Categories
    const categoriesRes = await axios.get('http://localhost:5001/api/dropdowns/Category', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Categories response:', categoriesRes.data);
    
    // Test Services
    const servicesRes = await axios.get('http://localhost:5001/api/dropdowns/Service', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Services response:', servicesRes.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDropdownAPI();

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test base URL
    const baseURL = 'https://quodo3-backend.onrender.com/api';
    console.log(`Testing base URL: ${baseURL}`);
    
    // Test root endpoint
    const rootResponse = await axios.get(baseURL.replace('/api', ''));
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test auth endpoint
    try {
      const authResponse = await axios.post(`${baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      console.log('Auth endpoint working, token received');
      
      const token = authResponse.data.token;
      
      // Test task creation
      const taskResponse = await axios.post(`${baseURL}/tasks`, {
        date: new Date().toISOString(),
        source: 'Email',
        category: 'IT Support',
        service: 'Software',
        description: 'Test task from API test',
        status: 'Pending',
        office: 'Test Office'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Task creation successful, task ID:', taskResponse.data.id);
      
    } catch (authError) {
      console.error('Auth/Task test failed:', authError.response?.data || authError.message);
    }
    
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
  }
}

testAPI();