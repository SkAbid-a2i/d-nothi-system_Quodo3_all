# Deployment Script

## Prerequisites
1. Database access to your TiDB instance
2. Server access to restart the application
3. Backup of current database (recommended)

## Step-by-Step Deployment

### Step 1: Backup Current Database
```bash
# Create a backup of your current database
mysqldump -h [host] -u [username] -p [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Database Schema Fixes
Run the following SQL commands directly on your TiDB database:

```sql
-- Fix null constraints for columns that should allow NULL
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY office varchar(255) NULL;

-- Add missing userInformation column
ALTER TABLE tasks ADD COLUMN userInformation TEXT NULL;
```

Alternatively, you can run the provided SQL file:
```bash
mysql -h [host] -u [username] -p [database_name] < fix-database-schema.sql
```

### Step 3: Verify Database Changes
Connect to your database and verify the schema:
```sql
DESCRIBE tasks;
```

Expected output should show:
- source, category, service, office columns with NULL allowed
- userInformation column present

### Step 4: Deploy Code Changes
Ensure all modified files are deployed to your server:
1. `client/src/components/TaskManagement.js`
2. `client/src/components/PermissionTemplateManagement.js`
3. `models/Task.js`
4. `routes/task.routes.js`
5. `server.js`

### Step 5: Restart Server
```bash
# Navigate to your project directory
cd /path/to/your/project

# Restart the application
npm restart
# or
pm2 restart your-app-name
```

### Step 6: Verify Deployment
1. Access your application in the browser
2. Navigate to Task Logger page
   - Verify Flag dropdown is removed from Create Task section
   - Verify User Information field is present beside Office Dropdown
   - Test creating a new task
   - Test updating task status from All Tasks table
3. Navigate to Admin Console → Permission Template Management
   - Verify all 11 permissions are visible
   - Test creating/editing permission templates

### Step 7: Run Test Scripts
```bash
# Test task functionality
node test-task-fix.js

# Test permission template functionality
node test-permission-template-fix.js
```

## Rollback Procedure

If issues occur, you can rollback using:

### Database Rollback
```sql
-- Remove the userInformation column
ALTER TABLE tasks DROP COLUMN userInformation;

-- Restore null constraints (if needed)
ALTER TABLE tasks MODIFY source varchar(255) NOT NULL;
ALTER TABLE tasks MODIFY category varchar(255) NOT NULL;
ALTER TABLE tasks MODIFY service varchar(255) NOT NULL;
ALTER TABLE tasks MODIFY office varchar(255) NOT NULL;
```

### Code Rollback
Restore files from your backup or previous version control commit.

## Monitoring

After deployment, monitor:
1. Server logs for any errors
2. Database connection issues
3. Application functionality
4. User feedback

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database credentials in `.env` file
   - Check network connectivity to database
   - Ensure database user has proper permissions

2. **Schema Mismatch Errors**
   - Double-check that all SQL commands were executed
   - Verify column types match between model and database

3. **Permission Template Issues**
   - Clear browser cache and refresh
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible

4. **Task Logger Issues**
   - Check that all form fields submit correctly
   - Verify task creation and update operations
   - Test real-time updates functionality

### Support

If you encounter issues not covered in this document:
1. Check server logs for detailed error messages
2. Review the documentation files created:
   - `TASK_LOGGER_UPDATES.md`
   - `PERMISSION_TEMPLATE_FIXES.md`
   - `TASK_LOGGER_SCHEMA_FIXES.md`
3. Contact the development team for assistance