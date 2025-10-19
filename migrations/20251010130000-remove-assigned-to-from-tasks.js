// Migration to remove assignedTo column from tasks table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Checking if assignedTo column exists in tasks table...');
      
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      let columnExists = false;
      
      if (isSQLite) {
        // For SQLite, check table info
        const tableInfo = await queryInterface.describeTable('tasks');
        columnExists = 'assignedTo' in tableInfo;
      } else {
        // For MySQL/TiDB, check INFORMATION_SCHEMA
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'tasks' 
          AND COLUMN_NAME = 'assignedTo'
        `);
        columnExists = results.length > 0;
      }
      
      if (columnExists) {
        console.log('🔍 Removing assignedTo column from tasks table...');
        
        // Using raw SQL query to remove the column
        await queryInterface.sequelize.query(`
          ALTER TABLE tasks 
          DROP COLUMN assignedTo
        `);
        
        console.log('✅ assignedTo column removed successfully from tasks table');
      } else {
        console.log('ℹ️  assignedTo column does not exist in tasks table');
      }
      
      console.log('\n✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Adding assignedTo column back to tasks table...');
      
      // Using raw SQL query to add the column back
      await queryInterface.sequelize.query(`
        ALTER TABLE tasks 
        ADD COLUMN assignedTo INTEGER
      `);
      
      console.log('✅ assignedTo column added back successfully to tasks table');
      
      console.log('\n✅ Migration rollback completed successfully');
    } catch (error) {
      console.error('❌ Migration rollback failed:', error.message);
      throw error;
    }
  }
};