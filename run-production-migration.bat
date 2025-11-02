@echo off
echo Running production database migrations...
node scripts/run-production-migration.js
echo Migration process completed.
pause