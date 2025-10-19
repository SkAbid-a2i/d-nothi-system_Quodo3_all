const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding userInformation column to tasks table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        // For SQLite, we need to check the table info differently
        const tableInfo = await queryInterface.describeTable('tasks');
        if (tableInfo.userInformation) {
          console.log('ℹ️  userInformation column already exists in tasks table');
          return;
        }
      } else {
        // For MySQL/TiDB
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'tasks' 
          AND COLUMN_NAME = 'userInformation'
        `);
        
        if (results.length > 0) {
          console.log('ℹ️  userInformation column already exists in tasks table');
          return;
        }
      }
    } catch (error) {
      console.log('Could not check if userInformation column exists, attempting to add it anyway...');
    }
    
    try {
      await queryInterface.addColumn('tasks', 'userInformation', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ userInformation column added successfully to tasks table');
    } catch (error) {
      console.log('ℹ️  userInformation column might already exist or there was an error adding it:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tasks', 'userInformation');
      console.log('✅ userInformation column removed from tasks table');
    } catch (error) {
      console.log('ℹ️  Could not remove userInformation column:', error.message);
    }
  }
};