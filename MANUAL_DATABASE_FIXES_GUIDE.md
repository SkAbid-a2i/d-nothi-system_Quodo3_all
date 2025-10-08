# Manual Database Fixes Guide

Since we're unable to connect programmatically, this guide will help you apply the necessary database schema fixes manually through the TiDB Cloud console or any MySQL client that can connect.

## Current Status

✅ `userInformation` column has been successfully added to the `tasks` table
⚠️ Null constraints still need to be fixed for `source`, `category`, `service`, and [office](file://d:\Project\Quodo3\restored_usermanagement.js#L268-L268) columns

## Prerequisites

1. Access to TiDB Cloud dashboard
2. MySQL client that can connect to your database (MySQL Workbench, phpMyAdmin, DBeaver, etc.)
3. Admin privileges to modify table schema

## Required Schema Changes

The following changes need to be applied to the `tasks` table:

1. Fix null constraints for columns that should allow NULL:
   - `source` column
   - `category` column
   - `service` column
   - [office](file://d:\Project\Quodo3\restored_usermanagement.js#L268-L268) column

## Step-by-Step Instructions

### Step 1: Connect to Your Database

Use any MySQL client that can connect to your TiDB instance:

```sql
-- Connection parameters:
-- Host: gateway01.eu-central-1.prod.aws.tidbcloud.com
-- Port: 4000
-- User: 4VmPGSU3EFyEhLJ.root
-- Password: gWe9gfuhBBE50H1u
-- Database: d_nothi_db
```

### Step 2: Verify Current Table Structure

First, check the current structure of the `tasks` table:

```sql
USE `d_nothi_db`;
DESCRIBE tasks;
```

You should see that the `userInformation` column has been added, but the null constraints still need to be fixed.

### Step 3: Apply Remaining Schema Fixes

Run the following SQL commands one by one:

```sql
-- 1. Fix null constraints for source column
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';

-- 2. Fix null constraints for category column
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';

-- 3. Fix null constraints for service column
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';

-- 4. Fix null constraints for office column
ALTER TABLE tasks MODIFY office varchar(255) NULL;
```

### Step 4: Verify Changes

After applying the changes, verify the new structure:

```sql
DESCRIBE tasks;
```

The table should now have the following structure for the relevant columns:

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| source | varchar(255) | YES | | '' | |
| category | varchar(255) | YES | | '' | |
| service | varchar(255) | YES | | '' | |
| office | varchar(255) | YES | | NULL | |
| userInformation | text | YES | | NULL | |

### Step 5: Handle Existing Data (If Needed)

If you get errors when modifying columns, you might need to update existing records first:

```sql
-- Update existing records to have empty strings instead of NULL for source, category, service
UPDATE tasks SET source = '' WHERE source IS NULL;
UPDATE tasks SET category = '' WHERE category IS NULL;
UPDATE tasks SET service = '' WHERE service IS NULL;

-- Update office to NULL if it has empty strings
UPDATE tasks SET office = NULL WHERE office = '';
```

Then apply the constraints:
```sql
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY office varchar(255) NULL;
```

### Step 6: Test the Changes

Insert a test record to verify everything works:

```sql
INSERT INTO tasks (
  date, 
  source, 
  category, 
  service, 
  userId, 
  userName, 
  office, 
  userInformation, 
  description, 
  status
) VALUES (
  NOW(), 
  NULL, 
  NULL, 
  NULL, 
  1, 
  'Test User', 
  NULL, 
  'Test user information', 
  'Test task description', 
  'Pending'
);

-- Check the inserted record
SELECT * FROM tasks WHERE description = 'Test task description';

-- Clean up test record
DELETE FROM tasks WHERE description = 'Test task description';
```

## Using TiDB Cloud Console

If you prefer to use the TiDB Cloud console:

1. Log in to your TiDB Cloud dashboard
2. Navigate to your cluster
3. Click on "Connect" and select "SQL Client"
4. Run the SQL commands from Step 3 above

## Alternative: Using TiDB Cloud Import/Export

If direct SQL modification is not possible:

1. Export your current database schema
2. Modify the schema file to include the changes
3. Import the updated schema

## Verification

After applying the fixes, restart your application server and test:

1. Task Logger functionality
2. Creating new tasks with user information
3. Updating task status from the All Tasks table
4. Permission Template Management with all 11 permissions

## Troubleshooting

### If ALTER TABLE Fails

If you get errors when modifying columns, follow Step 5 above to update existing data first.

### If Column Already Exists

If you get an error that a column already exists when adding it, skip that command (the column is already there).

### If Database Doesn't Exist

If you get an error that `d_nothi_db` doesn't exist:
1. Check the correct database name in TiDB Cloud
2. Update the `USE` statement with the correct name

## Support

If you continue to have issues:
1. Contact TiDB Cloud support
2. Provide them with the exact error messages
3. Include screenshots of your IP whitelist configuration
4. Mention that you've verified the credentials multiple times

Once these schema changes are applied, your application should work correctly with all the implemented features.