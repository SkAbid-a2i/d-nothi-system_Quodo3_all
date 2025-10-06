const sequelize = require('../config/database');

async function removeAssignedToFromTasks() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Check if the assignedTo column exists before trying to remove it
    console.log('\n🔍 Checking if assignedTo column exists in tasks table...');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tasks' 
      AND COLUMN_NAME = 'assignedTo'
    `);
    
    if (results.length > 0) {
      console.log('🔍 Removing assignedTo column from tasks table...');
      
      // Using raw SQL query to remove the column
      await sequelize.query(`
        ALTER TABLE tasks 
        DROP COLUMN assignedTo
      `);
      
      console.log('✅ assignedTo column removed successfully from tasks table');
    } else {
      console.log('ℹ️  assignedTo column does not exist in tasks table');
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
removeAssignedToFromTasks();