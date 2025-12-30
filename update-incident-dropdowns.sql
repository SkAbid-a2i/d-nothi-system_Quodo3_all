-- Manual SQL commands to update the database for Incident dropdown and Sub-Category rename

-- 1. Add incident column to tasks table
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- 2. Update the dropdown ENUM type to include 'Incident' and 'Sub-Category'
-- Note: The exact syntax may vary depending on your database system
-- For MySQL/MariaDB:
ALTER TABLE dropdowns MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Service', 'Office', 'Obligation');

-- 3. If you need to rename the existing 'service' column to 'subCategory' in tasks table
-- Note: This should only be done if the column was previously named 'service' in the tasks table
-- ALTER TABLE tasks CHANGE COLUMN service subCategory VARCHAR(255) DEFAULT '';

-- 4. If you need to update existing dropdown values that were previously 'Service' to 'Sub-Category'
-- UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service' AND parentType = 'Category';

-- 5. Example of adding some default Incident values (optional)
-- INSERT INTO dropdowns (type, value, parentType, parentValue, isActive) VALUES 
-- ('Incident', 'System Error', 'Sub-Category', 'IT Support', 1),
-- ('Incident', 'Hardware Failure', 'Sub-Category', 'IT Support', 1),
-- ('Incident', 'Network Issue', 'Sub-Category', 'IT Support', 1);