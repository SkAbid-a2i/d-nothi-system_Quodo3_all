// Migration to add Obligation to the dropdowns type ENUM
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check the database dialect
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'mysql' || dialect === 'mariadb') {
      // For MySQL/TiDB, we need to modify the ENUM to include the new value
      console.log('Updating MySQL/TiDB dropdowns.type column ENUM...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: Sequelize.ENUM('Source', 'Category', 'Service', 'Office', 'Obligation'),
        allowNull: false
      });
    } else {
      // For SQLite and other databases, the ENUM is not enforced
      // but we'll still run the changeColumn to ensure consistency
      console.log('Updating dropdowns.type column (no ENUM enforcement in SQLite)...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: Sequelize.ENUM('Source', 'Category', 'Service', 'Office', 'Obligation'),
        allowNull: false
      });
    }
    
    console.log('Dropdowns table updated successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Check the database dialect
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'mysql' || dialect === 'mariadb') {
      // For MySQL/TiDB, revert to the original ENUM values (without Obligation)
      console.log('Reverting MySQL/TiDB dropdowns.type column ENUM...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: Sequelize.ENUM('Source', 'Category', 'Service', 'Office'),
        allowNull: false
      });
    } else {
      // For SQLite and other databases
      console.log('Reverting dropdowns.type column (no ENUM enforcement in SQLite)...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: Sequelize.ENUM('Source', 'Category', 'Service', 'Office'),
        allowNull: false
      });
    }
    
    console.log('Dropdowns table reverted successfully');
  }
};