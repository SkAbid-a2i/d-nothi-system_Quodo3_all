module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add obligation column to tasks table
    await queryInterface.addColumn('tasks', 'obligation', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove obligation column from tasks table
    await queryInterface.removeColumn('tasks', 'obligation');
  }
};