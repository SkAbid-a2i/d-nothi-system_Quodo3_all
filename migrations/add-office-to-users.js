const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function addOfficeToUsers() {
  console.log('🔍 Adding office column to users table...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Check if we're using SQLite or MySQL
    const isSQLite = sequelize.getDialect() === 'sqlite';
    
    if (isSQLite) {
      console.log('🔧 SQLite detected, recreating users table...');
      
      // Drop users_new table if it exists
      try {
        await sequelize.query("DROP TABLE IF EXISTS users_new", { type: QueryTypes.RAW });
      } catch (err) {
        // Ignore error if table doesn't exist
      }
      
      // For SQLite, we need to recreate the table with the office column
      await sequelize.query(
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
        { type: QueryTypes.RAW }
      );
      
      // Check if office column exists in old table
      const columns = await sequelize.query(
        "PRAGMA table_info(users)",
        { type: QueryTypes.SELECT }
      );
      
      const officeColumnExists = columns.some(column => column.name === 'office');
      
      if (officeColumnExists) {
        // Copy data from old table to new table (including office column)
        await sequelize.query(
          `INSERT INTO users_new (
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
          ) SELECT 
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
          FROM users`,
          { type: QueryTypes.RAW }
        );
      } else {
        // Copy data from old table to new table (without office column)
        await sequelize.query(
          `INSERT INTO users_new (
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, office, createdAt, updatedAt
          ) SELECT 
            id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, NULL, createdAt, updatedAt
          FROM users`,
          { type: QueryTypes.RAW }
        );
      }
      
      // Drop old table
      await sequelize.query("DROP TABLE users", { type: QueryTypes.RAW });
      
      // Rename new table to users
      await sequelize.query("ALTER TABLE users_new RENAME TO users", { type: QueryTypes.RAW });
      
      console.log('✅ Office column successfully added to users table');
    } else {
      console.log('🔧 MySQL/TiDB detected, adding column...');
      
      // For MySQL/TiDB, we can directly add the column
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN office VARCHAR(255) NULL",
        { type: QueryTypes.RAW }
      );
      
      console.log('✅ Office column successfully added to users table');
    }
    
    await sequelize.close();
    console.log('\n✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addOfficeToUsers();
}

module.exports = addOfficeToUsers;