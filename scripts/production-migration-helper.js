// Production Migration Helper Script
// This script helps run migrations in production environments
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('=== PRODUCTION MIGRATION HELPER ===\n');

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST;

if (!isProduction) {
  console.log('⚠️  Warning: This script is intended for production environments');
  console.log('Current environment: Development/Local\n');
}

// Database configuration
console.log('Database Configuration Check:');
console.log('- Host:', process.env.DB_HOST || 'Not set (using SQLite for development)');
console.log('- Port:', process.env.DB_PORT || '4000 (default)');
console.log('- User:', process.env.DB_USER || 'root (default)');
console.log('- Database:', process.env.DB_NAME || 'quodo3 (default)');
console.log('- SSL Enabled:', process.env.DB_SSL === 'true' ? 'Yes' : 'No');
console.log('');

// Function to add missing columns if they don't exist
async function addMissingColumns() {
  let sequelize;
  
  try {
    // Use TiDB/MySQL configuration for production
    if (process.env.NODE_ENV === 'production' || process.env.DB_HOST) {
      console.log('🔧 Using MySQL/TiDB database configuration');
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
      console.log('🔧 Using SQLite for development');
      const path = require('path');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
      });
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully\n');
    
    // Check if we're using MySQL/TiDB or SQLite
    const isMySQL = sequelize.getDialect() === 'mysql';
    console.log(`📊 Database dialect: ${sequelize.getDialect()}`);
    
    // Check current columns in users table
    console.log('🔍 Checking current columns in users table...');
    let currentColumns = [];
    
    if (isMySQL) {
      // For MySQL/TiDB
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
      `);
      currentColumns = results.map(row => row.COLUMN_NAME);
    } else {
      // For SQLite
      const [results] = await sequelize.query('PRAGMA table_info(users)');
      currentColumns = results.map(row => row.name);
    }
    
    console.log('📋 Current columns:', currentColumns.join(', '));
    
    // Required columns
    const requiredColumns = ['bloodGroup', 'phoneNumber', 'bio'];
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns are present');
      return true;
    }
    
    console.log('❌ Missing columns:', missingColumns.join(', '));
    console.log('\n🔧 Adding missing columns...\n');
    
    // Add missing columns
    for (const column of missingColumns) {
      try {
        let sql = '';
        if (column === 'bloodGroup') {
          sql = isMySQL 
            ? 'ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10) DEFAULT NULL' 
            : 'ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10)';
        } else if (column === 'phoneNumber') {
          sql = isMySQL 
            ? 'ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20) DEFAULT NULL' 
            : 'ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20)';
        } else if (column === 'bio') {
          sql = isMySQL 
            ? 'ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL' 
            : 'ALTER TABLE users ADD COLUMN bio TEXT';
        }
        
        if (sql) {
          console.log(`   Adding ${column}...`);
          await sequelize.query(sql);
          console.log(`   ✅ ${column} added successfully`);
        }
      } catch (error) {
        console.log(`   ℹ️  ${column} might already exist or there was an error:`, error.message);
      }
    }
    
    console.log('\n✅ Migration helper completed successfully!');
    console.log('🔄 Please restart your application for changes to take effect');
    return true;
    
  } catch (error) {
    console.error('❌ Migration helper failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the migration helper
if (require.main === module) {
  addMissingColumns()
    .then(success => {
      if (success) {
        console.log('\n=== PROCESS COMPLETED SUCCESSFULLY ===');
        process.exit(0);
      } else {
        console.log('\n=== PROCESS FAILED ===');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = addMissingColumns;