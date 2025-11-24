// Script to create Kanban table in production database
const sequelize = require('../config/database');

async function createKanbanTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if kanban table exists
    console.log('Checking if kanban table exists...');
    const [results] = await sequelize.query(
      "SHOW TABLES LIKE 'kanban'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (results && results.length > 0) {
      console.log('ℹ️  Kanban table already exists');
      return;
    }
    
    // Create kanban table
    console.log('Creating kanban table...');
    await sequelize.query(`
      CREATE TABLE kanban (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'backlog',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, { type: sequelize.QueryTypes.RAW });
    
    // Create indexes
    console.log('Creating indexes...');
    await sequelize.query(
      'CREATE INDEX idx_kanban_status ON kanban(status)',
      { type: sequelize.QueryTypes.RAW }
    );
    
    await sequelize.query(
      'CREATE INDEX idx_kanban_created_at ON kanban(createdAt)',
      { type: sequelize.QueryTypes.RAW }
    );
    
    console.log('✅ Kanban table created successfully');
  } catch (error) {
    console.error('❌ Error creating Kanban table:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

createKanbanTable();