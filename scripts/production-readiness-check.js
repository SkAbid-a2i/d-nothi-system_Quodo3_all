// Production readiness check script
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('=== PRODUCTION READINESS CHECK ===\n');

async function productionReadinessCheck() {
  console.log('Environment Variables Check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- FRONTEND_URL_3:', process.env.FRONTEND_URL_3);
  console.log('');

  try {
    // Create sequelize instance similar to production
    let sequelize;
    if (process.env.NODE_ENV === 'production' || process.env.DB_HOST) {
      console.log('🔧 Using MySQL/TiDB configuration for production');
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
      console.log('🔧 Using SQLite for development');
      const path = require('path');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
      });
    }

    // Test connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Check if users table exists
    console.log('🔍 Checking if users table exists...');
    const isMySQL = sequelize.getDialect() === 'mysql';
    let tableExists = false;

    if (isMySQL) {
      const [results] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
      `);
      tableExists = results[0].count > 0;
    } else {
      const [results] = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      );
      tableExists = results.length > 0;
    }

    if (tableExists) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table does not exist - needs migration');
    }

    // Close connection
    await sequelize.close();

    console.log('\n=== CHECK COMPLETE ===');
    console.log('💡 For production deployment:');
    console.log('   - Ensure database migrations are run before starting server');
    console.log('   - Verify environment variables are set correctly');
    console.log('   - Check that all required tables exist');

    return tableExists;

  } catch (error) {
    console.error('❌ Production readiness check failed:', error.message);
    return false;
  }
}

// Run the check
if (require.main === module) {
  productionReadinessCheck()
    .then(success => {
      if (success) {
        console.log('\n🎉 Application is ready for production');
        process.exit(0);
      } else {
        console.log('\n⚠️  Application needs setup before production');
        process.exit(1);
      }
    });
}

module.exports = productionReadinessCheck;