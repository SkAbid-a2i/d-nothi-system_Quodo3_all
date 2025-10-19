# Production Deployment Guide

## Issue Summary
The application is failing to start because the production database is missing the new user profile fields (`bloodGroup`, `phoneNumber`, `bio`) that were added in the recent update.

## Solution
Run the database migrations to add the missing columns to your production database.

## Deployment Steps

### 1. Run Database Migrations
After deploying the updated code, run the migration script to update your database schema:

```bash
npm run migrate
```

This command will:
- Connect to your production database (using environment variables)
- Run all pending migrations in the correct order
- Add the missing columns to the users table:
  - `bloodGroup` (VARCHAR(10))
  - `phoneNumber` (VARCHAR(20))
  - `bio` (TEXT)

### 2. Verify Migration Success
Check that the migrations completed successfully by looking for output similar to:
```
Database connection established successfully.
Found X migration files
Already executed Y migrations
Migration Z completed successfully!
All migrations completed!
```

### 3. Restart the Application
After running migrations, restart your application:

```bash
# If using a process manager like PM2
pm2 restart your-app-name

# If using systemd
sudo systemctl restart your-app-name

# Or simply restart your deployment platform (Render, Vercel, etc.)
```

## Environment Variables Required
Make sure these environment variables are set in your production environment:

```bash
# Database configuration
DB_HOST=your-tidb-host
DB_PORT=4000
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_SSL=true

# Node environment
NODE_ENV=production
```

## Manual Migration (If npm run migrate fails)
If for some reason the migration script doesn't work, you can manually add the columns using SQL:

```sql
ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10) DEFAULT NULL;
ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL;
```

## For Render Deployment
If you're deploying to Render:

1. After deploying your code, go to your Render dashboard
2. Navigate to your web service
3. Go to "Advanced" → "Connect" to open a shell
4. Run the migration command:
   ```bash
   npm run migrate
   ```
5. Restart your service from the Render dashboard

## Verification
After running migrations:
1. Try logging in to verify the issue is resolved
2. Check that the Settings page loads correctly
3. Verify that User Management shows the new fields

## Common Issues and Solutions

### 1. "Unknown column 'bloodgroup' in 'field list'"
This is the current error and indicates the migrations haven't been run yet.

### 2. Database connection errors
Ensure your environment variables are correctly set for production database access.

### 3. Migration already executed errors
The migration system tracks executed migrations in a `SequelizeMeta` table to prevent duplicate execution.

## Support
If you continue to experience issues after following these steps, please check:
1. Database connection settings
2. Migration script output for errors
3. Application logs for additional error details