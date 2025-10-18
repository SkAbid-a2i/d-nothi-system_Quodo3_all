const http = require('http');

console.log('Starting comprehensive notification test...');

// First, let's test the SSE connection
console.log('Testing SSE connection...');

// Create an HTTP request to test the SSE endpoint
const sseReq = http.get('http://localhost:5000/api/notifications?userId=1', (res) => {
  console.log(`SSE Connection Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  // Set a timeout to close the connection after 10 seconds
  const timeout = setTimeout(() => {
    console.log('Closing SSE connection after 10 seconds');
    res.destroy();
  }, 10000);
  
  res.on('data', (chunk) => {
    console.log('SSE Data received:', chunk.toString());
    clearTimeout(timeout);
  });
  
  res.on('end', () => {
    console.log('SSE Connection ended');
  });
  
  res.on('error', (err) => {
    console.error('SSE Connection error:', err);
  });
});

sseReq.on('error', (err) => {
  console.error('SSE Request error:', err);
});

sseReq.end();

// After 5 seconds, try to create a collaboration
setTimeout(() => {
  console.log('Attempting to create a collaboration...');
  
  const collaborationData = JSON.stringify({
    title: 'Test Collaboration',
    description: 'This is a test collaboration for notification testing'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/collaborations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(collaborationData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Collaboration Creation Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Collaboration Creation Response:', data);
    });
  });
  
  req.on('error', (err) => {
    console.error('Collaboration Creation Error:', err);
  });
  
  req.write(collaborationData);
  req.end();
}, 5000);