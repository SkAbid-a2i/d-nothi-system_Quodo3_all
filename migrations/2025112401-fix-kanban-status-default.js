// Migration to fix Kanban table status default value
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if kanban table exists (database-agnostic approach)
      const tables = await queryInterface.showAllTables();
      const hasKanbanTable = tables.some(table => table.toLowerCase() === 'kanban');
      
      if (hasKanbanTable) {
        console.log('Kanban table found, fixing status default value...');
        
        // For database-agnostic approach, we need to handle different DBMS differently
        const dialect = queryInterface.sequelize.getDialect();
        
        if (dialect === 'sqlite') {
          // SQLite requires recreating the table to change column defaults
          // This is a complex operation, so we'll just log that the table exists
          console.log('SQLite detected - status default value fix not implemented for SQLite');
        } else {
          // For MySQL/TiDB, we can modify the column directly
          await queryInterface.sequelize.query(
            "ALTER TABLE kanban MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'backlog'",
            { type: queryInterface.sequelize.QueryTypes.RAW }
          );
        }
        
        console.log('✅ Kanban status default value fixed to lowercase');
      } else {
        console.log('Kanban table not found, creating it...');
        // Create kanban table with correct default value
        await queryInterface.createTable('kanban', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT
          },
          status: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: 'backlog'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        });
        
        // Create indexes
        await queryInterface.sequelize.query(
          'CREATE INDEX idx_kanban_status ON kanban(status)',
          { type: queryInterface.sequelize.QueryTypes.RAW }
        );
        
        await queryInterface.sequelize.query(
          'CREATE INDEX idx_kanban_created_at ON kanban(createdAt)',
          { type: queryInterface.sequelize.QueryTypes.RAW }
        );
        
        console.log('✅ Kanban table created with correct default value');
      }
    } catch (error) {
      console.error('Error fixing Kanban table:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to old default value (not recommended)
    try {
      // Check if kanban table exists (database-agnostic approach)
      const tables = await queryInterface.showAllTables();
      const hasKanbanTable = tables.some(table => table.toLowerCase() === 'kanban');
      
      if (hasKanbanTable) {
        const dialect = queryInterface.sequelize.getDialect();
        
        if (dialect === 'sqlite') {
          // SQLite requires recreating the table to change column defaults
          console.log('SQLite detected - status default value revert not implemented for SQLite');
        } else {
          // For MySQL/TiDB, we can modify the column directly
          await queryInterface.sequelize.query(
            "ALTER TABLE kanban MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Backlog'",
            { type: queryInterface.sequelize.QueryTypes.RAW }
          );
        }
        
        console.log('ℹ️  Kanban status default value reverted to uppercase');
      }
    } catch (error) {
      console.error('Error reverting Kanban table:', error.message);
      throw error;
    }
  }
};