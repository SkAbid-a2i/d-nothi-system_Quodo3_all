// Script to apply database schema fixes directly using the provided credentials
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use the provided credentials
const sequelize = new Sequelize(
  'd_nothi_db',  // DB_NAME (using the correct name with underscore)
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
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
      evict: 1000
    },
    retry: {
      max: 5,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EPIPE/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /AccessDenied/,
        /ER_ACCESS_DENIED_ERROR/
      ]
    },
    timezone: '+00:00',
    benchmark: true,
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
  }
);

async function applyDatabaseFixes() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Apply the schema fixes
    console.log('\n🔧 Applying database schema fixes...');
    
    // Fix null constraints for columns that should allow NULL
    console.log('1. Fixing null constraints...');
    await sequelize.query(`
      ALTER TABLE tasks MODIFY source varchar(255) NULL DEFAULT ''
    `);
    console.log('✅ Fixed source column');
    
    await sequelize.query(`
      ALTER TABLE tasks MODIFY category varchar(255) NULL DEFAULT ''
    `);
    console.log('✅ Fixed category column');
    
    await sequelize.query(`
      ALTER TABLE tasks MODIFY service varchar(255) NULL DEFAULT ''
    `);
    console.log('✅ Fixed service column');
    
    await sequelize.query(`
      ALTER TABLE tasks MODIFY office varchar(255) NULL
    `);
    console.log('✅ Fixed office column');
    
    // Add missing userInformation column
    console.log('2. Adding userInformation column...');
    try {
      await sequelize.query(`
        ALTER TABLE tasks ADD COLUMN userInformation TEXT NULL
      `);
      console.log('✅ Added userInformation column');
    } catch (error) {
      // Column might already exist
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  userInformation column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ All database schema fixes applied successfully!');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error applying database fixes:', error.message);
    
    // Try to close connection even if there was an error
    try {
      await sequelize.close();
      console.log('🔒 Database connection closed.');
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError.message);
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  applyDatabaseFixes();
}

module.exports = applyDatabaseFixes;