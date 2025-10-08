# Manual Database Fixes Guide

## Issue
Unable to connect to TiDB database with provided credentials to apply automated schema fixes.

## Solution
You need to manually apply the database schema fixes using a database client or tool that can connect to your TiDB instance.

## Required SQL Commands

Connect to your TiDB database using any MySQL client (MySQL Workbench, phpMyAdmin, command line mysql client, etc.) and run the following commands:

```sql
-- Connect to your database
USE `d_nothi_db`;

-- Fix null constraints for columns that should allow NULL
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY office varchar(255) NULL;

-- Add missing userInformation column
ALTER TABLE tasks ADD COLUMN userInformation TEXT NULL;

-- Verify the changes
DESCRIBE tasks;
```

## Using MySQL Command Line Client

If you have MySQL command line client installed, you can run:

```bash
mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 4VmPGSU3EFyEhLJ.root -p
```

Then enter the password: `gWe9gfuhBBE50H1u`

Once connected, run:
```sql
USE `d_nothi_db`;

-- Apply the fixes
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY office varchar(255) NULL;
ALTER TABLE tasks ADD COLUMN userInformation TEXT NULL;

-- Verify
DESCRIBE tasks;
```

## Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new connection with:
   - Hostname: `gateway01.eu-central-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: `4VmPGSU3EFyEhLJ.root`
   - Password: `gWe9gfuhBBE50H1u`
3. Connect to the database
4. Select the `d_nothi_db` database
5. Run the SQL commands provided above

## Verification

After applying the fixes, the `tasks` table should have the following structure:

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI | NULL | auto_increment |
| date | datetime | NO | MUL | NULL | |
| source | varchar(255) | YES | | '' | |
| category | varchar(255) | YES | | '' | |
| service | varchar(255) | YES | | '' | |
| userId | int(11) | NO | MUL | NULL | |
| userName | varchar(255) | NO | | NULL | |
| office | varchar(255) | YES | MUL | NULL | |
| userInformation | text | YES | | NULL | |
| description | text | NO | | NULL | |
| status | enum('Pending','In Progress','Completed','Cancelled') | YES | MUL | Pending | |
| comments | json | YES | | [] | |
| attachments | json | YES | | [] | |
| files | json | YES | | [] | |
| createdAt | datetime | NO | | NULL | |
| updatedAt | datetime | NO | | NULL | |

## After Applying Fixes

1. Restart your server application
2. Test the Task Logger functionality:
   - Verify Flag dropdown is removed from Create Task section
   - Verify User Information field is present beside Office Dropdown
   - Test creating a new task with user information
   - Test updating task status directly from All Tasks table
3. Test the Permission Template Management:
   - Verify all 11 permissions are visible in the UI
   - Test creating/editing permission templates

## Troubleshooting

If you encounter any issues:

1. **Connection Issues**: Double-check the credentials and ensure your IP is whitelisted in TiDB Cloud
2. **Permission Issues**: Ensure the database user has ALTER permissions on the tasks table
3. **Column Already Exists**: If you get an error that userInformation column already exists, you can skip that command
4. **Column Doesn't Allow NULL**: If you get an error about modifying column constraints, you may need to:
   ```sql
   -- Update existing records first
   UPDATE tasks SET source = '' WHERE source IS NULL;
   UPDATE tasks SET category = '' WHERE category IS NULL;
   UPDATE tasks SET service = '' WHERE service IS NULL;
   UPDATE tasks SET office = NULL WHERE office = '';
   
   -- Then apply the constraints
   ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
   ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
   ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
   ALTER TABLE tasks MODIFY office varchar(255) NULL;
   ```

## Support

If you continue to have issues, please check:
1. TiDB Cloud dashboard for any connection restrictions
2. Network/firewall settings that might block the connection
3. Contact TiDB support if the credentials are correct but access is denied