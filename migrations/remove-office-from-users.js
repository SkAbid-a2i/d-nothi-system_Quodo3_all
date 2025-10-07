const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function removeOfficeFromUsers() {
  console.log('🔍 Removing office column from users table...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Check if office column exists
    const columns = await sequelize.query(
      "PRAGMA table_info(users)",
      { type: QueryTypes.SELECT }
    );
    
    const officeColumnExists = columns.some(column => column.name === 'office');
    
    if (officeColumnExists) {
      console.log('🔧 Office column found, removing it...');
      
      // For SQLite, we need to recreate the table without the office column
      await sequelize.query(
        `CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          fullName VARCHAR(255) NOT NULL,
          role ENUM('SystemAdmin', 'Admin', 'Supervisor', 'Agent') DEFAULT 'Agent',
          isActive BOOLEAN DEFAULT 1,
          storageQuota INTEGER DEFAULT 100,
          usedStorage INTEGER DEFAULT 0,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )`,
        { type: QueryTypes.RAW }
      );
      
      // Copy data from old table to new table (excluding office column)
      await sequelize.query(
        `INSERT INTO users_new (
          id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, createdAt, updatedAt
        ) SELECT 
          id, username, email, password, fullName, role, isActive, storageQuota, usedStorage, createdAt, updatedAt
        FROM users`,
        { type: QueryTypes.RAW }
      );
      
      // Drop old table
      await sequelize.query("DROP TABLE users", { type: QueryTypes.RAW });
      
      // Rename new table to users
      await sequelize.query("ALTER TABLE users_new RENAME TO users", { type: QueryTypes.RAW });
      
      console.log('✅ Office column successfully removed from users table');
    } else {
      console.log('ℹ️  Office column not found in users table, nothing to remove');
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
  removeOfficeFromUsers();
}

module.exports = removeOfficeFromUsers;