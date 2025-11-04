// Migration to add designation column to users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding designation column to users table...');
    
    try {
      // Check if we're using MySQL/TiDB or SQLite
      const isMySQL = queryInterface.sequelize.getDialect() === 'mysql';
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isMySQL) {
        // For MySQL/TiDB
        console.log('🔧 Using MySQL/TiDB database');
        
        // Check if the designation column exists
        const [designationResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'designation'
        `);
        
        if (designationResults.length > 0) {
          console.log('ℹ️  designation column already exists in users table');
        } else {
          // Add the designation column to users table
          await queryInterface.addColumn('users', 'designation', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ designation column added successfully to users table');
        }
      } else if (isSQLite) {
        // For SQLite
        console.log('🔧 Using SQLite database');
        
        const tableInfo = await queryInterface.describeTable('users');
        let columnsAdded = false;
        
        if (!tableInfo.designation) {
          await queryInterface.addColumn('users', 'designation', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ designation column added successfully to users table');
          columnsAdded = true;
        } else {
          console.log('ℹ️  designation column already exists in users table');
        }
        
        if (!columnsAdded) {
          console.log('✅ designation column already exists');
        }
      } else {
        console.log('⚠️  Unsupported database dialect, attempting to add column anyway...');
        // Try to add column anyway for other database types
        try {
          await queryInterface.addColumn('users', 'designation', {
            type: Sequelize.STRING(255),
            allowNull: true
          });
          console.log('✅ designation column added successfully to users table');
        } catch (error) {
          console.log('ℹ️  designation column might already exist:', error.message);
        }
      }
    } catch (error) {
      console.log('⚠️  Error checking or adding designation column:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Removing designation column from users table...');
      
      // Check if we're using MySQL/TiDB or SQLite
      const isMySQL = queryInterface.sequelize.getDialect() === 'mysql';
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isMySQL || isSQLite) {
        // For MySQL/TiDB and SQLite
        await queryInterface.removeColumn('users', 'designation');
        console.log('✅ designation column removed from users table');
      } else {
        // For other database types
        try {
          await queryInterface.removeColumn('users', 'designation');
        } catch (error) {
          console.log('ℹ️  Could not remove designation column:', error.message);
        }
        console.log('✅ designation column removal attempt completed');
      }
    } catch (error) {
      console.log('⚠️  Error removing designation column:', error.message);
      throw error;
    }
  }
};