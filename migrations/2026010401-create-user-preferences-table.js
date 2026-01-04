module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the user_preferences table
    await queryInterface.createTable('user_preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      theme: {
        type: Sequelize.STRING(20),
        defaultValue: 'light'
      },
      primaryColor: {
        type: Sequelize.STRING(7),
        defaultValue: '#667eea'
      },
      secondaryColor: {
        type: Sequelize.STRING(7),
        defaultValue: '#f093fb'
      },
      backgroundType: {
        type: Sequelize.STRING(20),
        defaultValue: 'solid'
      },
      backgroundColor: {
        type: Sequelize.STRING(7),
        defaultValue: '#ffffff'
      },
      gradientEndColor: {
        type: Sequelize.STRING(7),
        defaultValue: '#f093fb'
      },
      gradientDirection: {
        type: Sequelize.STRING(20),
        defaultValue: 'to right'
      },
      backgroundImage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      language: {
        type: Sequelize.STRING(5),
        defaultValue: 'en'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index on userId for better performance
    await queryInterface.addIndex('user_preferences', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_preferences');
  }
};