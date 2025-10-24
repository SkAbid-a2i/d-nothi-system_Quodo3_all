// Simple test to check if the Obligation API endpoint is working
const http = require('http');

// Test the Obligation dropdown API endpoint
function testObligationAPI() {
  console.log('Testing Obligation dropdown API endpoint...\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/dropdowns/Obligation',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ API Response Status:', res.statusCode);
      console.log('✅ API Response Headers:', res.headers);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ API Response Data:', JSON.stringify(jsonData, null, 2));
        console.log('\n📊 Total Obligation values from API:', jsonData.length);
        
        if (jsonData.length > 0) {
          console.log('\n📋 Obligation values from API:');
          jsonData.forEach((obligation, index) => {
            console.log(`${index + 1}. ${obligation.value} (ID: ${obligation.id})`);
          });
        } else {
          console.log('No Obligation values returned from API.');
        }
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ API Request Error:', error.message);
  });
  
  req.end();
}

// Run the test
testObligationAPI();