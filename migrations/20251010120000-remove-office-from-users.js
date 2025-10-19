// Migration to remove office column from users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Removing office column from users table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating users table without office column...');
        
        // For SQLite, we need to recreate the table without the office column
        // Note: SQLite doesn't support ENUM directly, so we use TEXT with a check constraint
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
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          )`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Copy data from old table to new table (excluding office column)
        await queryInterface.sequelize.query(
          `INSERT INTO users_new (
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, createdAt, updatedAt
          ) SELECT 
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, createdAt, updatedAt
          FROM users`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Drop old table
        await queryInterface.sequelize.query("DROP TABLE users", { type: Sequelize.QueryTypes.RAW });
        
        // Rename new table to users
        await queryInterface.sequelize.query("ALTER TABLE users_new RENAME TO users", { type: Sequelize.QueryTypes.RAW });
        
        console.log('✅ Office column successfully removed from users table');
      } else {
        console.log('🔧 MySQL/TiDB detected, removing column...');
        
        // Check if office column exists
        const [results] = await queryInterface.sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'office'
        `);
        
        if (results.length > 0) {
          // For MySQL/TiDB, we can directly drop the column
          await queryInterface.sequelize.query(
            "ALTER TABLE users DROP COLUMN office",
            { type: Sequelize.QueryTypes.RAW }
          );
          
          console.log('✅ Office column successfully removed from users table');
        } else {
          console.log('ℹ️  Office column not found in users table, nothing to remove');
        }
      }
      
      console.log('\n✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Adding office column back to users table...');
      
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating users table with office column...');
        
        // Drop users_new table if it exists
        try {
          await queryInterface.sequelize.query("DROP TABLE IF EXISTS users_new", { type: Sequelize.QueryTypes.RAW });
        } catch (err) {
          // Ignore error if table doesn't exist
        }
        
        // For SQLite, we need to recreate the table with the office column
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
            office VARCHAR(255),
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          )`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Copy data from old table to new table (with office column as NULL)
        await queryInterface.sequelize.query(
          `INSERT INTO users_new (
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
          ) SELECT 
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, NULL, createdAt, updatedAt
          FROM users`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Drop old table
        await queryInterface.sequelize.query("DROP TABLE users", { type: Sequelize.QueryTypes.RAW });
        
        // Rename new table to users
        await queryInterface.sequelize.query("ALTER TABLE users_new RENAME TO users", { type: Sequelize.QueryTypes.RAW });
        
        console.log('✅ Office column successfully added back to users table');
      } else {
        console.log('🔧 MySQL/TiDB detected, adding column back...');
        
        // For MySQL/TiDB, we can directly add the column
        await queryInterface.sequelize.query(
          "ALTER TABLE users ADD COLUMN office VARCHAR(255) NULL",
          { type: Sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Office column successfully added back to users table');
      }
      
      console.log('\n✅ Migration rollback completed successfully');
    } catch (error) {
      console.error('❌ Migration rollback failed:', error.message);
      throw error;
    }
  }
};