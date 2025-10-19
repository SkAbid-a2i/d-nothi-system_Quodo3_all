// Migration to ensure user profile fields exist in users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Ensuring user profile fields exist in users table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, checking and adding columns if needed...');
        
        // For SQLite, we need to check if columns exist and add them if not
        const columns = await queryInterface.sequelize.query(
          "PRAGMA table_info(users)",
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        const columnNames = columns.map(column => column.name);
        
        // Check and add bloodGroup column
        if (!columnNames.includes('bloodGroup')) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10) NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ bloodGroup column added successfully');
        } else {
          console.log('ℹ️  bloodGroup column already exists');
        }
        
        // Check and add phoneNumber column
        if (!columnNames.includes('phoneNumber')) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20) NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ phoneNumber column added successfully');
        } else {
          console.log('ℹ️  phoneNumber column already exists');
        }
        
        // Check and add bio column
        if (!columnNames.includes('bio')) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN bio TEXT NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ bio column added successfully');
        } else {
          console.log('ℹ️  bio column already exists');
        }
      } else {
        console.log('🔧 MySQL/TiDB detected, checking and adding columns if needed...');
        
        // For MySQL/TiDB, check if columns exist and add them if not
        const [bloodGroupResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'bloodGroup'
        `);
        
        if (bloodGroupResults.length === 0) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10) NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ bloodGroup column added successfully');
        } else {
          console.log('ℹ️  bloodGroup column already exists');
        }
        
        const [phoneNumberResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'phoneNumber'
        `);
        
        if (phoneNumberResults.length === 0) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20) NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ phoneNumber column added successfully');
        } else {
          console.log('ℹ️  phoneNumber column already exists');
        }
        
        const [bioResults] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'bio'
        `);
        
        if (bioResults.length === 0) {
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN bio TEXT NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          console.log('✅ bio column added successfully');
        } else {
          console.log('ℹ️  bio column already exists');
        }
      }
      
      console.log('✅ All user profile fields ensured successfully');
    } catch (error) {
      console.error('❌ Error ensuring user profile fields:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('ℹ️  This migration does not remove columns to prevent data loss');
    console.log('✅ Migration rollback completed (no changes made)');
  }
};