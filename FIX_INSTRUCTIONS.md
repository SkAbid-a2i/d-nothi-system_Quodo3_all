# Fix Instructions - Quodo3 Database Schema Issues

## Problem Summary

The Quodo3 system is experiencing issues due to a schema mismatch between the backend code and the database:
- Backend code expects a `files` column in the tasks table (missing)
- Backend code doesn't expect an `assignedTo` column (still present)
- This causes "Server error" responses for task operations and admin console pages

## Solution Overview

Run the database migration scripts to update the schema to match the backend code expectations.

## Prerequisites

1. Database administrator access to TiDB Cloud
2. Database credentials (host, port, username, password, database name)
3. Node.js environment to run migration scripts

## Migration Steps

### Step 1: Prepare Migration Environment

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd Quodo3

# Install dependencies
npm install
```

### Step 2: Configure Database Credentials

Create a `.env` file with the correct database credentials:

```env
# Database Configuration - TiDB Cloud
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=4VmPGSU3EFyEhLJ.root
DB_PASSWORD=your_actual_password_here
DB_NAME=d_nothi_db
```

**Note**: Replace `your_actual_password_here` with the actual database password.

### Step 3: Run Migration Scripts

Run the migration scripts in order:

```bash
# 1. Add files column to tasks table
node migrations/add-files-to-tasks.js

# 2. Remove assignedTo column from tasks table
node migrations/remove-assigned-to-from-tasks.js
```

### Step 4: Verify Migration Success

Check that the migrations completed successfully:

```bash
# Test database connection and schema
node test-db-simple.js
```

## Alternative Solution (If Direct Database Access Not Available)

If you cannot run the migrations directly, you can execute the SQL commands manually through the TiDB Cloud console:

### SQL Commands to Execute

1. **Add files column**:
```sql
ALTER TABLE tasks 
ADD COLUMN files JSON NULL AFTER attachments;
```

2. **Remove assignedTo column**:
```sql
ALTER TABLE tasks 
DROP COLUMN assignedTo;
```

### Verification Query

After running the commands, verify the schema:

```sql
DESCRIBE tasks;
```

Expected output should include:
- `files` column of type `JSON`
- No `assignedTo` column
- Other columns unchanged

## Post-Migration Testing

### 1. Backend Testing
```bash
node comprehensive-integration-test.js
```

### 2. Frontend Testing
1. Log in with admin/admin123
2. Navigate to Admin Console → Permission Templates (should load)
3. Navigate to Admin Console → Dropdown Management (should load)
4. Create a new task (should succeed)
5. View existing tasks (should display correctly)

### 3. API Testing
```bash
# Test tasks endpoint
curl -H "Authorization: Bearer <your-token>" \
     https://quodo3-backend.onrender.com/api/tasks
```

## Rollback Procedure (If Issues Occur)

If the migrations cause issues, you can rollback:

### Rollback SQL Commands

1. **Remove files column**:
```sql
ALTER TABLE tasks 
DROP COLUMN files;
```

2. **Add assignedTo column**:
```sql
ALTER TABLE tasks 
ADD COLUMN assignedTo VARCHAR(255) NULL AFTER userName;
```

## Troubleshooting

### Common Issues

1. **"Access denied" errors**:
   - Verify database credentials
   - Check user permissions for ALTER TABLE operations
   - Confirm IP address is allowed to connect

2. **"Column already exists" errors**:
   - The migration may have been partially run
   - Check current table schema with `DESCRIBE tasks`

3. **"Column doesn't exist" errors**:
   - The migration may not have been run
   - Verify table schema with `DESCRIBE tasks`

### Diagnostic Commands

```bash
# Check current table structure
mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 4VmPGSU3EFyEhLJ.root -p -D d_nothi_db -e "DESCRIBE tasks;"

# Check migration script contents
cat migrations/add-files-to-tasks.js
cat migrations/remove-assigned-to-from-tasks.js
```

## Contact Information

For assistance with database administration:
- Database Administrator: [Contact information]
- TiDB Cloud Support: [Support contact]

## Additional Notes

1. **Backup**: Always backup the database before running migrations
2. **Testing**: Test migrations in a development environment first
3. **Scheduling**: Run migrations during maintenance windows
4. **Monitoring**: Monitor application logs after migration completion

## Verification Checklist

- [ ] Migration scripts executed successfully
- [ ] Database schema matches backend expectations
- [ ] Task creation works
- [ ] Task fetching works
- [ ] Admin Console pages load correctly
- [ ] All CRUD operations functional
- [ ] Real-time notifications working
- [ ] Data persistence verified