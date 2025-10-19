// Database Schema Checker
// This script checks the current database schema and reports any missing columns

const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkDatabaseSchema() {
  console.log('=== DATABASE SCHEMA CHECKER ===\n');
  
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
    
    // Check users table
    console.log('🔍 Checking users table...');
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
    
    console.log('📋 Current users table columns:');
    currentColumns.forEach(col => console.log(`   - ${col}`));
    
    // Required columns
    const requiredColumns = [
      'id', 'username', 'email', 'password', 'fullName', 'role', 'isActive', 
      'storageQuota', 'usedStorage', 'office', 'bloodGroup', 'phoneNumber', 'bio', 
      'createdAt', 'updatedAt'
    ];
    
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    const extraColumns = currentColumns.filter(col => !requiredColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('\n✅ All required columns are present in users table');
    } else {
      console.log('\n❌ Missing required columns:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
    }
    
    if (extraColumns.length > 0) {
      console.log('\nℹ️  Additional columns found:');
      extraColumns.forEach(col => console.log(`   - ${col}`));
    }
    
    // Check other important tables
    console.log('\n🔍 Checking other important tables...');
    
    const tablesToCheck = ['tasks', 'leaves', 'meetings', 'collaborations', 'dropdowns'];
    
    for (const table of tablesToCheck) {
      try {
        if (isMySQL) {
          const [results] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '${table}'
          `);
          console.log(`   ${table}: ${results.length} columns`);
        } else {
          const [results] = await sequelize.query(`PRAGMA table_info(${table})`);
          console.log(`   ${table}: ${results.length} columns`);
        }
      } catch (error) {
        console.log(`   ${table}: Table not found or error accessing`);
      }
    }
    
    await sequelize.close();
    
    console.log('\n=== SCHEMA CHECK COMPLETE ===');
    
    if (missingColumns.length > 0) {
      console.log('\n🔧 To fix missing columns, run:');
      console.log('   npm run migrate');
      console.log('   or');
      console.log('   npm run migrate:production');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  checkDatabaseSchema();
}

module.exports = checkDatabaseSchema;