module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('kanban_boards', {
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
        type: Sequelize.TEXT,
        allowNull: true
      },
      column: {
        type: Sequelize.ENUM('backlog', 'next', 'inProgress', 'testing', 'validate', 'done'),
        defaultValue: 'backlog'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      office: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('kanban_boards', ['column']);
    await queryInterface.addIndex('kanban_boards', ['userId']);
    await queryInterface.addIndex('kanban_boards', ['position']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('kanban_boards');
  }
};