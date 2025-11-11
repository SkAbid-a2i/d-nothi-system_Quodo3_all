-- SQL command to manually create the Kanban board table in TiDB
CREATE TABLE kanban_boards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column ENUM('backlog', 'next', 'inProgress', 'testing', 'validate', 'done') DEFAULT 'backlog',
  position INT,
  userId INT NOT NULL,
  userName VARCHAR(255) NOT NULL,
  office VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_column (column),
  INDEX idx_userId (userId),
  INDEX idx_position (position)
);