// Script to fix production database dropdowns table
// This script will check and fix the ENUM values for the type column

const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function fixProductionDropdowns() {
  try {
    console.log('Checking and fixing production dropdowns table...');
    
    // Get the database dialect
    const dialect = sequelize.getDialect();
    console.log('Database dialect:', dialect);
    
    // For MySQL/TiDB, we need to ensure the ENUM includes 'Obligation'
    if (dialect === 'mysql' || dialect === 'mariadb') {
      console.log('Checking MySQL/TiDB dropdowns table...');
      
      // First, let's check the current column definition
      const queryInterface = sequelize.getQueryInterface();
      
      // We'll modify the column to ensure it includes all required ENUM values
      console.log('Updating dropdowns.type column ENUM values...');
      await queryInterface.changeColumn('dropdowns', 'type', {
        type: DataTypes.ENUM('Source', 'Category', 'Service', 'Office', 'Obligation'),
        allowNull: false
      });
      
      console.log('Dropdowns table updated successfully');
    } else {
      console.log('Non-MySQL database - no ENUM update needed');
    }
    
    // Verify that we can insert an Obligation value
    console.log('Testing Obligation value insertion...');
    const Dropdown = require('./models/Dropdown');
    
    // Try to create a test Obligation value
    const testDropdown = await Dropdown.create({
      type: 'Obligation',
      value: 'Test Obligation Value',
      isActive: true,
      createdBy: 1
    });
    
    console.log('Test Obligation value created successfully:', testDropdown.id);
    
    // Clean up - delete the test value
    await testDropdown.destroy();
    console.log('Test Obligation value cleaned up');
    
    console.log('Production dropdowns fix completed successfully');
  } catch (error) {
    console.error('Error fixing production dropdowns:', error);
    console.error('Error details:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the function
fixProductionDropdowns();