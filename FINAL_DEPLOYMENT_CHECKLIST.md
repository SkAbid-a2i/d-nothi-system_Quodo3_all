# Final Deployment Checklist

## Prerequisites
- [ ] Database access to TiDB instance
- [ ] Server access to restart the application
- [ ] Backup of current database (recommended)

## Step 1: Apply Database Schema Fixes

### Option A: Manual Application (Recommended due to connection issues)
Follow the instructions in `MANUAL_DATABASE_FIXES.md` to manually apply the database schema fixes using a database client.

### Option B: Automated Application (If you can resolve connection issues)
1. Ensure database credentials are correct in `.env` file
2. Run `node apply-database-fixes.js`

### Required Changes:
- [ ] Fix null constraints for source, category, service, and office columns
- [ ] Add userInformation column to tasks table
- [ ] Verify schema matches expected structure

## Step 2: Verify Code Changes

All code changes have been implemented in the following files:
- [ ] `client/src/components/TaskManagement.js` - Task Logger updates
- [ ] `client/src/components/PermissionTemplateManagement.js` - Permission Template fixes
- [ ] `models/Task.js` - Task model updates
- [ ] `routes/task.routes.js` - Task routes updates
- [ ] `server.js` - Server configuration (alter: false)
- [ ] `.env` - Environment variables updated

## Step 3: Restart Server

```bash
# Navigate to your project directory
cd /path/to/your/project

# Restart the application
npm restart
# or
pm2 restart your-app-name
```

## Step 4: Verify Functionality

### Task Logger Verification
- [ ] Navigate to Task Logger page
- [ ] Verify Flag dropdown is removed from Create Task section
- [ ] Verify User Information field is present beside Office Dropdown
- [ ] Test creating a new task with user information
- [ ] Verify tasks display correctly in All Tasks table
- [ ] Test updating task status directly from dropdown

### Permission Template Verification
- [ ] Navigate to Admin Console → Permission Template Management
- [ ] Verify all 11 permissions are visible in creation/edit dialog:
  - canApproveLeaves
  - canAssignTasks
  - canCreateLeaves
  - canCreateTasks
  - canManageDropdowns
  - canManageFiles
  - canManageUsers
  - canViewAllLeaves
  - canViewAllTasks
  - canViewLogs
  - canViewReports
- [ ] Test creating a new permission template
- [ ] Test editing an existing permission template
- [ ] Verify permissions display correctly in template list

## Step 5: Run Test Scripts

```bash
# Test task functionality
node test-task-fix.js

# Test permission template functionality
node test-permission-template-fix.js
```

## Step 6: Git Push (As per user preference)

```bash
git add .
git commit -m "Fix Task Logger and Permission Template issues"
git push origin main
```

## Production Considerations

### Monitoring
- [ ] Monitor server logs for any errors
- [ ] Verify database connections are stable
- [ ] Check application performance

### Security
- [ ] Ensure environment variables are securely stored
- [ ] Verify JWT configuration is correct
- [ ] Check CORS settings for frontend URLs

### Backup
- [ ] Create backup of database after successful deployment
- [ ] Document current working configuration

## Rollback Procedure

If issues occur after deployment:

1. Restore database from backup
2. Revert code changes using git:
   ```bash
   git reset --hard <previous-commit-hash>
   ```
3. Restart server
4. Verify functionality

## Support Contacts

If you encounter issues not covered in this checklist:
1. Check server logs for detailed error messages
2. Review documentation files:
   - `COMPLETE_FIX_SUMMARY.md`
   - `TASK_LOGGER_UPDATES.md`
   - `PERMISSION_TEMPLATE_FIXES.md`
   - `TASK_LOGGER_SCHEMA_FIXES.md`
   - `MANUAL_DATABASE_FIXES.md`
3. Contact development team for assistance

## Completion Checklist

- [ ] Database schema fixes applied
- [ ] Server restarted
- [ ] Task Logger functionality verified
- [ ] Permission Template functionality verified
- [ ] Test scripts executed successfully
- [ ] Changes pushed to git repository
- [ ] Production monitoring in place

Once all items are completed, the deployment is finished and the application should be working correctly with all requested features implemented.