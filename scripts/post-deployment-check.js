// Post-Deployment Verification Script
// Run this script after deploying to verify the system is working correctly

const axios = require('axios');
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function postDeploymentCheck() {
  console.log('=== POST-DEPLOYMENT VERIFICATION ===\n');
  
  try {
    // 1. Check database connection and schema
    console.log('1. Checking database connection and schema...');
    
    let sequelize;
    
    // Use TiDB/MySQL configuration for production
    if (process.env.NODE_ENV === 'production' || process.env.DB_HOST) {
      sequelize = new Sequelize(
        process.env.DB_NAME || 'quodo3',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 4000,
          dialect: 'mysql',
          dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
              rejectUnauthorized: true,
            } : false,
          },
          logging: false,
          pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 10000
          }
        }
      );
    } else {
      // Use SQLite for development
      const path = require('path');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
      });
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('   ✅ Database connection: SUCCESS');
    
    // Check if required columns exist
    const isMySQL = sequelize.getDialect() === 'mysql';
    let currentColumns = [];
    
    if (isMySQL) {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
      `);
      currentColumns = results.map(row => row.COLUMN_NAME);
    } else {
      const [results] = await sequelize.query('PRAGMA table_info(users)');
      currentColumns = results.map(row => row.name);
    }
    
    const requiredColumns = ['bloodGroup', 'phoneNumber', 'bio'];
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('   ✅ All required user profile columns present');
    } else {
      console.log('   ❌ Missing columns:', missingColumns.join(', '));
      console.log('   💡 Run: npm run migrate');
      throw new Error('Missing required database columns');
    }
    
    await sequelize.close();
    
    // 2. Check if server is running (if local)
    if (!process.env.NODE_ENV === 'production') {
      console.log('\n2. Checking if server is running...');
      try {
        const response = await axios.get('http://localhost:5000/api/health');
        if (response.status === 200) {
          console.log('   ✅ Server is running');
        }
      } catch (error) {
        console.log('   ℹ️  Server check skipped (server may not be running locally)');
      }
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('✅ System is ready for use');
    console.log('\nNext steps:');
    console.log('1. Access your application at the deployed URL');
    console.log('2. Try logging in with your admin credentials');
    console.log('3. Verify that all new features work correctly');
    
  } catch (error) {
    console.error('\n=== VERIFICATION FAILED ===');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Ensure database migrations have been run: npm run migrate');
    console.log('2. Check database connection settings');
    console.log('3. Verify environment variables are set correctly');
    console.log('4. Check application logs for more details');
    process.exit(1);
  }
}

if (require.main === module) {
  postDeploymentCheck();
}

module.exports = postDeploymentCheck;