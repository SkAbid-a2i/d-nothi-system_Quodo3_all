require('dotenv').config();
const sequelize = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();