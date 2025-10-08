// Migration to remove the flag column from tasks table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the flag column from tasks table
    await queryInterface.removeColumn('tasks', 'flag');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the flag column back if we need to rollback
    await queryInterface.addColumn('tasks', 'flag', {
      type: Sequelize.ENUM('None', 'Low', 'Medium', 'High', 'Urgent'),
      defaultValue: 'None',
      allowNull: true
    });
  }
};