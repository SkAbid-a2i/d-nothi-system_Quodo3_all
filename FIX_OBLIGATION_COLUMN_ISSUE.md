# Fix for Obligation Column Database Issue

## Problem Description

The application is encountering a `500 Internal Server Error` when trying to fetch tasks because the database is missing the `obligation` column in the `tasks` table. The error message is:

```
Unknown column 'obligation' in 'field list'
```

This happens because the migration that adds the obligation column was run on the development database (SQLite) but not on the production database (TiDB).

## Solution Options

### Option 1: Run the Production Migration Script (Recommended)

1. Create a `.env` file in the project root with your production database credentials:

```env
DB_HOST=your_tidb_host
DB_PORT=4000
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=your_database_name
DB_SSL=true
```

2. Run the production migration script:

```bash
cd d:\Project\Quodo3
node scripts/run-production-migration.js
```

### Option 2: Run the SQL Script Directly

Execute the following SQL command directly on your TiDB database:

```sql
ALTER TABLE tasks ADD COLUMN obligation VARCHAR(255) DEFAULT '';
```

### Option 3: Use Database Client

If you have a database client (like MySQL Workbench, DBeaver, or similar), connect to your TiDB database and run:

```sql
ALTER TABLE tasks ADD COLUMN obligation VARCHAR(255) DEFAULT '';
```

## Verification

After running the migration or SQL command, restart your server and verify that:

1. The `/api/tasks` endpoint returns a 200 status code instead of 500
2. The task management page loads without errors
3. The obligation field appears in the task creation form
4. The obligation chart appears on the dashboard

## Additional Notes

- The migration file `2025102001-add-obligation-to-tasks.js` already exists in the migrations folder
- The issue occurs because development (SQLite) and production (TiDB) databases are separate
- Always backup your production database before running migrations