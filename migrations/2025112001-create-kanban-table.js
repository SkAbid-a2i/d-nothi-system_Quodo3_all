// Migration to create kanban table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if kanban table exists
    const tables = await queryInterface.sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='kanban'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (tables.length === 0) {
      // Create kanban table
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
      
      console.log('✅ Kanban table created successfully');
    } else {
      console.log('ℹ️  Kanban table already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop kanban table
    await queryInterface.dropTable('kanban');
    console.log('🗑️  Kanban table dropped');
  }
};