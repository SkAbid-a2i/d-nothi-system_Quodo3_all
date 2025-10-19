// Migration to update tasks table to make office column nullable
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔍 Updating tasks table to make office column nullable...');
    
    try {
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating tasks table...');
        
        // For SQLite, we need to recreate the table with the office column as nullable
        await queryInterface.sequelize.query(
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
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Copy data from old table to new table
        await queryInterface.sequelize.query(
          `INSERT INTO tasks_new (
            id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
          ) SELECT 
            id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
          FROM tasks`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Drop old table
        await queryInterface.sequelize.query("DROP TABLE tasks", { type: Sequelize.QueryTypes.RAW });
        
        // Rename new table to tasks
        await queryInterface.sequelize.query("ALTER TABLE tasks_new RENAME TO tasks", { type: Sequelize.QueryTypes.RAW });
        
        console.log('✅ Tasks table successfully updated to make office column nullable');
      } else {
        console.log('🔧 MySQL/TiDB detected, modifying column...');
        
        // For MySQL/TiDB, we can directly modify the column
        await queryInterface.sequelize.query(
          "ALTER TABLE tasks MODIFY COLUMN office VARCHAR(255) NULL",
          { type: Sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Tasks table successfully updated to make office column nullable');
      }
      
      console.log('\n✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔍 Reverting tasks table office column to non-nullable...');
      
      // Check if we're using SQLite or MySQL
      const isSQLite = queryInterface.sequelize.getDialect() === 'sqlite';
      
      if (isSQLite) {
        console.log('🔧 SQLite detected, recreating tasks table with office column non-nullable...');
        
        // For SQLite, we need to recreate the table with the office column as non-nullable
        await queryInterface.sequelize.query(
          `CREATE TABLE tasks_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            source VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            service VARCHAR(255) NOT NULL,
            userId INTEGER NOT NULL,
            userName VARCHAR(255) NOT NULL,
            office VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
            comments TEXT,
            attachments TEXT,
            files TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          )`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Copy data from old table to new table (only rows where office is not null)
        await queryInterface.sequelize.query(
          `INSERT INTO tasks_new (
            id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
          ) SELECT 
            id, date, source, category, service, userId, userName, office, description, status, comments, attachments, files, createdAt, updatedAt
          FROM tasks WHERE office IS NOT NULL`,
          { type: Sequelize.QueryTypes.RAW }
        );
        
        // Drop old table
        await queryInterface.sequelize.query("DROP TABLE tasks", { type: Sequelize.QueryTypes.RAW });
        
        // Rename new table to tasks
        await queryInterface.sequelize.query("ALTER TABLE tasks_new RENAME TO tasks", { type: Sequelize.QueryTypes.RAW });
        
        console.log('✅ Tasks table successfully reverted to make office column non-nullable');
      } else {
        console.log('🔧 MySQL/TiDB detected, reverting column...');
        
        // For MySQL/TiDB, we can directly modify the column back to non-nullable
        await queryInterface.sequelize.query(
          "ALTER TABLE tasks MODIFY COLUMN office VARCHAR(255) NOT NULL",
          { type: Sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Tasks table successfully reverted to make office column non-nullable');
      }
      
      console.log('\n✅ Migration rollback completed successfully');
    } catch (error) {
      console.error('❌ Migration rollback failed:', error.message);
      throw error;
    }
  }
};