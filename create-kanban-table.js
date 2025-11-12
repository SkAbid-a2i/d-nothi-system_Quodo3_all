// Script to manually create the kanban table
const { sequelize } = require('./config/database');

async function createKanbanTable() {
  try {
    console.log('Creating kanban table...');
    
    // Create the kanban table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS kanban (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Backlog',
        createdBy INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Kanban table created successfully!');
    
    // Add indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_kanban_createdBy ON kanban(createdBy)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_kanban_status ON kanban(status)');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_kanban_createdAt ON kanban(createdAt)');
    
    console.log('Indexes created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating kanban table:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createKanbanTable();
}