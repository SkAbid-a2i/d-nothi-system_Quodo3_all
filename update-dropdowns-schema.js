// Script to manually update the dropdowns table schema to include 'Obligation' in the type ENUM
const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function updateDropdownsSchema() {
  try {
    console.log('Updating dropdowns table schema to include Obligation in type ENUM...');
    
    // For SQLite, we need to use a different approach since it doesn't support ENUM constraints
    // We'll just ensure the column exists with the right type
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if we're using SQLite or MySQL
    const dialect = sequelize.getDialect();
    console.log('Database dialect:', dialect);
    
    if (dialect === 'sqlite') {
      // SQLite doesn't enforce ENUM constraints, so we just need to ensure the column exists
      console.log('SQLite database - no ENUM constraint to update');
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      // For MySQL, we need to modify the ENUM
      console.log('Updating MySQL ENUM for dropdowns.type column...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: DataTypes.ENUM('Source', 'Category', 'Service', 'Office', 'Obligation'),
        allowNull: false
      });
      console.log('MySQL ENUM updated successfully');
    } else {
      console.log('Unsupported database dialect:', dialect);
    }
    
    console.log('Dropdowns table schema updated successfully');
  } catch (error) {
    console.error('Error updating dropdowns table schema:', error);
  }
}

// Run the function
updateDropdownsSchema();