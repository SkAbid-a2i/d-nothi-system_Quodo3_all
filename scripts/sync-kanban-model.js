// Script to sync Kanban model with database in production
const sequelize = require('../config/database');
const Kanban = require('../models/Kanban');

async function syncKanbanModel() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('Syncing Kanban model with database...');
    await Kanban.sync({ alter: true });
    
    console.log('✅ Kanban model synced successfully');
    console.log('The Kanban board should now work correctly!');
  } catch (error) {
    console.error('❌ Error syncing Kanban model:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

syncKanbanModel();