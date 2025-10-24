# Fix Production Dropdown Issue

## Issue Description

The application is experiencing a 500 server error when trying to save Obligation dropdown values in the production environment. The error message indicates:

```
Error: Data truncated for column 'type' at row 1
```

This error occurs when trying to insert 'Obligation' as a value for the 'type' column in the dropdowns table.

## Root Cause

The root cause of the issue is a schema mismatch between the development and production databases:

1. **Development Environment**: Uses SQLite which does not enforce ENUM constraints
2. **Production Environment**: Uses TiDB/MySQL which enforces ENUM constraints

The production database's `dropdowns.type` column ENUM definition does not include 'Obligation' as a valid value, causing the data truncation error when trying to insert records with `type = 'Obligation'`.

## Solution

### 1. Database Migration

Created a new migration file `2025102401-add-obligation-to-dropdowns.js` that:

- Updates the `dropdowns.type` column ENUM to include 'Obligation' for MySQL/TiDB databases
- Maintains compatibility with SQLite development environments
- Provides a reversible migration (down function to remove 'Obligation' if needed)

### 2. Migration Details

The migration updates the column definition from:
```sql
ENUM('Source', 'Category', 'Service', 'Office')
```

To:
```sql
ENUM('Source', 'Category', 'Service', 'Office', 'Obligation')
```

### 3. Implementation

The migration is designed to work with both database types:
- **MySQL/TiDB**: Actually modifies the ENUM constraint
- **SQLite**: Runs the same changeColumn command (SQLite ignores ENUM constraints)

## Deployment Instructions

1. Run the migration on the production database:
   ```bash
   npm run migrate
   ```

2. Verify the fix by:
   - Creating a new Obligation dropdown value in the Admin Console
   - Checking that no 500 errors occur
   - Confirming that Obligation values are saved correctly

## Verification

After deployment, the following should be confirmed:

1. ✅ No more 500 server errors when saving Obligation dropdown values
2. ✅ Obligation values can be created, edited, and deleted successfully
3. ✅ Existing functionality for other dropdown types remains unaffected
4. ✅ Database schema correctly includes 'Obligation' in the ENUM

## Prevention

To prevent similar issues in the future:

1. Ensure database schema changes are applied to both development and production environments
2. Test database migrations in a staging environment that mirrors production
3. Document all schema changes and their impact on different database types
4. Consider using database-agnostic approaches for ENUM-like constraints

## Conclusion

This fix resolves the production issue by ensuring the database schema matches the application's expectations for the dropdowns table. The migration is safe, reversible, and compatible with both SQLite (development) and MySQL/TiDB (production) databases.