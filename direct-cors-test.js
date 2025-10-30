// Direct test of CORS behavior on the actual server
const http = require('http');

// Test function to make a raw HTTP request
function makeRequest(origin, callback) {
  const options = {
    hostname: 'quodo3-backend.onrender.com',
    port: 80,
    path: '/api/auth/login',
    method: 'OPTIONS',
    headers: {
      'Origin': origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  };

  const req = http.request(options, (res) => {
    callback(null, {
      statusCode: res.statusCode,
      headers: res.headers
    });
  });

  req.on('error', (e) => {
    callback(e);
  });

  req.end();
}

// Test both origins
makeRequest('https://d-nothi-zenith.vercel.app', (err, result) => {
  if (err) {
    console.log('Error testing new domain:', err.message);
  } else {
    console.log('New domain test result:');
    console.log('  Status:', result.statusCode);
    console.log('  ACAO header:', result.headers['access-control-allow-origin']);
  }
  
  makeRequest('https://d-nothi-system-quodo3-all.vercel.app', (err, result) => {
    if (err) {
      console.log('Error testing old domain:', err.message);
    } else {
      console.log('Old domain test result:');
      console.log('  Status:', result.statusCode);
      console.log('  ACAO header:', result.headers['access-control-allow-origin']);
    }
  });
});