const sequelize = require('../config/database');

async function addOfficeToLeaves() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Add office column to leaves table
    console.log('\n🔍 Adding office column to leaves table...');
    
    // Using raw SQL query to add the column
    await sequelize.query(`
      ALTER TABLE leaves 
      ADD COLUMN office VARCHAR(255) NULL AFTER userName
    `);
    
    console.log('✅ Office column added successfully to leaves table');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
addOfficeToLeaves();