module.exports = {
  up: async (queryInterface, Sequelize) => {
    // For TiDB, we need to handle the ENUM update carefully
    // First, add the incident column to tasks table if it doesn't exist
    const tableDescription = await queryInterface.describeTable('tasks');
    
    if (!tableDescription.incident) {
      await queryInterface.addColumn('tasks', 'incident', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ''
      });
      console.log('Added incident column to tasks table');
    } else {
      console.log('Incident column already exists in tasks table');
    }

    // First, update existing 'Service' dropdown values to 'Sub-Category' before modifying the ENUM
    await queryInterface.sequelize.query(`
      UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service'
    `);
    
    // Also handle any case variations that might exist
    await queryInterface.sequelize.query(`
      UPDATE dropdowns SET type = 'Sub-Category' WHERE type LIKE 'service' OR type LIKE 'SERVICE'
    `);
    
    // For TiDB, we'll use a more compatible approach for ENUM modification
    // Since direct ENUM modification can be problematic in some cases, we'll use alter table
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'sqlite') {
      // SQLite doesn't support ENUM, so we'll just log the operation
      console.log('SQLite detected - ENUM type modification not applicable');
    } else {
      // For MySQL/TiDB, we can modify the ENUM directly
      await queryInterface.sequelize.query(`
        ALTER TABLE dropdowns 
        MODIFY COLUMN type ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation')
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove incident column from tasks table
    await queryInterface.removeColumn('tasks', 'incident');

    // Revert the dropdown type to exclude 'Incident' and 'Sub-Category'
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'sqlite') {
      // SQLite doesn't support ENUM, so we'll just log the operation
      console.log('SQLite detected - ENUM type revert not applicable');
    } else {
      // For MySQL/TiDB, we can modify the ENUM directly
      await queryInterface.sequelize.query(`
        ALTER TABLE dropdowns 
        MODIFY COLUMN type ENUM('Source', 'Category', 'Service', 'Office', 'Obligation')
      `);
    }
  }
};