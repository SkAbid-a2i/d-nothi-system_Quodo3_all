const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Check tasks table schema
    const tasksColumns = await sequelize.query(
      "PRAGMA table_info(tasks)",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Tasks table columns:');
    tasksColumns.forEach(column => {
      console.log(`  ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : 'NULL'} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
    });
    
    // Check users table schema
    const usersColumns = await sequelize.query(
      "PRAGMA table_info(users)",
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nUsers table columns:');
    usersColumns.forEach(column => {
      console.log(`  ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : 'NULL'} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();