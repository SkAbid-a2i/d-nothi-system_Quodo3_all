// Migration to create collaborations table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if collaborations table exists
    const tables = await queryInterface.sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='collaborations'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (tables.length === 0) {
      // Create collaborations table
      await queryInterface.createTable('collaborations', {
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
        availability: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'Always'
        },
        urgency: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'None'
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
          defaultValue: Sequelize.fn('now')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        }
      });
      
      console.log('✅ Collaborations table created successfully');
    } else {
      console.log('ℹ️  Collaborations table already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop collaborations table
    await queryInterface.dropTable('collaborations');
    console.log('🗑️  Collaborations table dropped');
  }
};