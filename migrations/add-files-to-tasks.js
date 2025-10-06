const sequelize = require('../config/database');

async function addFilesToTasks() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Check if the files column exists before trying to add it
    console.log('\n🔍 Checking if files column exists in tasks table...');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tasks' 
      AND COLUMN_NAME = 'files'
    `);
    
    if (results.length > 0) {
      console.log('ℹ️  files column already exists in tasks table');
    } else {
      console.log('🔍 Adding files column to tasks table...');
      
      // Using raw SQL query to add the column
      await sequelize.query(`
        ALTER TABLE tasks 
        ADD COLUMN files JSON NULL AFTER attachments
      `);
      
      console.log('✅ files column added successfully to tasks table');
    }
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
addFilesToTasks();