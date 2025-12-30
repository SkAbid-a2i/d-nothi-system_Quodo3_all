module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'service' column exists before renaming
    const tableDescription = await queryInterface.describeTable('tasks');
    
    if (tableDescription.service) {
      // Rename the 'service' column to 'subCategory'
      await queryInterface.renameColumn('tasks', 'service', 'subCategory');
      console.log('Successfully renamed column: service -> subCategory');
    } else {
      console.log('Column "service" does not exist, creating "subCategory" column instead');
      
      // If 'service' doesn't exist, add the 'subCategory' column if it doesn't exist
      if (!tableDescription.subCategory) {
        await queryInterface.addColumn('tasks', 'subCategory', {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: ''
        });
      }
    }
    
    // Ensure the 'incident' column exists
    if (!tableDescription.incident) {
      await queryInterface.addColumn('tasks', 'incident', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ''
      });
      console.log('Added incident column to tasks table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if the 'subCategory' column exists before renaming back
    const tableDescription = await queryInterface.describeTable('tasks');
    
    if (tableDescription.subCategory) {
      // Rename the 'subCategory' column back to 'service'
      await queryInterface.renameColumn('tasks', 'subCategory', 'service');
      console.log('Successfully renamed column: subCategory -> service');
    }
    
    // Remove incident column if it exists
    if (tableDescription.incident) {
      await queryInterface.removeColumn('tasks', 'incident');
      console.log('Removed incident column from tasks table');
    }
  }
};