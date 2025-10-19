// Migration to add office column to leaves table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding office column to leaves table...');
    
    try {
      // Check if the office column exists before trying to add it
      if (Sequelize.options.dialect === 'sqlite') {
        const tableInfo = await queryInterface.describeTable('leaves');
        if (tableInfo.office) {
          console.log('ℹ️  office column already exists in leaves table');
          return;
        }
      } else {
        // For MySQL/TiDB
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'leaves' 
          AND COLUMN_NAME = 'office'
        `);
        
        if (results.length > 0) {
          console.log('ℹ️  office column already exists in leaves table');
          return;
        }
      }
    } catch (error) {
      console.log('Could not check if office column exists, attempting to add it anyway...');
    }
    
    try {
      // Add the office column to leaves table
      await queryInterface.addColumn('leaves', 'office', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      });
      
      console.log('✅ Office column added successfully to leaves table');
    } catch (error) {
      console.log('ℹ️  office column might already exist or there was an error adding it:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('leaves', 'office');
      console.log('✅ office column removed from leaves table');
    } catch (error) {
      console.log('ℹ️  Could not remove office column:', error.message);
    }
  }
};