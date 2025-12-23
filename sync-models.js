const sequelize = require('./config/database');

async function syncAllModels() {
  try {
    console.log('Syncing all models...');
    
    // Require all models to register associations
    require('./models/User');
    require('./models/Task');
    require('./models/Leave');
    require('./models/Dropdown');
    require('./models/Meeting');
    require('./models/Collaboration');
    require('./models/Notification');
    require('./models/PermissionTemplate');
    require('./models/AuditLog');
    require('./models/Kanban');
    
    console.log('✓ All models loaded');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models synced successfully!');
    
    // Test a simple query to verify tables exist
    const [results] = await sequelize.query('SELECT name FROM sqlite_master WHERE type="table";');
    console.log('Tables in database:', results.map(row => row.name));
    
  } catch (error) {
    console.error('Error syncing models:', error);
  }
}

syncAllModels();