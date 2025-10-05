// Test file to check environment variables
console.log('=== TESTING ENVIRONMENT VARIABLES ===');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('API URL exists:', !!process.env.REACT_APP_API_URL);
console.log('API URL type:', typeof process.env.REACT_APP_API_URL);

// Test if we can make a simple API call
if (process.env.REACT_APP_API_URL) {
  console.log('API URL seems to be set correctly');
} else {
  console.log('ERROR: API URL is not set!');
}