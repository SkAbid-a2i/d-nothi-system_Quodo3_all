// Test to check if environment variables are properly set
console.log('Testing environment variables:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('FRONTEND_URL_2:', process.env.FRONTEND_URL_2);
console.log('FRONTEND_URL_3:', process.env.FRONTEND_URL_3);

// Test CORS origins array
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

console.log('\nCORS Origins Array:');
corsOrigins.forEach((origin, index) => {
  console.log(`${index + 1}. ${origin}`);
});

// Check if the new domain is in the array
const newDomain = 'https://d-nothi-zenith.vercel.app';
const oldDomain = 'https://d-nothi-system-quodo3-all.vercel.app';

console.log(`\nChecking if domains are in CORS origins array:`);
console.log(`New domain (${newDomain}) in array:`, corsOrigins.includes(newDomain));
console.log(`Old domain (${oldDomain}) in array:`, corsOrigins.includes(oldDomain));

// Check for exact string matching
console.log(`\nExact string matching:`);
console.log(`New domain length:`, newDomain.length);
console.log(`Matching origin length:`, corsOrigins[2].length);
console.log(`Exact match:`, newDomain === corsOrigins[2]);