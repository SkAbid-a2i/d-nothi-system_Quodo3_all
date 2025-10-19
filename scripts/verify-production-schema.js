// Production Schema Verification Script
// This script verifies that the production database has all required columns

const { Sequelize } = require('sequelize');
require('dotenv').config();

async function verifyProductionSchema() {
  console.log('=== PRODUCTION DATABASE SCHEMA VERIFICATION ===\n');
  
  // Check if we're in production environment
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST;
  
  if (!isProduction) {
    console.log('⚠️  Warning: This script is intended for production environments');
    console.log('Current environment: Development/Local\n');
  }
  
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
    
    // Check users table schema
    console.log('🔍 Checking users table schema...\n');
    
    let currentColumns = [];
    
    if (isMySQL) {
      // For MySQL/TiDB
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
      `);
      currentColumns = results;
    } else {
      // For SQLite
      const [results] = await sequelize.query('PRAGMA table_info(users)');
      currentColumns = results.map(row => ({
        COLUMN_NAME: row.name,
        DATA_TYPE: row.type,
        IS_NULLABLE: row.notnull ? 'NO' : 'YES'
      }));
    }
    
    console.log('📋 Users table columns:');
    currentColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Required columns for users table
    const requiredUserColumns = [
      { name: 'id', type: 'INTEGER' },
      { name: 'username', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
      { name: 'password', type: 'VARCHAR' },
      { name: 'fullName', type: 'VARCHAR' },
      { name: 'role', type: 'TEXT' },
      { name: 'isActive', type: 'BOOLEAN' },
      { name: 'storageQuota', type: 'INTEGER' },
      { name: 'usedStorage', type: 'INTEGER' },
      { name: 'office', type: 'VARCHAR' },
      { name: 'bloodGroup', type: 'VARCHAR' },
      { name: 'phoneNumber', type: 'VARCHAR' },
      { name: 'bio', type: 'TEXT' },
      { name: 'createdAt', type: 'DATETIME' },
      { name: 'updatedAt', type: 'DATETIME' }
    ];
    
    console.log('\n✅ Required columns check:');
    let allRequiredColumnsPresent = true;
    
    for (const requiredCol of requiredUserColumns) {
      const foundCol = currentColumns.find(col => 
        col.COLUMN_NAME.toLowerCase() === requiredCol.name.toLowerCase()
      );
      
      if (foundCol) {
        console.log(`   ✅ ${requiredCol.name}: Present`);
      } else {
        console.log(`   ❌ ${requiredCol.name}: Missing`);
        allRequiredColumnsPresent = false;
      }
    }
    
    if (allRequiredColumnsPresent) {
      console.log('\n🎉 All required columns are present in the users table!');
    } else {
      console.log('\n⚠️  Some required columns are missing.');
      console.log('💡 Run: npm run migrate');
    }
    
    // Check other important tables
    console.log('\n🔍 Checking other important tables...');
    
    const tablesToCheck = [
      { name: 'tasks', requiredColumns: ['id', 'date', 'source', 'category', 'service', 'userId', 'userName', 'office', 'description', 'status', 'userInformation'] },
      { name: 'leaves', requiredColumns: ['id', 'userId', 'userName', 'startDate', 'endDate', 'reason', 'status', 'office'] },
      { name: 'meetings', requiredColumns: ['id', 'subject', 'platform', 'location', 'date', 'time', 'duration', 'createdBy', 'selectedUserIds'] },
      { name: 'collaborations', requiredColumns: ['id', 'title', 'description', 'availability', 'urgency', 'createdBy'] }
    ];
    
    for (const table of tablesToCheck) {
      try {
        console.log(`\n📋 ${table.name} table:`);
        
        let tableColumns = [];
        if (isMySQL) {
          const [results] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '${table.name}'
          `);
          tableColumns = results.map(r => r.COLUMN_NAME);
        } else {
          const [results] = await sequelize.query(`PRAGMA table_info(${table.name})`);
          tableColumns = results.map(r => r.name);
        }
        
        console.log(`   Columns: ${tableColumns.length}`);
        
        let allTableColumnsPresent = true;
        for (const requiredCol of table.requiredColumns) {
          if (!tableColumns.includes(requiredCol)) {
            console.log(`   ❌ Missing: ${requiredCol}`);
            allTableColumnsPresent = false;
          }
        }
        
        if (allTableColumnsPresent) {
          console.log(`   ✅ All required columns present`);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Table not found or error accessing: ${error.message}`);
      }
    }
    
    await sequelize.close();
    
    console.log('\n=== SCHEMA VERIFICATION COMPLETE ===');
    
    if (allRequiredColumnsPresent) {
      console.log('✅ Database schema is ready for production use');
    } else {
      console.log('❌ Database schema needs to be updated');
      console.log('💡 Run migrations: npm run migrate');
    }
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  verifyProductionSchema();
}

module.exports = verifyProductionSchema;