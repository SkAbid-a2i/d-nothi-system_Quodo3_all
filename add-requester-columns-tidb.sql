-- SQL script to add requester columns to leaves table in TiDB database

-- Add requestedBy column to leaves table
ALTER TABLE leaves ADD COLUMN requestedBy INT;

-- Add requestedByName column to leaves table
ALTER TABLE leaves ADD COLUMN requestedByName VARCHAR(255);

-- Verify the columns were added successfully
DESCRIBE leaves;

-- Optional: Add indexes for better query performance
CREATE INDEX idx_leaves_requested_by ON leaves(requestedBy);
CREATE INDEX idx_leaves_requested_by_name ON leaves(requestedByName);

-- Update existing records to have requester information
-- For leaves where the requester is the same as the user (self-requested)
UPDATE leaves 
SET requestedBy = userId, 
    requestedByName = userName 
WHERE requestedBy IS NULL;

-- Verify the update
SELECT id, userId, userName, requestedBy, requestedByName 
FROM leaves 
LIMIT 10;