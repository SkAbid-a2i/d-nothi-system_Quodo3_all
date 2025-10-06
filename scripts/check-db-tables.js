const sequelize = require('../config/database');

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables...\n');
  
  const requiredTables = [
    'users',
    'tasks',
    'leaves',
    'dropdowns',
    'permission_templates',
    'audit_logs'
  ];
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Get list of all tables
    const queryInterface = sequelize.getQueryInterface();
    const allTables = await queryInterface.showAllSchemas();
    
    console.log('📋 Checking for required tables:');
    
    for (const table of requiredTables) {
      try {
        // Try to describe the table structure
        await queryInterface.describeTable(table);
        console.log(`✅ ${table} - EXISTS`);
      } catch (error) {
        console.log(`❌ ${table} - MISSING`);
      }
    }
    
    console.log('\n📊 Table Data Check:');
    
    // Check data in each table
    for (const table of requiredTables) {
      try {
        const model = require(`../models/${table.charAt(0).toUpperCase() + table.slice(1).replace(/s$/, '')}`);
        const count = await model.count();
        console.log(`📊 ${table} - ${count} records`);
      } catch (error) {
        console.log(`⚠️  ${table} - Could not count records: ${error.message}`);
      }
    }
    
    await sequelize.close();
    console.log('\n✅ Database table check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkDatabaseTables();