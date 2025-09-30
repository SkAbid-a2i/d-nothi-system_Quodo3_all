# Deployment Guide

This guide will help you deploy the Quodo3 application to Render (backend) and Netlify (frontend).

## Prerequisites

1. Accounts:
   - Render account (https://render.com)
   - Netlify account (https://netlify.com)
   - TiDB Cloud account with database credentials

2. Tools:
   - Git
   - Node.js (v14 or higher)

## Backend Deployment (Render)

### 1. Push Code to GitHub/GitLab
First, make sure your code is pushed to a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Deploy to Render

1. Go to https://render.com and sign in
2. Click "New+" and select "Web Service"
3. Connect your GitHub/GitLab account and select your repository
4. Configure the service:
   - Name: quodo3-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
5. Add environment variables:
   - NODE_ENV: production
   - PORT: 5000
   - DB_HOST: gateway01.eu-central-1.prod.aws.tidbcloud.com
   - DB_PORT: 4000
   - DB_USER: 4VmPGSU3EFyEhLJ.root
   - DB_PASSWORD: [Your TiDB password] (add this as a secret)
   - DB_NAME: d_nothi_db
   - JWT_SECRET: [Generate a strong secret] (add this as a secret)
   - JWT_REFRESH_SECRET: [Generate a strong secret] (add this as a secret)
6. Click "Create Web Service"

### 3. Initialize Database

After the backend is deployed, you need to create the initial admin user:

1. Go to your Render dashboard
2. Select your quodo3-backend service
3. Go to "Shell" tab
4. Run the following commands:
   ```bash
   node scripts/create-admin.js
   ```

## Frontend Deployment (Netlify)

### 1. Build the Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

### 2. Deploy to Netlify

#### Option 1: Using Netlify CLI (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   cd client
   netlify deploy --prod
   ```
   - Select your build directory: `build`
   - Select your publish directory: `build`

#### Option 2: Manual Deployment

1. Go to https://netlify.com and sign in
2. Click "New site from Git"
3. Connect your GitHub/GitLab account and select your repository
4. Configure the deployment:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `build`
5. Add environment variables:
   - REACT_APP_API_URL: `https://quodo3-backend.onrender.com/api`
6. Click "Deploy site"

## Post-Deployment Steps

### 1. Update Redirect URLs (if needed)

If you're using OAuth or other authentication methods that require redirect URLs, update them to use your new domain.

### 2. Test the Application

1. Visit your frontend URL (provided by Netlify)
2. Try logging in with the admin credentials:
   - Username: admin
   - Password: admin123
3. Change the admin password immediately after first login

### 3. Configure Custom Domains (Optional)

#### For Render (Backend):
1. Go to your Render dashboard
2. Select your service
3. Go to "Settings" tab
4. Scroll to "Custom domains"
5. Add your custom domain

#### For Netlify (Frontend):
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Domain settings"
4. Add your custom domain
5. Follow the DNS configuration instructions

## Environment Variables Summary

### Backend (Render)
| Variable | Value | Type |
|----------|-------|------|
| NODE_ENV | production | Environment |
| PORT | 5000 | Environment |
| DB_HOST | gateway01.eu-central-1.prod.aws.tidbcloud.com | Environment |
| DB_PORT | 4000 | Environment |
| DB_USER | 4VmPGSU3EFyEhLJ.root | Environment |
| DB_PASSWORD | [Your password] | Secret |
| DB_NAME | d_nothi_db | Environment |
| JWT_SECRET | [Your secret] | Secret |
| JWT_REFRESH_SECRET | [Your secret] | Secret |

### Frontend (Netlify)
| Variable | Value |
|----------|-------|
| REACT_APP_API_URL | https://quodo3-backend.onrender.com/api |

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure your backend is configured to accept requests from your frontend domain
   - Check the `cors` configuration in [server.js](file:///d:/Project/Quodo3/server.js)

2. **Database Connection Issues**:
   - Verify TiDB credentials are correct
   - Ensure TiDB instance is accessible from Render

3. **Build Failures**:
   - Check that all dependencies are correctly listed in package.json
   - Ensure Node.js version is compatible

4. **Environment Variables Not Set**:
   - Double-check all environment variables are correctly configured in Render and Netlify

### Logs and Monitoring

1. **Render Logs**:
   - Go to your Render dashboard
   - Select your service
   - View logs in the "Logs" tab

2. **Netlify Logs**:
   - Go to your Netlify dashboard
   - Select your site
   - View deploy logs in the "Deploys" tab

## Updating the Application

To update your deployed application:

### Backend (Render)
1. Push changes to your Git repository
2. Render will automatically deploy the new version

### Frontend (Netlify)
1. Push changes to your Git repository
2. Netlify will automatically deploy the new version

Or manually:
```bash
cd client
npm run build
netlify deploy --prod
```