-- SQL commands to update TiDB database for the new Incident dropdown type

-- First, add the 'Sub-Category' and 'Incident' to the ENUM type in the dropdowns table
-- Note: TiDB has some limitations with ENUM modifications, so we'll need to handle this carefully

-- Add the new incident field to the tasks table
ALTER TABLE tasks ADD COLUMN incident VARCHAR(255) DEFAULT '';

-- Update existing 'Service' dropdown values to 'Sub-Category' where appropriate
-- This will change all 'Service' dropdown type entries to 'Sub-Category'
UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service';

-- Update tasks table to rename service column to subCategory if needed
-- Note: The service column in tasks table will now represent Sub-Category

-- Insert some sample 'Incident' dropdown values for demonstration
-- These would typically be created by users through the admin interface
INSERT INTO dropdowns (type, value, parentType, parentValue, isActive, createdBy, createdAt, updatedAt)
VALUES 
  ('Incident', 'Technical Issue', 'Sub-Category', 'Software Development', 1, 1, NOW(), NOW()),
  ('Incident', 'Bug Report', 'Sub-Category', 'Software Development', 1, 1, NOW(), NOW()),
  ('Incident', 'System Failure', 'Sub-Category', 'Infrastructure', 1, 1, NOW(), NOW());

-- Add 'Incident' to the allowed types - TiDB handles ENUM differently, so we need to modify the column
-- First, check the current structure
DESCRIBE dropdowns;

-- If needed, you can add the new enum value using TiDB's approach:
-- ALTER TABLE dropdowns MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation');