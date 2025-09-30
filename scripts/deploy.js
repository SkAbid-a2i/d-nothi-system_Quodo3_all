/**
 * Deployment helper script
 * Provides guidance for deploying the application to Render and Netlify
 */

const fs = require('fs');
const path = require('path');

function displayDeploymentGuide() {
  console.log(`
🚀 Quodo3 Deployment Helper
==========================

This script provides guidance for deploying your application.

📋 DEPLOYMENT STEPS:
-------------------

1. BACKEND DEPLOYMENT (Render):
   a. Push your code to a Git repository (GitHub/GitLab)
   b. Go to https://render.com and create a new Web Service
   c. Connect your repository
   d. Configure with these settings:
      - Name: quodo3-backend
      - Runtime: Node
      - Build Command: npm install
      - Start Command: npm start
   e. Set environment variables:
      - NODE_ENV: production
      - PORT: 5000
      - DB_HOST: ${process.env.DB_HOST || 'your-db-host'}
      - DB_PORT: ${process.env.DB_PORT || 'your-db-port'}
      - DB_USER: ${process.env.DB_USER || 'your-db-user'}
      - DB_PASSWORD: [Set as secret]
      - DB_NAME: ${process.env.DB_NAME || 'your-db-name'}
      - JWT_SECRET: [Set as secret]
      - JWT_REFRESH_SECRET: [Set as secret]
   f. Deploy the service

2. FRONTEND DEPLOYMENT (Netlify):
   a. Install Netlify CLI: npm install -g netlify-cli
   b. Login: netlify login
   c. Navigate to client directory: cd client
   d. Deploy: netlify deploy --prod
   e. Set environment variable:
      - REACT_APP_API_URL: https://your-render-backend-url.onrender.com/api

3. POST-DEPLOYMENT:
   a. Create initial admin user:
      - Go to Render dashboard
      - Open shell for your service
      - Run: node scripts/create-admin.js
   b. Test the application
   c. Change default admin password

📖 For detailed instructions, see DEPLOYMENT.md

💡 TIPS:
-------
- Keep your JWT secrets secure and never commit them to version control
- Use strong, unique passwords for your database
- Test your deployment in a staging environment first
- Monitor logs for any issues after deployment

`);
}

// Check if we're in the correct directory
if (!fs.existsSync(path.join(__dirname, '..', 'client'))) {
  console.error('❌ Error: This script must be run from the project root directory');
  process.exit(1);
}

// Display the deployment guide
displayDeploymentGuide();