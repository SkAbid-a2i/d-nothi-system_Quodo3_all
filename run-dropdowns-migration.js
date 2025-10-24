// Script to specifically run the dropdowns migration
const { Sequelize } = require('sequelize');
const path = require('path');

async function runDropdownsMigration() {
  let sequelize;
  
  try {
    console.log('=== RUNNING DROPDOWNS MIGRATION ===\n');
    
    // Load environment variables
    require('dotenv').config();
    
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
          logging: console.log,
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
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: console.log
      });
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully\n');
    
    // Load the dropdowns migration
    const migrationFile = '2025102401-add-obligation-to-dropdowns.js';
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    console.log(`🔧 Loading migration: ${migrationFile}`);
    
    const migration = require(migrationPath);
    
    // Run the migration
    console.log('🚀 Running migration...');
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✅ Migration completed successfully!');
    
    // Test creating an Obligation value
    console.log('\n🧪 Testing Obligation creation...');
    const Dropdown = require('./models/Dropdown');
    
    // Temporarily set sequelize instance
    Dropdown.sequelize = sequelize;
    
    try {
      const testDropdown = await Dropdown.create({
        type: 'Obligation',
        value: 'Test Obligation Migration',
        isActive: true,
        createdBy: 1
      });
      
      console.log('✅ Test Obligation created successfully:', testDropdown.toJSON());
      
      // Clean up
      await testDropdown.destroy();
      console.log('🧹 Test Obligation cleaned up');
    } catch (testError) {
      console.error('❌ Error testing Obligation creation:', testError.message);
      if (testError.parent) {
        console.error('Parent error:', testError.parent.message);
        console.error('SQL:', testError.parent.sql);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
      console.error('SQL:', error.parent.sql);
    }
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the migration
if (require.main === module) {
  runDropdownsMigration()
    .then(() => {
      console.log('\n=== DROPDOWNS MIGRATION COMPLETED SUCCESSFULLY ===');
      process.exit(0);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = runDropdownsMigration;