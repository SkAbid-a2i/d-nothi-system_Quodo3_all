const axios = require('axios');

async function testCORS() {
  console.log('Testing CORS behavior for both domains...\n');
  
  // Test preflight request for new domain
  try {
    console.log('1. Testing preflight (OPTIONS) request for new domain:');
    const preflightResponse = await axios.options('https://quodo3-backend.onrender.com/api/auth/login', {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('   Status:', preflightResponse.status);
    console.log('   Headers:', Object.keys(preflightResponse.headers));
    console.log('   ACAO Header:', preflightResponse.headers['access-control-allow-origin']);
    console.log('   ACAC Header:', preflightResponse.headers['access-control-allow-credentials']);
    console.log('   ACAH Header:', preflightResponse.headers['access-control-allow-headers']);
  } catch (error) {
    console.log('   Preflight failed for new domain:', error.message);
  }
  
  // Test preflight request for old domain
  try {
    console.log('\n2. Testing preflight (OPTIONS) request for old domain:');
    const preflightResponse = await axios.options('https://quodo3-backend.onrender.com/api/auth/login', {
      headers: {
        'Origin': 'https://d-nothi-system-quodo3-all.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('   Status:', preflightResponse.status);
    console.log('   Headers:', Object.keys(preflightResponse.headers));
    console.log('   ACAO Header:', preflightResponse.headers['access-control-allow-origin']);
    console.log('   ACAC Header:', preflightResponse.headers['access-control-allow-credentials']);
    console.log('   ACAH Header:', preflightResponse.headers['access-control-allow-headers']);
  } catch (error) {
    console.log('   Preflight failed for old domain:', error.message);
  }
  
  // Test actual login for new domain
  try {
    console.log('\n3. Testing actual login for new domain:');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-zenith.vercel.app'
      }
    });
    
    console.log('   Status:', loginResponse.status);
    console.log('   ACAO Header:', loginResponse.headers['access-control-allow-origin']);
  } catch (error) {
    console.log('   Login failed for new domain:');
    console.log('   Status:', error.response?.status);
    console.log('   Headers:', Object.keys(error.response?.headers || {}));
    console.log('   ACAO Header:', error.response?.headers['access-control-allow-origin']);
    console.log('   Error:', error.message);
  }
  
  // Test actual login for old domain
  try {
    console.log('\n4. Testing actual login for old domain:');
    const loginResponse = await axios.post('https://quodo3-backend.onrender.com/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'https://d-nothi-system-quodo3-all.vercel.app'
      }
    });
    
    console.log('   Status:', loginResponse.status);
    console.log('   ACAO Header:', loginResponse.headers['access-control-allow-origin']);
  } catch (error) {
    console.log('   Login failed for old domain:');
    console.log('   Status:', error.response?.status);
    console.log('   Headers:', Object.keys(error.response?.headers || {}));
    console.log('   ACAO Header:', error.response?.headers['access-control-allow-origin']);
    console.log('   Error:', error.message);
  }
}

testCORS();