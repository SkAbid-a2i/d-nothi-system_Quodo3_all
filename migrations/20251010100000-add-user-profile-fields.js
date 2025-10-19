// Migration to add blood group and phone number fields to users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding user profile fields to users table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      // Check for bloodGroup column
      if (isSQLite) {
        const tableInfo = await queryInterface.describeTable('users');
        if (!tableInfo.bloodGroup) {
          await queryInterface.addColumn('users', 'bloodGroup', {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ bloodGroup column added successfully');
        } else {
          console.log('ℹ️  bloodGroup column already exists');
        }
      } else {
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'bloodGroup'
        `);
        
        if (results.length === 0) {
          await queryInterface.addColumn('users', 'bloodGroup', {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ bloodGroup column added successfully');
        } else {
          console.log('ℹ️  bloodGroup column already exists');
        }
      }
      
      // Check for phoneNumber column
      if (isSQLite) {
        const tableInfo = await queryInterface.describeTable('users');
        if (!tableInfo.phoneNumber) {
          await queryInterface.addColumn('users', 'phoneNumber', {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ phoneNumber column added successfully');
        } else {
          console.log('ℹ️  phoneNumber column already exists');
        }
      } else {
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'phoneNumber'
        `);
        
        if (results.length === 0) {
          await queryInterface.addColumn('users', 'phoneNumber', {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ phoneNumber column added successfully');
        } else {
          console.log('ℹ️  phoneNumber column already exists');
        }
      }
      
      // Check for bio column
      if (isSQLite) {
        const tableInfo = await queryInterface.describeTable('users');
        if (!tableInfo.bio) {
          await queryInterface.addColumn('users', 'bio', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ bio column added successfully');
        } else {
          console.log('ℹ️  bio column already exists');
        }
      } else {
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'bio'
        `);
        
        if (results.length === 0) {
          await queryInterface.addColumn('users', 'bio', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
          });
          console.log('✅ bio column added successfully');
        } else {
          console.log('ℹ️  bio column already exists');
        }
      }
      
      console.log('✅ All user profile fields processed successfully');
    } catch (error) {
      console.error('❌ Error adding user profile fields:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'bloodGroup');
      console.log('✅ bloodGroup column removed');
    } catch (error) {
      console.log('ℹ️  Could not remove bloodGroup column:', error.message);
    }
    
    try {
      await queryInterface.removeColumn('users', 'phoneNumber');
      console.log('✅ phoneNumber column removed');
    } catch (error) {
      console.log('ℹ️  Could not remove phoneNumber column:', error.message);
    }
    
    try {
      await queryInterface.removeColumn('users', 'bio');
      console.log('✅ bio column removed');
    } catch (error) {
      console.log('ℹ️  Could not remove bio column:', error.message);
    }
    
    console.log('✅ All user profile fields rollback completed');
  }
};