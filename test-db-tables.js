const sequelize = require('./config/database');

async function testTables() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Check if tables exist
    const tables = await sequelize.getQueryInterface().showAllSchemas();
    console.log('Available schemas:', tables);
    
    // Check for specific tables
    const permissionTable = await sequelize.getQueryInterface().describeTable('permission_templates').catch(() => null);
    console.log('Permission templates table exists:', !!permissionTable);
    
    const dropdownTable = await sequelize.getQueryInterface().describeTable('dropdowns').catch(() => null);
    console.log('Dropdowns table exists:', !!dropdownTable);
    
    // Close connection
    await sequelize.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testTables();