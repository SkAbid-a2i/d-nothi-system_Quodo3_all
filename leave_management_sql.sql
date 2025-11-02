-- SQL commands for manual entry in TiDB database for Leave Management

-- 1. Schema for leaves table (based on Leave model)
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  userName VARCHAR(255) NOT NULL,
  office VARCHAR(255),
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  approvedBy INT,
  approvedByName VARCHAR(255),
  approvedAt DATETIME,
  rejectionReason TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Sample INSERT statement for creating a new leave record
-- For a regular user (Agent)
INSERT INTO leaves (userId, userName, office, startDate, endDate, reason, status)
VALUES (1, 'john_doe', 'Head Office', '2025-11-01', '2025-11-03', 'Family vacation', 'Pending');

-- For a user assigned by System Admin
INSERT INTO leaves (userId, userName, office, startDate, endDate, reason, status)
VALUES (2, 'jane_smith', 'Branch Office', '2025-11-10', '2025-11-12', 'Medical appointment', 'Pending');

-- 3. Sample UPDATE statements for approving/rejecting leaves
-- Approve a leave
UPDATE leaves 
SET status = 'Approved', 
    approvedBy = 3, 
    approvedByName = 'admin_user', 
    approvedAt = NOW()
WHERE id = 1;

-- Reject a leave
UPDATE leaves 
SET status = 'Rejected', 
    rejectionReason = 'Insufficient notice period',
    approvedBy = 3, 
    approvedByName = 'admin_user', 
    approvedAt = NOW()
WHERE id = 2;

-- 4. Sample SELECT statements for viewing leaves
-- View all pending leaves
SELECT * FROM leaves WHERE status = 'Pending';

-- View leaves for a specific user
SELECT * FROM leaves WHERE userId = 1;

-- View leaves for a specific office
SELECT * FROM leaves WHERE office = 'Head Office';

-- View all leaves with user information
SELECT l.*, u.fullName as userFullName, u.email as userEmail
FROM leaves l
JOIN users u ON l.userId = u.id
ORDER BY l.createdAt DESC;

-- 5. Sample DELETE statement for removing a leave record
DELETE FROM leaves WHERE id = 1 AND status = 'Pending';

-- SQL commands for adding columns to existing leave table in TiDB

-- 1. Add office column to leaves table (if not exists)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS office VARCHAR(255);

-- 2. Add approvedBy column to leaves table (if not exists)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approvedBy INT;

-- 3. Add approvedByName column to leaves table (if not exists)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approvedByName VARCHAR(255);

-- 4. Add approvedAt column to leaves table (if not exists)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approvedAt DATETIME;

-- 5. Add rejectionReason column to leaves table (if not exists)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS rejectionReason TEXT;

-- 6. Ensure status column has the correct ENUM values
ALTER TABLE leaves MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending';

-- 7. Verify the table structure
DESCRIBE leaves;
