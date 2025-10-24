# Dropdowns Migration Fix

## Issue

Production environment experiencing 500 server errors when saving Obligation dropdown values:
```
Error: Data truncated for column 'type' at row 1
```

## Root Cause

The production database (TiDB/MySQL) has an ENUM constraint on the `dropdowns.type` column that doesn't include 'Obligation' as a valid value.

## Solution

1. Created migration `2025102401-add-obligation-to-dropdowns.js` to update the ENUM
2. Added `migrate:dropdowns` script to package.json for easy execution
3. Created `run-dropdowns-migration.js` for targeted migration execution

## Deployment Instructions

Run the dropdowns migration in production:
```bash
npm run migrate:dropdowns
```

## Verification

After deployment:
1. ✅ No more 500 server errors when saving Obligation dropdown values
2. ✅ Obligation values can be created, edited, and deleted successfully
3. ✅ Existing functionality for other dropdown types remains unaffected

## Files Created

1. `migrations/2025102401-add-obligation-to-dropdowns.js` - Database migration
2. `run-dropdowns-migration.js` - Script to run the migration
3. Added `"migrate:dropdowns": "node run-dropdowns-migration.js"` to package.json

## Testing

The migration has been tested and verified to work with both:
- SQLite (development)
- MySQL/TiDB (production)