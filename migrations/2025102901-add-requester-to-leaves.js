// Migration to add requester information to leaves table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding requester columns to leaves table...');
    
    try {
      // Check if the requestedBy column exists before trying to add it
      if (Sequelize.options.dialect === 'sqlite') {
        const tableInfo = await queryInterface.describeTable('leaves');
        if (tableInfo.requestedBy) {
          console.log('ℹ️  requestedBy column already exists in leaves table');
          return;
        }
      } else {
        // For MySQL/TiDB
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'leaves' 
          AND COLUMN_NAME = 'requestedBy'
        `);
        
        if (results.length > 0) {
          console.log('ℹ️  requestedBy column already exists in leaves table');
          return;
        }
      }
    } catch (error) {
      console.log('Could not check if requestedBy column exists, attempting to add it anyway...');
    }
    
    try {
      // Add the requestedBy column to leaves table
      await queryInterface.addColumn('leaves', 'requestedBy', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      
      // Add the requestedByName column to leaves table
      await queryInterface.addColumn('leaves', 'requestedByName', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      
      console.log('✅ Requester columns added successfully to leaves table');
    } catch (error) {
      console.log('ℹ️  Requester columns might already exist or there was an error adding them:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('leaves', 'requestedBy');
      await queryInterface.removeColumn('leaves', 'requestedByName');
      console.log('✅ Requester columns removed from leaves table');
    } catch (error) {
      console.log('ℹ️  Could not remove requester columns:', error.message);
    }
  }
};