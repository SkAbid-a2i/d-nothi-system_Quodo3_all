// Debug script to test CORS configuration
const express = require('express');
const cors = require('cors');
const app = express();

// Simulate the CORS configuration
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
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful', origin: req.get('Origin') });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`CORS debug server running on port ${PORT}`);
  console.log('CORS Origins:');
  corsOptions.origin.forEach((origin, index) => {
    console.log(`${index + 1}. ${origin}`);
  });
  
  // Check if the new URL is in the list
  const newUrl = 'https://d-nothi-zenith.vercel.app';
  const isAllowed = corsOptions.origin.includes(newUrl);
  console.log(`\nIs ${newUrl} allowed? ${isAllowed}`);
});