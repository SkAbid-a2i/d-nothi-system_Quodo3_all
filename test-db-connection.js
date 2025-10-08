// Simple script to test database connection
const { Sequelize } = require('sequelize');

// Use the provided credentials
const sequelize = new Sequelize(
  'd_nothi_db',  // DB_NAME
  '4VmPGSU3EFyEhLJ.root',  // DB_USER
  'gWe9gfuhBBE50H1u',  // DB_PASSWORD
  {
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',  // DB_HOST
    port: 4000,  // DB_PORT
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+00:00'
  }
);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Simple query test passed:', results);
    
    await sequelize.close();
    console.log('🔒 Connection closed.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    if (error.parent) {
      console.error('Details:', error.parent.message);
    }
    
    try {
      await sequelize.close();
      console.log('🔒 Connection closed.');
    } catch (closeError) {
      console.error('❌ Error closing connection:', closeError.message);
    }
  }
}

// Run the test
testConnection();