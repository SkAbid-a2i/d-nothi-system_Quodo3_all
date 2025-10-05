# Deployment Guide: Vercel + Render + TiDB

This guide explains how to deploy the Quodo3 application using Vercel for the frontend, Render for the backend, and TiDB Cloud for the database.

## Architecture Overview

- **Frontend**: Vercel (React application)
- **Backend**: Render (Node.js/Express API)
- **Database**: TiDB Cloud (MySQL-compatible database)

## Prerequisites

1. Accounts:
   - Vercel account
   - Render account
   - TiDB Cloud account

2. Environment variables (stored securely in each platform):
   - Database credentials
   - JWT secrets
   - API keys

## Deployment Steps

### 1. Database Setup (TiDB Cloud)

1. Create a TiDB cluster on TiDB Cloud
2. Note the connection details:
   - Host: `gateway01.eu-central-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: `4VmPGSU3EFyEhLJ.root`
   - Database: `d_nothi_db`
   - Password: (stored securely in Render environment variables)

### 2. Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Configure the service:
   - Name: `quodo3-backend`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `DB_HOST`: `gateway01.eu-central-1.prod.aws.tidbcloud.com`
     - `DB_PORT`: `4000`
     - `DB_USER`: `4VmPGSU3EFyEhLJ.root`
     - `DB_PASSWORD`: (your TiDB password)
     - `DB_NAME`: `d_nothi_db`
     - `JWT_SECRET`: (your JWT secret)
     - `JWT_REFRESH_SECRET`: (your JWT refresh secret)
     - `JWT_EXPIRES_IN`: `1h`
     - `JWT_REFRESH_EXPIRES_IN`: `7d`
     - `FRONTEND_URL`: `https://d-nothi-system-quodo3-all.vercel.app`

3. Deploy the service
4. Note the deployed URL: `https://quodo3-backend.onrender.com`

### 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure the project:
   - Framework: Create React App
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `build`
   - Environment variables:
     - `REACT_APP_API_URL`: `https://quodo3-backend.onrender.com/api`

3. Add custom domains if needed:
   - Primary domain: `d-nothi-system-quodo3-all.vercel.app`
   - Additional domains:
     - `d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app`
     - `d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app`

4. Deploy the project

## Environment Variables Summary

### Render Backend Environment Variables
```
NODE_ENV=production
PORT=5000
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=4VmPGSU3EFyEhLJ.root
DB_PASSWORD=******** (stored securely)
DB_NAME=d_nothi_db
JWT_SECRET=******** (stored securely)
JWT_REFRESH_SECRET=******** (stored securely)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://d-nothi-system-quodo3-all.vercel.app
```

### Vercel Frontend Environment Variables
```
REACT_APP_API_URL=https://quodo3-backend.onrender.com/api
```

## CORS Configuration

The backend is configured to accept requests from the following origins:
- `https://quodo3-frontend.netlify.app` (legacy)
- `http://localhost:3000` (development)
- `https://quodo3-frontend.onrender.com` (Render frontend)
- `https://quodo3-backend.onrender.com` (Render backend)
- `https://d-nothi-system-quodo3-all.vercel.app` (Vercel primary)
- `https://d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app` (Vercel alias)
- `https://d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app` (Vercel alias)

## Monitoring and Maintenance

1. Monitor Render logs for backend issues
2. Monitor Vercel analytics for frontend performance
3. Monitor TiDB Cloud for database performance
4. Set up alerts for critical errors
5. Regularly update dependencies

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure all Vercel domains are added to the CORS configuration in `server.js`
   - Check that `FRONTEND_URL` is correctly set in Render environment variables

2. **Database Connection Issues**:
   - Verify TiDB credentials in Render environment variables
   - Check TiDB cluster status in TiDB Cloud dashboard
   - Ensure SSL is properly configured

3. **API Connection Issues**:
   - Verify `REACT_APP_API_URL` is correctly set in Vercel environment variables
   - Check that the Render backend is running and accessible

4. **Build Failures**:
   - Check build logs in Vercel and Render dashboards
   - Ensure all dependencies are correctly specified in `package.json` files

### Debugging Steps

1. Check the Render backend logs for errors
2. Check the Vercel frontend build logs for errors
3. Verify environment variables are correctly set
4. Test database connectivity from local development environment
5. Test API endpoints using tools like Postman or curl

## Rollback Procedure

If issues occur after deployment:

1. In Vercel:
   - Rollback to a previous deployment from the Vercel dashboard

2. In Render:
   - Rollback to a previous deployment from the Render dashboard
   - Or manually redeploy a previous working commit

## Security Considerations

1. All secrets are stored in platform environment variables, not in code
2. HTTPS is enforced on both Vercel and Render
3. Database connections use SSL
4. JWT tokens have appropriate expiration times
5. CORS is restricted to known domains only

## Performance Optimization

1. Enable Vercel's automatic static optimization
2. Use Render's caching headers
3. Optimize database queries
4. Implement proper indexing in TiDB
5. Use CDN for static assets through Vercel

## Future Enhancements

1. Add automated testing in CI/CD pipeline
2. Implement staging environments
3. Add monitoring and alerting
4. Optimize database schema and queries
5. Implement caching strategies