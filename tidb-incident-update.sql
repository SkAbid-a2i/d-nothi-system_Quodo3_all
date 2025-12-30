-- TiDB SQL commands to update the database for Incident dropdown and Sub-Category rename

-- 1. Add incident column to tasks table
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- 2. Update the dropdown ENUM type to include 'Incident' and 'Sub-Category'
-- For TiDB/MySQL - Direct modification of ENUM:
ALTER TABLE dropdowns MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Service', 'Office', 'Obligation');

-- Alternative approach for TiDB if direct ENUM modification doesn't work:
-- Step 1: Add a temporary column
-- ALTER TABLE dropdowns ADD COLUMN type_new VARCHAR(50);

-- Step 2: Copy existing data
-- UPDATE dropdowns SET type_new = type;

-- Step 3: Insert new values if needed
-- UPDATE dropdowns SET type_new = 'Sub-Category' WHERE type_new = 'Service';

-- Step 4: Add new 'Incident' values
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'IT Support', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'IT Support', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);

-- Step 5: Drop old column and rename new one
-- ALTER TABLE dropdowns DROP COLUMN type;
-- ALTER TABLE dropdowns CHANGE COLUMN type_new type VARCHAR(50) NOT NULL;

-- 3. If you need to update existing dropdown values that were previously 'Service' to 'Sub-Category'
-- UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service' AND parentType = 'Category';

-- 4. Verify the changes
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'dropdowns' AND COLUMN_NAME = 'type';

-- 5. Verify tasks table structure
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'incident';

-- 6. Add some default Incident values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'Software Installation', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'Hardware Repair', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);

-- 7. Add some default Sub-Category values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Sub-Category', 'Software Installation', 'Category', 'IT', 1),
-- ('Sub-Category', 'Hardware Repair', 'Category', 'IT', 1),
-- ('Sub-Category', 'Recruitment', 'Category', 'HR', 1);