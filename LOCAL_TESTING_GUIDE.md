# Local Testing Guide for TiDB Integration

This guide will help you test the frontend integration with TiDB locally before pushing to production.

## Prerequisites

1. Ensure you have the correct `.env` file with TiDB credentials
2. Make sure all dependencies are installed (`npm install` in both root and client directories)
3. Ensure the database tables exist (run migrations if needed)

## Testing Steps

### 1. Database Connection Test

Run the database connection test script:

```bash
node scripts/test-db-connection.js
```

This script will:
- Test the database connection
- Verify that all required tables exist
- Check if there's data in the tables

### 2. API Endpoint Testing

Start the backend server locally:

```bash
npm run dev
```

Then test the API endpoints using the test script:

```bash
node scripts/test-api-endpoints.js
```

### 3. Frontend Integration Testing

Start the frontend development server:

```bash
cd client
npm start
```

Visit `http://localhost:3000` and test:

1. Login with admin credentials (admin/admin123)
2. Navigate to Admin Console
3. Test all three tabs:
   - User Management
   - Permission Templates
   - Dropdown Management
4. Verify data is loading correctly
5. Test CRUD operations (Create, Read, Update, Delete)

### 4. End-to-End Testing

Run the comprehensive end-to-end test:

```bash
npm run test:e2e
```

This will test:
- User authentication
- Data fetching from TiDB
- CRUD operations
- Real-time notifications

## Troubleshooting

### Database Connection Issues

If you see "Access denied" errors:

1. Verify the credentials in `.env` file
2. Check if the database user has proper permissions
3. Ensure the TiDB instance is accessible from your network
4. Verify the database tables exist

### Data Not Loading

If data isn't loading in the frontend:

1. Check browser console for API errors
2. Verify API endpoints are returning data
3. Check network tab in browser dev tools
4. Ensure CORS is properly configured

### Common Fixes

1. **Database Tables Missing**: Run migrations
2. **Empty Tables**: Run seed scripts
3. **Permission Issues**: Check database user permissions
4. **Network Issues**: Verify TiDB connectivity

## Before Pushing to Production

1. Run all test scripts and ensure they pass
2. Manually test all Admin Console functionalities
3. Verify data is persisting correctly
4. Check real-time notifications work
5. Test on different browsers
6. Verify mobile responsiveness

## Deployment Checklist

- [ ] All local tests pass
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Data loads correctly
- [ ] CRUD operations work
- [ ] Real-time features work
- [ ] Responsive design works
- [ ] Cross-browser compatibility verified

Only push to git after completing this checklist.