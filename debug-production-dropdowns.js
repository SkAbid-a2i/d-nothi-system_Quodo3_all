// Script to debug production dropdowns issue
const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function debugProductionDropdowns() {
  try {
    console.log('Debugging production dropdowns issue...');
    
    // Get the database dialect
    const dialect = sequelize.getDialect();
    console.log('Database dialect:', dialect);
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // For MySQL/TiDB, let's check the current column definition
    if (dialect === 'mysql' || dialect === 'mariadb') {
      console.log('Checking MySQL/TiDB column definition...');
      
      // Query to get column information
      const [results] = await sequelize.query(
        "SHOW COLUMNS FROM dropdowns WHERE Field = 'type'"
      );
      
      console.log('Column info:', results[0]);
      
      // Try to create a test Obligation value
      console.log('Testing Obligation value creation...');
      const Dropdown = require('./models/Dropdown');
      
      try {
        const testDropdown = await Dropdown.create({
          type: 'Obligation',
          value: 'Test Obligation Debug',
          isActive: true,
          createdBy: 1
        });
        
        console.log('Test Obligation created successfully:', testDropdown.toJSON());
        
        // Clean up
        await testDropdown.destroy();
        console.log('Test Obligation cleaned up');
      } catch (createError) {
        console.error('Error creating test Obligation:', createError.message);
        if (createError.parent) {
          console.error('Parent error:', createError.parent.message);
          console.error('SQL:', createError.parent.sql);
          console.error('Parameters:', createError.parent.parameters);
        }
      }
    } else {
      console.log('Not MySQL/TiDB - skipping detailed column check');
    }
    
  } catch (error) {
    console.error('Error debugging production dropdowns:', error);
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
debugProductionDropdowns();