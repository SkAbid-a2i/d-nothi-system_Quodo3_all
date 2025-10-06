require('dotenv').config();
const sequelize = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    // Don't log password for security
    
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 + 1 AS solution');
    console.log('✅ Query test successful:', results[0].solution);
    
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    if (error.parent) {
      console.error('❌ Detailed error:', error.parent.message);
    }
  }
}

testConnection();