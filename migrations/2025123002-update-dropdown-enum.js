module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing 'Service' dropdown values to 'Sub-Category' before modifying the ENUM
    await queryInterface.sequelize.query(`
      UPDATE dropdowns SET type = 'Sub-Category' WHERE type = 'Service'
    `);
    
    // Also handle any case variations that might exist
    await queryInterface.sequelize.query(`
      UPDATE dropdowns SET type = 'Sub-Category' WHERE type LIKE 'service' OR type LIKE 'SERVICE'
    `);
    
    // Update the ENUM type for the dropdowns table (database-agnostic approach)
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
    // Revert to the previous enum type, removing the new values (database-agnostic approach)
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