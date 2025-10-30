// Check environment variables
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('FRONTEND_URL_2:', process.env.FRONTEND_URL_2);
console.log('FRONTEND_URL_3:', process.env.FRONTEND_URL_3);

// Check if the new domain is in the list
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

console.log('CORS Origins:', corsOrigins);
console.log('New domain in list:', corsOrigins.includes('https://d-nothi-zenith.vercel.app'));
console.log('Old domain in list:', corsOrigins.includes('https://d-nothi-system-quodo3-all.vercel.app'));