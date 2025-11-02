// Migration to add requester information to leaves table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding requester columns to leaves table...');
    
    try {
      // Check if we're using MySQL/TiDB or SQLite
      const isMySQL = queryInterface.sequelize.getDialect() === 'mysql';
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isMySQL) {
        // For MySQL/TiDB
        console.log('🔧 Using MySQL/TiDB database');
        
        // Check if the requestedBy column exists
        const [requestedByResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'leaves' 
          AND COLUMN_NAME = 'requestedBy'
        `);
        
        if (requestedByResults.length > 0) {
          console.log('ℹ️  requestedBy column already exists in leaves table');
        } else {
          // Add the requestedBy column to leaves table
          await queryInterface.addColumn('leaves', 'requestedBy', {
            type: Sequelize.INTEGER,
            allowNull: true
          });
          console.log('✅ requestedBy column added successfully to leaves table');
        }
        
        // Check if the requestedByName column exists
        const [requestedByNameResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'leaves' 
          AND COLUMN_NAME = 'requestedByName'
        `);
        
        if (requestedByNameResults.length > 0) {
          console.log('ℹ️  requestedByName column already exists in leaves table');
        } else {
          // Add the requestedByName column to leaves table
          await queryInterface.addColumn('leaves', 'requestedByName', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ requestedByName column added successfully to leaves table');
        }
      } else if (isSQLite) {
        // For SQLite
        console.log('🔧 Using SQLite database');
        
        const tableInfo = await queryInterface.describeTable('leaves');
        let columnsAdded = false;
        
        if (!tableInfo.requestedBy) {
          await queryInterface.addColumn('leaves', 'requestedBy', {
            type: Sequelize.INTEGER,
            allowNull: true
          });
          console.log('✅ requestedBy column added successfully to leaves table');
          columnsAdded = true;
        } else {
          console.log('ℹ️  requestedBy column already exists in leaves table');
        }
        
        if (!tableInfo.requestedByName) {
          await queryInterface.addColumn('leaves', 'requestedByName', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ requestedByName column added successfully to leaves table');
          columnsAdded = true;
        } else {
          console.log('ℹ️  requestedByName column already exists in leaves table');
        }
        
        if (!columnsAdded) {
          console.log('✅ All requester columns already exist');
        }
      } else {
        console.log('⚠️  Unsupported database dialect, attempting to add columns anyway...');
        // Try to add columns anyway for other database types
        try {
          await queryInterface.addColumn('leaves', 'requestedBy', {
            type: Sequelize.INTEGER,
            allowNull: true
          });
          console.log('✅ requestedBy column added successfully to leaves table');
        } catch (error) {
          console.log('ℹ️  requestedBy column might already exist:', error.message);
        }
        
        try {
          await queryInterface.addColumn('leaves', 'requestedByName', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ requestedByName column added successfully to leaves table');
        } catch (error) {
          console.log('ℹ️  requestedByName column might already exist:', error.message);
        }
      }
    } catch (error) {
      console.log('⚠️  Error checking or adding requester columns:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Removing requester columns from leaves table...');
      
      // Check if we're using MySQL/TiDB or SQLite
      const isMySQL = queryInterface.sequelize.getDialect() === 'mysql';
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isMySQL || isSQLite) {
        // For MySQL/TiDB and SQLite
        await queryInterface.removeColumn('leaves', 'requestedBy');
        await queryInterface.removeColumn('leaves', 'requestedByName');
        console.log('✅ Requester columns removed from leaves table');
      } else {
        // For other database types
        try {
          await queryInterface.removeColumn('leaves', 'requestedBy');
        } catch (error) {
          console.log('ℹ️  Could not remove requestedBy column:', error.message);
        }
        
        try {
          await queryInterface.removeColumn('leaves', 'requestedByName');
        } catch (error) {
          console.log('ℹ️  Could not remove requestedByName column:', error.message);
        }
        console.log('✅ Requester columns removal attempt completed');
      }
    } catch (error) {
      console.log('⚠️  Error removing requester columns:', error.message);
      throw error;
    }
  }
};