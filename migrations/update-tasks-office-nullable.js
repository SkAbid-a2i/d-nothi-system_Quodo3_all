const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function updateTasksOfficeNullable() {
  console.log('🔍 Updating tasks table to make office column nullable...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Check if we're using SQLite or MySQL
    const isSQLite = sequelize.getDialect() === 'sqlite';
    
    if (isSQLite) {
      console.log('🔧 SQLite detected, recreating tasks table...');
      
      // For SQLite, we need to recreate the table with the office column as nullable
      await sequelize.query(
        `CREATE TABLE tasks_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATETIME NOT NULL,
          source VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          service VARCHAR(255) NOT NULL,
          userId INTEGER NOT NULL,
          userName VARCHAR(255) NOT NULL,
          office VARCHAR(255),
          description TEXT NOT NULL,
          status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
          comments TEXT,
          attachments TEXT,
          files TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )`,
        { type: QueryTypes.RAW }
      );
      
      // Copy data from old table to new table
      await sequelize.query(
        `INSERT INTO tasks_new (
          id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
        ) SELECT 
          id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
        FROM tasks`,
        { type: QueryTypes.RAW }
      );
      
      // Drop old table
      await sequelize.query("DROP TABLE tasks", { type: QueryTypes.RAW });
      
      // Rename new table to tasks
      await sequelize.query("ALTER TABLE tasks_new RENAME TO tasks", { type: QueryTypes.RAW });
      
      console.log('✅ Tasks table successfully updated to make office column nullable');
    } else {
      console.log('🔧 MySQL/TiDB detected, modifying column...');
      
      // For MySQL/TiDB, we can directly modify the column
      await sequelize.query(
        "ALTER TABLE tasks MODIFY COLUMN office VARCHAR(255) NULL",
        { type: QueryTypes.RAW }
      );
      
      console.log('✅ Tasks table successfully updated to make office column nullable');
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
  updateTasksOfficeNullable();
}

module.exports = updateTasksOfficeNullable;