-- Safe TiDB SQL commands to update the database for Incident dropdown 
-- and properly rename Service to Sub-Category

-- 1. Add incident column to tasks table
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- 2. Check current distinct values in the dropdowns type column
-- SELECT DISTINCT type FROM dropdowns;

-- 3. Create a temporary backup of the dropdowns table structure
-- CREATE TABLE dropdowns_backup AS SELECT * FROM dropdowns;

-- 4. Update existing 'Service' dropdown values to 'Sub-Category' 
-- First, let's be more specific about what we're updating
UPDATE dropdowns 
SET type = 'Sub-Category' 
WHERE type = 'Service';

-- 5. If there are any records with 'Service' in other case variations, update those too
UPDATE dropdowns 
SET type = 'Sub-Category' 
WHERE type LIKE 'service' OR type LIKE 'SERVICE';

-- 6. Verify the update worked
-- SELECT DISTINCT type FROM dropdowns;

-- 7. Update the dropdown ENUM type to include 'Incident' and 'Sub-Category'
-- Now we can safely modify the ENUM since all 'Service' values have been converted
ALTER TABLE dropdowns 
MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation');

-- 8. Add some default Incident values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'Software Installation', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'Hardware Repair', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);

-- 9. Verify the changes
-- SELECT DISTINCT type FROM dropdowns;
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'dropdowns' AND COLUMN_NAME = 'type';
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'incident';

-- 10. If everything worked correctly, you can drop the backup table
-- DROP TABLE IF EXISTS dropdowns_backup;