const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function testApiEndpoints() {
  console.log('🚀 Starting API endpoints test...\n');
  
  let authToken = null;
  
  try {
    // Test 1: Health check
    console.log('🔍 Testing API health check...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/`);
      console.log('✅ API health check passed:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ API health check failed:', error.message);
    }
    
    // Test 2: Authentication
    console.log('\n🔍 Testing authentication...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
      authToken = authResponse.data.token;
      console.log('✅ Authentication successful');
      console.log('   User:', authResponse.data.user.username);
      console.log('   Role:', authResponse.data.user.role);
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Configure axios with auth token
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 3: User endpoints
    console.log('\n🔍 Testing user endpoints...');
    try {
      const usersResponse = await apiClient.get('/users');
      console.log(`✅ Users endpoint: ${usersResponse.data.length} users retrieved`);
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Task endpoints
    console.log('\n🔍 Testing task endpoints...');
    try {
      const tasksResponse = await apiClient.get('/tasks');
      console.log(`✅ Tasks endpoint: ${tasksResponse.data.length} tasks retrieved`);
    } catch (error) {
      console.log('❌ Tasks endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test 5: Leave endpoints
    console.log('\n🔍 Testing leave endpoints...');
    try {
      const leavesResponse = await apiClient.get('/leaves');
      console.log(`✅ Leaves endpoint: ${leavesResponse.data.length} leaves retrieved`);
    } catch (error) {
      console.log('❌ Leaves endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test 6: Dropdown endpoints
    console.log('\n🔍 Testing dropdown endpoints...');
    try {
      const dropdownsResponse = await apiClient.get('/dropdowns');
      console.log(`✅ Dropdowns endpoint: ${dropdownsResponse.data.length} dropdowns retrieved`);
    } catch (error) {
      console.log('❌ Dropdowns endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test 7: Permission template endpoints
    console.log('\n🔍 Testing permission template endpoints...');
    try {
      const templatesResponse = await apiClient.get('/permissions/templates');
      console.log(`✅ Permission templates endpoint: ${templatesResponse.data.length} templates retrieved`);
    } catch (error) {
      console.log('❌ Permission templates endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Test 8: Report endpoints
    console.log('\n🔍 Testing report endpoints...');
    try {
      const summaryResponse = await apiClient.get('/reports/summary');
      console.log('✅ Reports endpoint test passed');
    } catch (error) {
      console.log('❌ Reports endpoint failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 API endpoints test completed!');
    
  } catch (error) {
    console.error('❌ API test failed with unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the test
testApiEndpoints();