# Deployment Checklist

Before pushing any updates to production, complete this checklist to ensure everything works correctly with TiDB data.

## Pre-Deployment Testing

### 1. Local Environment Setup
- [ ] `.env` file configured with correct TiDB credentials
- [ ] All npm dependencies installed (`npm install` in root and client directories)
- [ ] Database tables exist (run migrations if needed)
- [ ] Sample data seeded (if needed)

### 2. Database Connection Tests
- [ ] Run `npm run test:db` - Verify database connection and table existence
- [ ] Check for any connection errors in the output
- [ ] Verify sample data can be retrieved

### 3. API Endpoint Tests
- [ ] Start backend server (`npm run dev`)
- [ ] Run `npm run test:api` - Test all API endpoints
- [ ] Verify authentication works with admin credentials
- [ ] Check that all endpoints return expected data
- [ ] Look for any error responses

### 4. Frontend Integration Tests
- [ ] Start frontend server (`cd client && npm start`)
- [ ] Login with admin credentials (admin/admin123)
- [ ] Navigate to Admin Console
- [ ] Test all three tabs:
  - [ ] User Management - Verify users load and CRUD operations work
  - [ ] Permission Templates - Verify templates load and CRUD operations work
  - [ ] Dropdown Management - Verify dropdowns load and CRUD operations work
- [ ] Check that data persists in TiDB
- [ ] Test real-time notifications (if applicable)

### 5. End-to-End Tests
- [ ] Run `npm run test:e2e` - Comprehensive system test
- [ ] Verify all tests pass
- [ ] Check test summary for any failures

### 6. Browser Compatibility Tests
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test on mobile devices
- [ ] Verify responsive design works

### 7. Performance Tests
- [ ] Check page load times
- [ ] Verify API response times
- [ ] Test with multiple concurrent users (if possible)

## Code Quality Checks

### 1. Code Review
- [ ] Review all changed files for potential issues
- [ ] Check for console.log statements that should be removed
- [ ] Verify error handling is properly implemented
- [ ] Ensure security best practices are followed

### 2. Linting
- [ ] Run ESLint on frontend code
- [ ] Run any backend linting tools
- [ ] Fix any linting errors or warnings

### 3. Build Tests
- [ ] Test production build (`npm run build`)
- [ ] Verify build completes without errors
- [ ] Check for any warnings that need attention

## Security Checks

- [ ] Verify environment variables are not hardcoded
- [ ] Check that sensitive data is not exposed in client-side code
- [ ] Verify authentication and authorization work correctly
- [ ] Test for common security vulnerabilities

## Documentation Updates

- [ ] Update README.md if needed
- [ ] Update API documentation if endpoints changed
- [ ] Update user guides if UI changed significantly

## Deployment Preparation

### 1. Git Operations
- [ ] Commit all changes with descriptive message
- [ ] Push to remote repository
- [ ] Create tag for release (if applicable)

### 2. Backup
- [ ] Backup current production database (if applicable)
- [ ] Backup current production code (if applicable)

### 3. Deployment
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Monitor deployment logs for errors
- [ ] Verify deployment completed successfully

## Post-Deployment Verification

### 1. Immediate Checks
- [ ] Verify application is accessible
- [ ] Test login with admin credentials
- [ ] Check Admin Console functionality
- [ ] Verify data loads correctly from TiDB
- [ ] Test CRUD operations

### 2. Monitoring
- [ ] Monitor application logs
- [ ] Check for any errors or warnings
- [ ] Monitor database connections
- [ ] Verify real-time features work

### 3. User Testing
- [ ] Have team members test key functionalities
- [ ] Verify all user roles work correctly
- [ ] Check mobile responsiveness
- [ ] Test cross-browser compatibility

## Rollback Plan

If issues are discovered after deployment:

1. Immediately notify team
2. Revert to previous stable version
3. Investigate root cause of issues
4. Fix issues in development environment
5. Re-run complete testing process
6. Redeploy fixed version

---

✅ **Only proceed with deployment when all checklist items are completed and verified!**