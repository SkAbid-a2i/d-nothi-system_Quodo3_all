// Migration to add office column to users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Adding office column to users table...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating users table...');
        
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
        
        // Check if office column exists in old table
        const columns = await queryInterface.sequelize.query(
          "PRAGMA table_info(users)",
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        const officeColumnExists = columns.some(column => column.name === 'office');
        
        if (officeColumnExists) {
          // Copy data from old table to new table (including office column)
          await queryInterface.sequelize.query(
            `INSERT INTO users_new (
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
            ) SELECT 
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
            FROM users`,
            { type: Sequelize.QueryTypes.RAW }
          );
        } else {
          // Copy data from old table to new table (without office column)
          await queryInterface.sequelize.query(
            `INSERT INTO users_new (
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
            ) SELECT 
              id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, NULL, createdAt, updatedAt
            FROM users`,
            { type: Sequelize.QueryTypes.RAW }
          );
        }
        
        // Drop old table
        await queryInterface.sequelize.query("DROP TABLE users", { type: Sequelize.QueryTypes.RAW });
        
        // Rename new table to users
        await queryInterface.sequelize.query("ALTER TABLE users_new RENAME TO users", { type: Sequelize.QueryTypes.RAW });
        
        console.log('✅ Office column successfully added to users table');
      } else {
        console.log('🔧 MySQL/TiDB detected, adding column...');
        
        // For MySQL/TiDB, we can directly add the column
        await queryInterface.sequelize.query(
          "ALTER TABLE users ADD COLUMN office VARCHAR(255) NULL",
          { type: Sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Office column successfully added to users table');
      }
      
      console.log('\n✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Removing office column from users table...');
      
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating users table without office column...');
        
        // For SQLite, we need to recreate the table without the office column
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
        
        // For MySQL/TiDB, we can directly drop the column
        await queryInterface.sequelize.query(
          "ALTER TABLE users DROP COLUMN office",
          { type: Sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Office column successfully removed from users table');
      }
      
      console.log('\n✅ Migration rollback completed successfully');
    } catch (error) {
      console.error('❌ Migration rollback failed:', error.message);
      throw error;
    }
  }
};