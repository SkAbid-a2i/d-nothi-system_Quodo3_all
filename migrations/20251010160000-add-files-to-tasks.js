// Migration to add files column to tasks table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the files column exists before trying to add it
    console.log('🔍 Checking if files column exists in tasks table...');
    
    try {
      // For SQLite, we need to check the table info differently
      if (Sequelize.options.dialect === 'sqlite') {
        const tableInfo = await queryInterface.describeTable('tasks');
        if (tableInfo.files) {
          console.log('ℹ️  files column already exists in tasks table');
          return;
        }
      } else {
        // For MySQL/TiDB
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'tasks' 
          AND COLUMN_NAME = 'files'
        `);
        
        if (results.length > 0) {
          console.log('ℹ️  files column already exists in tasks table');
          return;
        }
      }
    } catch (error) {
      console.log('Could not check if files column exists, attempting to add it anyway...');
    }
    
    console.log('🔍 Adding files column to tasks table...');
    
    try {
      // Add the files column to tasks table
      await queryInterface.addColumn('tasks', 'files', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      });
      
      console.log('✅ files column added successfully to tasks table');
    } catch (error) {
      console.log('ℹ️  files column might already exist or there was an error adding it:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tasks', 'files');
      console.log('✅ files column removed from tasks table');
    } catch (error) {
      console.log('ℹ️  Could not remove files column:', error.message);
    }
  }
};