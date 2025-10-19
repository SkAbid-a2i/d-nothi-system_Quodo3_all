// Migration to add office column back to users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding office column back to users table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, adding office column...');
        
        // For SQLite, we need to recreate the table with the office column
        // First, check if office column already exists
        const columns = await queryInterface.sequelize.query(
          "PRAGMA table_info(users)",
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        const columnNames = columns.map(column => column.name);
        
        if (!columnNames.includes('office')) {
          // Drop users_new table if it exists
          try {
            await queryInterface.sequelize.query("DROP TABLE IF EXISTS users_new", { type: Sequelize.QueryTypes.RAW });
          } catch (err) {
            // Ignore error if table doesn't exist
          }
          
          // Create new table with office column
          await queryInterface.sequelize.query(
            `CREATE TABLE users_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username VARCHAR(255) NOT NULL UNIQUE,
              email VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              fullName VARCHAR(255) NOT NULL,
              role TEXT DEFAULT 'Agent' CHECK(role IN ('SystemAdmin', 'Admin', 'Supervisor', 'Agent')),
              isActive BOOLEAN DEFAULT 1,
              storageQuota INTEGER DEFAULT 100,
              usedStorage INTEGER DEFAULT 0,
              bloodGroup VARCHAR(10) NULL,
              phoneNumber VARCHAR(20) NULL,
              bio TEXT NULL,
              office VARCHAR(255) NULL,
              createdAt DATETIME NOT NULL,
              updatedAt DATETIME NOT NULL
            )`,
            { type: Sequelize.QueryTypes.RAW }
          );
          
          // Copy data from old table to new table
          await queryInterface.sequelize.query(
            `INSERT INTO users_new (
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, bloodGroup, phoneNumber, bio, office, createdAt, updatedAt
            ) SELECT 
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, bloodGroup, phoneNumber, bio, NULL, createdAt, updatedAt
            FROM users`,
            { type: Sequelize.QueryTypes.RAW }
          );
          
          // Drop old table
          await queryInterface.sequelize.query("DROP TABLE users", { type: Sequelize.QueryTypes.RAW });
          
          // Rename new table to users
          await queryInterface.sequelize.query("ALTER TABLE users_new RENAME TO users", { type: Sequelize.QueryTypes.RAW });
          
          console.log('✅ Office column successfully added to users table');
        } else {
          console.log('ℹ️  Office column already exists');
        }
      } else {
        console.log('🔧 MySQL/TiDB detected, adding column...');
        
        // Check if office column exists
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'office'
        `);
        
        if (results.length === 0) {
          // For MySQL/TiDB, we can directly add the column
          await queryInterface.sequelize.query(
            "ALTER TABLE users ADD COLUMN office VARCHAR(255) NULL",
            { type: Sequelize.QueryTypes.RAW }
          );
          
          console.log('✅ Office column successfully added to users table');
        } else {
          console.log('ℹ️  Office column already exists');
        }
      }
      
      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('ℹ️  This migration does not remove the office column to prevent data loss');
    console.log('✅ Migration rollback completed (no changes made)');
  }
};