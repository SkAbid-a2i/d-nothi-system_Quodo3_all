// Migration to fix Kanban table status default value
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if kanban table exists
      const tables = await queryInterface.sequelize.query(
        "SHOW TABLES LIKE 'kanban'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (tables.length > 0) {
        console.log('Kanban table found, fixing status default value...');
        
        // For MySQL/TiDB, we need to modify the column
        await queryInterface.sequelize.query(
          "ALTER TABLE kanban MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'backlog'",
          { type: queryInterface.sequelize.QueryTypes.RAW }
        );
        
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
      const tables = await queryInterface.sequelize.query(
        "SHOW TABLES LIKE 'kanban'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (tables.length > 0) {
        await queryInterface.sequelize.query(
          "ALTER TABLE kanban MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Backlog'",
          { type: queryInterface.sequelize.QueryTypes.RAW }
        );
        
        console.log('ℹ️  Kanban status default value reverted to uppercase');
      }
    } catch (error) {
      console.error('Error reverting Kanban table:', error.message);
      throw error;
    }
  }
};