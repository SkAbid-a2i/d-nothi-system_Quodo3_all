// Migration to create kanban table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if kanban table exists
    // Use a database-agnostic approach
    try {
      await queryInterface.describeTable('kanban');
      console.log('ℹ️  Kanban table already exists');
      return;
    } catch (error) {
      // Table doesn't exist, continue with creation
    }

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
        defaultValue: 'Backlog'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
  },

  down: async (queryInterface, Sequelize) => {
    // Drop kanban table
    await queryInterface.dropTable('kanban');
    console.log('🗑️  Kanban table dropped');
  }
};