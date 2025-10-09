require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Testing database connection with explicit dotenv loading...');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'd_nothi_db',
  process.env.DB_USER || '4VmPGSU3EFyEhLJ.root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: process.env.DB_SSL === 'true' ? true : false,
      },
      connectTimeout: 60000
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Simple query test passed:', results);
    
    await sequelize.close();
    console.log('✅ Connection closed successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
  }
}

testConnection();