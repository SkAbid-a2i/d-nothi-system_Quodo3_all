// Migration to fix task table schema to match the model
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify columns to match the model definition
    await queryInterface.changeColumn('tasks', 'source', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ''
    });
    
    await queryInterface.changeColumn('tasks', 'category', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ''
    });
    
    await queryInterface.changeColumn('tasks', 'service', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ''
    });
    
    await queryInterface.changeColumn('tasks', 'office', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    
    // Add userInformation column if it doesn't exist
    await queryInterface.addColumn('tasks', 'userInformation', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    // Change date column from datetime to date to match DATEONLY in model
    await queryInterface.changeColumn('tasks', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.changeColumn('tasks', 'source', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
    
    await queryInterface.changeColumn('tasks', 'category', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
    
    await queryInterface.changeColumn('tasks', 'service', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
    
    await queryInterface.changeColumn('tasks', 'office', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
    
    // Remove userInformation column
    await queryInterface.removeColumn('tasks', 'userInformation');
    
    // Change date column back to datetime
    await queryInterface.changeColumn('tasks', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};