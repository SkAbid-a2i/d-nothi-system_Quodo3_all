-- TiDB Database Updates for Service to Sub-Category Renaming and Incident Addition
-- This file contains SQL commands for manual database updates

-- 1. Update the tasks table: rename service column to subCategory and add incident column
ALTER TABLE tasks CHANGE COLUMN service subCategory VARCHAR(255);
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255);

-- 2. Update the dropdowns table: change type 'Service' to 'Sub-Category' and add 'Incident' type
UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service';

-- 3. Update the ENUM type for dropdowns table to include 'Incident' and 'Sub-Category' while removing 'Service'
-- First, add new values to the enum
ALTER TABLE dropdowns MODIFY COLUMN type ENUM('Category', 'Sub-Category', 'Incident', 'Office', 'Status', 'Priority', 'Source', 'Urgency', 'Availability', 'Obligation', 'Flag');

-- 4. Update existing dropdown values if any service-related values need to be updated to subcategory
-- This assumes there might be related values that need updating (adjust as needed)
-- UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service';

-- 5. If there are any foreign key constraints or indexes that need to be updated, they would go here
-- (This is typically not needed for simple column renames/values, but included for completeness)

-- 6. Verify the changes
SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME IN ('subCategory', 'incident');
SELECT * FROM information_schema.COLUMNS WHERE TABLE_NAME = 'dropdowns' AND COLUMN_NAME = 'type';
SELECT DISTINCT type FROM dropdowns;

-- 7. If needed, update any existing data in the tasks table to migrate service values to subCategory
-- This is only needed if the column rename didn't preserve data (TiDB should preserve data on column rename)
-- UPDATE tasks SET subCategory = service WHERE subCategory IS NULL AND service IS NOT NULL;

-- 8. Verify data integrity after changes
SELECT COUNT(*) as total_tasks FROM tasks;
SELECT COUNT(*) as tasks_with_subcategory FROM tasks WHERE subCategory IS NOT NULL;
SELECT COUNT(*) as tasks_with_incident FROM tasks WHERE incident IS NOT NULL;
SELECT DISTINCT type FROM dropdowns;