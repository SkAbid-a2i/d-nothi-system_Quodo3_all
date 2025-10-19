// Migration to add blood group and phone number fields to users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'bloodGroup', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.addColumn('users', 'phoneNumber', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'bloodGroup');
    await queryInterface.removeColumn('users', 'phoneNumber');
    await queryInterface.removeColumn('users', 'bio');
  }
};