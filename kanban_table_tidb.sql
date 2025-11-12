-- SQL command to manually create the kanban table in TiDB database
-- This can be used if you need to create the table manually without running migrations

CREATE TABLE IF NOT EXISTS kanban (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Backlog',
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_kanban_createdBy ON kanban(createdBy);
CREATE INDEX idx_kanban_status ON kanban(status);
CREATE INDEX idx_kanban_createdAt ON kanban(createdAt);

-- Insert sample data (optional)
-- INSERT INTO kanban (title, description, status, createdBy) VALUES 
-- ('Sample Task 1', 'This is a sample task in backlog', 'Backlog', 1),
-- ('Sample Task 2', 'This is a sample task in progress', 'InProgress', 1),
-- ('Sample Task 3', 'This is a sample task in testing', 'Testing', 1);