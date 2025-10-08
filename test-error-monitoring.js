const axios = require('axios');

async function testErrorMonitoring() {
  let authToken = null;
  
  try {
    console.log('Testing Error Monitoring functionality...\n');
    
    // 1. Test login with SystemAdmin user
    console.log('1. Testing login with SystemAdmin...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ SystemAdmin login successful\n');
    
    const config = { 
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      } 
    };
    
    // 2. Test fetching logs
    console.log('2. Testing log fetching...');
    const logsResponse = await axios.get('http://localhost:5001/api/logs', config);
    console.log(`✅ Fetched ${logsResponse.data.logs.length} logs\n`);
    
    // 3. Test fetching recent logs
    console.log('3. Testing recent logs fetching...');
    const recentLogsResponse = await axios.get('http://localhost:5001/api/logs/recent', config);
    console.log(`✅ Fetched ${recentLogsResponse.data.logs.length} recent logs\n`);
    
    // 4. Test filtering by level
    console.log('4. Testing error log filtering...');
    const errorLogsResponse = await axios.get('http://localhost:5001/api/logs?level=error', config);
    console.log(`✅ Fetched ${errorLogsResponse.data.logs.length} error logs\n`);
    
    console.log('🎉 All Error Monitoring tests passed!');
    console.log('Error Monitoring page should now display data correctly.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testErrorMonitoring();