// Script to verify API calls for Obligation dropdown values
const path = require('path');

// Mock the browser environment
global.window = {
  localStorage: {
    getItem: (key) => {
      if (key === 'token') {
        return 'mock-token'; // Return a mock token
      }
      return null;
    },
    removeItem: () => {},
    setItem: () => {}
  },
  location: {
    href: ''
  }
};

// Mock fetch/XMLHttpRequest
global.fetch = async (url, options = {}) => {
  console.log(`🔄 Fetching: ${url}`);
  console.log(`   Method: ${options.method || 'GET'}`);
  console.log(`   Headers: ${JSON.stringify(options.headers || {})}`);
  
  // Simulate a successful response with Obligation values
  if (url.includes('/api/dropdowns/Obligation')) {
    return {
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, type: 'Obligation', value: 'Compliance' },
        { id: 2, type: 'Obligation', value: 'Legal' },
        { id: 3, type: 'Obligation', value: 'Financial' },
        { id: 4, type: 'Obligation', value: 'Operational' },
        { id: 5, type: 'Obligation', value: 'Regulatory' },
        { id: 6, type: 'Obligation', value: 'Contractual' }
      ]
    };
  }
  
  // For other endpoints, return empty data
  return {
    ok: true,
    status: 200,
    json: async () => []
  };
};

// Test the actual frontend API service
console.log('=== TESTING FRONTEND API SERVICE ===');

try {
  // Import the API service
  const apiModulePath = path.join(__dirname, 'client', 'src', 'services', 'api.js');
  const api = require(apiModulePath);
  
  console.log('✅ API service imported successfully');
  
  // Test dropdownAPI.getDropdownValues
  console.log('\n=== TESTING dropdownAPI.getDropdownValues ===');
  
  // Mock the axios instance to use our fetch mock
  const originalGet = api.default.get;
  api.default.get = async (url, config) => {
    console.log(`   Axios GET: ${url}`);
    const response = await fetch(url, { method: 'GET', headers: config?.headers });
    const data = await response.json();
    return { data, status: response.status };
  };
  
  // Test the actual function call
  console.log('🔍 Calling dropdownAPI.getDropdownValues("Obligation")...');
  const result = await api.dropdownAPI.getDropdownValues('Obligation');
  console.log('✅ API call successful');
  console.log('📊 Response data:', JSON.stringify(result.data, null, 2));
  console.log('📊 Response length:', result.data.length);
  
} catch (error) {
  console.error('❌ Error testing API service:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('\n=== VERIFICATION COMPLETE ===');