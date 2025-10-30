// Test dynamic CORS origin function
const cors = require('cors');

// Test with a function for dynamic origin
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
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
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Test the CORS middleware with both origins
const corsMiddleware = cors(corsOptions);

// Test origins
const newDomain = 'https://d-nothi-zenith.vercel.app';
const oldDomain = 'https://d-nothi-system-quodo3-all.vercel.app';

console.log('Testing dynamic CORS origin function:');
console.log('New domain:', newDomain);
console.log('Old domain:', oldDomain);

// Simulate how CORS middleware would handle these origins
function testOrigin(origin) {
  const allowedOrigins = [
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
  ];
  
  console.log(`  ${origin} is allowed:`, allowedOrigins.indexOf(origin) !== -1);
}

testOrigin(newDomain);
testOrigin(oldDomain);