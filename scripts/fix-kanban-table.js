// Script to fix Kanban table status default value in production
const sequelize = require('../config/database');

async function fixKanbanTable() {
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
    
    if (!results || results.length === 0) {
      console.log('❌ Kanban table not found');
      return;
    }
    
    console.log('Kanban table found, fixing status default value...');
    
    // Fix the default value for status column
    await sequelize.query(
      "ALTER TABLE kanban MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'backlog'",
      { type: sequelize.QueryTypes.RAW }
    );
    
    console.log('✅ Kanban table status default value fixed successfully');
    console.log('The Kanban board should now work correctly!');
  } catch (error) {
    console.error('❌ Error fixing Kanban table:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

fixKanbanTable();