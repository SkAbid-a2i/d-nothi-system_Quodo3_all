module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add incident column to tasks table
    await queryInterface.addColumn('tasks', 'incident', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove incident column from tasks table
    await queryInterface.removeColumn('tasks', 'incident');
  }
};