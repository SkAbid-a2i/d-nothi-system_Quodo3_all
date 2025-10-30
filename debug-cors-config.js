// Simulate the CORS configuration from server.js
const corsOrigins = [
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

console.log('CORS Origins Array:');
corsOrigins.forEach((origin, index) => {
  console.log(`${index + 1}. ${origin}`);
});

// Test if the new domain is in the array
const newDomain = 'https://d-nothi-zenith.vercel.app';
const oldDomain = 'https://d-nothi-system-quodo3-all.vercel.app';

console.log(`\nChecking if new domain "${newDomain}" is in the array:`, corsOrigins.includes(newDomain));
console.log(`Checking if old domain "${oldDomain}" is in the array:`, corsOrigins.includes(oldDomain));

// Test the CORS middleware logic
function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

console.log(`\nCORS middleware test for new domain:`, isOriginAllowed(newDomain, corsOrigins));
console.log(`CORS middleware test for old domain:`, isOriginAllowed(oldDomain, corsOrigins));

// Check for any whitespace or formatting issues
console.log(`\nNew domain length:`, newDomain.length);
console.log(`First CORS origin (new domain) length:`, corsOrigins[2].length);
console.log(`Are they exactly equal?`, newDomain === corsOrigins[2]);
console.log(`Do they match when trimmed?`, newDomain.trim() === corsOrigins[2].trim());

// Check for any hidden characters
console.log(`\nNew domain char codes:`, [...newDomain].map(c => c.charCodeAt(0)));
console.log(`First CORS origin char codes:`, [...corsOrigins[2]].map(c => c.charCodeAt(0)));