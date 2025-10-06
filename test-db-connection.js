const sequelize = require('./config/database');
const PermissionTemplate = require('./models/PermissionTemplate');
const Dropdown = require('./models/Dropdown');

async function testConnection() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Test PermissionTemplate table
    const permissionTemplates = await PermissionTemplate.findAll();
    console.log(`Found ${permissionTemplates.length} permission templates`);
    
    // Test Dropdown table
    const dropdowns = await Dropdown.findAll();
    console.log(`Found ${dropdowns.length} dropdown values`);
    
    // Close connection
    await sequelize.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();