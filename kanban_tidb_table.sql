-- SQL command to manually create the Kanban table in TiDB
CREATE TABLE kanban (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'backlog',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for better query performance
CREATE INDEX idx_kanban_status ON kanban(status);
CREATE INDEX idx_kanban_created_at ON kanban(createdAt);