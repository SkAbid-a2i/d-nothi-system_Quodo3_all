-- SQL commands to fix the task table schema
-- Run these commands directly on your TiDB database

-- Fix null constraints for columns that should allow NULL
ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT '';
ALTER TABLE tasks MODIFY office varchar(255) NULL;

-- Add missing userInformation column
ALTER TABLE tasks ADD COLUMN userInformation TEXT NULL;

-- If needed, you can also add indexes for better performance
-- CREATE INDEX idx_tasks_user_id ON tasks(userId);
-- CREATE INDEX idx_tasks_office ON tasks(office);
-- CREATE INDEX idx_tasks_status ON tasks(status);
-- CREATE INDEX idx_tasks_date ON tasks(date);