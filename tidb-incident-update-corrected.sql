-- Corrected TiDB SQL commands to update the database for Incident dropdown 
-- and properly rename Service to Sub-Category

-- 1. Add incident column to tasks table
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- 2. Update existing 'Service' dropdown values to 'Sub-Category' before modifying the ENUM
-- This handles the existing data that would cause the "Data truncated" error
UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service';

-- 3. Update the dropdown ENUM type to include 'Incident' and 'Sub-Category'
-- Now we can safely modify the ENUM since all 'Service' values have been converted
ALTER TABLE dropdowns MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation');

-- 4. Add some default Incident values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'Software Installation', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'Hardware Repair', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);

-- 5. Add some default Sub-Category values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Sub-Category', 'Software Installation', 'Category', 'IT', 1),
-- ('Sub-Category', 'Hardware Repair', 'Category', 'IT', 1),
-- ('Sub-Category', 'Recruitment', 'Category', 'HR', 1);

-- 6. Verify the changes
-- SELECT DISTINCT type FROM dropdowns;
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'dropdowns' AND COLUMN_NAME = 'type';
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'tasks' AND COLUMN_NAME = 'incident';