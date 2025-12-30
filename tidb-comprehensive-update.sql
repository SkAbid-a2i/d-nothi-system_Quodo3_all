-- Comprehensive TiDB SQL commands to update the database for Incident dropdown 
-- and properly rename Service to Sub-Category in both dropdowns and tasks tables

-- 1. First, check if the 'service' column exists in the tasks table
-- SELECT COLUMN_NAME FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'service';

-- 2. If 'service' column exists, rename it to 'subCategory'
-- ALTER TABLE tasks CHANGE COLUMN service subCategory VARCHAR(255) DEFAULT '';

-- 3. If 'subCategory' column doesn't exist, add it
-- ALTER TABLE tasks ADD COLUMN subCategory VARCHAR(255) DEFAULT '';

-- 4. Add incident column to tasks table (if not exists)
-- Check if incident column exists first
-- SELECT COLUMN_NAME FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'incident';

-- If incident column doesn't exist, add it
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- 5. Update existing 'Service' dropdown values to 'Sub-Category' 
-- First, let's be more specific about what we're updating
UPDATE dropdowns 
SET type = 'Sub-Category' 
WHERE type = 'Service';

-- 6. If there are any records with 'Service' in other case variations, update those too
UPDATE dropdowns 
SET type = 'Sub-Category' 
WHERE type LIKE 'service' OR type LIKE 'SERVICE';

-- 7. Update the dropdown ENUM type to include 'Incident' and 'Sub-Category'
-- Now we can safely modify the ENUM since all 'Service' values have been converted
ALTER TABLE dropdowns 
MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation');

-- 8. Verify the changes
-- SELECT DISTINCT type FROM dropdowns;
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'dropdowns' AND COLUMN_NAME = 'type';
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'incident';
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'subCategory';

-- 9. Add some default Incident values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'Software Installation', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'Hardware Repair', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);

-- 10. Add some default Sub-Category values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Sub-Category', 'Software Installation', 'Category', 'IT', 1),
-- ('Sub-Category', 'Hardware Repair', 'Category', 'IT', 1),
-- ('Sub-Category', 'Recruitment', 'Category', 'HR', 1);