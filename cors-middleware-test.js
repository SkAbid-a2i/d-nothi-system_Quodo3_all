// Simulate how the CORS middleware works
const cors = require('cors');

// Simulate the CORS configuration from server.js
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 
    process.env.FRONTEND_URL_2 || 'http://localhost:3000',
    process.env.FRONTEND_URL_3 || 'https://d-nothi-zenith.vercel.app',
    'https://quodo3-frontend.onrender.com',
    'https://quodo3-backend.onrender.com',
    'https://d-nothi-system-quodo3-all.vercel.app',
    'https://d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-cn53p2hxd-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-bp6mein7b-skabid-5302s-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false
};

// Test the CORS middleware with both origins
const corsMiddleware = cors(corsOptions);

// Simulate requests from both origins
const newDomain = 'https://d-nothi-zenith.vercel.app';
const oldDomain = 'https://d-nothi-system-quodo3-all.vercel.app';

console.log('Testing CORS middleware behavior:');
console.log('New domain:', newDomain);
console.log('Old domain:', oldDomain);
console.log('CORS origins array:');
corsOptions.origin.forEach((origin, index) => {
  console.log(`  ${index + 1}. ${origin}`);
});

// Check if origins are in the array
console.log('\nChecking if domains are in CORS origins array:');
console.log('New domain in array:', corsOptions.origin.includes(newDomain));
console.log('Old domain in array:', corsOptions.origin.includes(oldDomain));

// Check for exact string matching issues
console.log('\nChecking for exact string matching:');
console.log('New domain length:', newDomain.length);
console.log('Matching origin length:', corsOptions.origin[2].length);
console.log('Exact match:', newDomain === corsOptions.origin[2]);

// Check for any hidden characters
console.log('\nChecking for hidden characters:');
console.log('New domain char codes:', [...newDomain].map(c => c.charCodeAt(0)));
console.log('Matching origin char codes:', [...corsOptions.origin[2]].map(c => c.charCodeAt(0)));