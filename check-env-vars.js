require('dotenv').config();

console.log('Environment Variables Check:');
console.log('========================');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('DB_PASSWORD (first 5 chars):', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.substring(0, 5) : 'undefined');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('JWT_REFRESH_SECRET length:', process.env.JWT_REFRESH_SECRET ? process.env.JWT_REFRESH_SECRET.length : 0);