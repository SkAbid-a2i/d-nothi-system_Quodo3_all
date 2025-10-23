// Script to run migrations on production TiDB database
require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configure for TiDB production database
const sequelize = new Sequelize(
  process.env.DB_NAME || 'quodo3',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
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
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
      evict: 1000
    },
    timezone: '+00:00',
    benchmark: true,
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
  }
);

async function runProductionMigrations() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Production database connection established successfully.');

    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`SequelizeMeta\` (
        \`name\` VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY
      )
    `);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      process.exit(0);
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration files`);

    // Get already executed migrations
    const [executedMigrations] = await sequelize.query('SELECT `name` FROM `SequelizeMeta`');
    const executedMigrationNames = executedMigrations ? executedMigrations.map(m => m.name) : [];
    
    console.log(`Already executed ${executedMigrationNames.length} migrations`);

    // Run pending migrations
    let executedCount = 0;
    for (const migrationFile of migrationFiles) {
      if (executedMigrationNames.includes(migrationFile)) {
        console.log(`Migration ${migrationFile} already executed, skipping...`);
        continue;
      }
      
      console.log(`Running migration: ${migrationFile}`);
      const migration = require(path.join(migrationsDir, migrationFile));
      
      try {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        // Record migration as executed
        await sequelize.query('INSERT INTO `SequelizeMeta` (`name`) VALUES (?)', {
          replacements: [migrationFile]
        });
        console.log(`Migration ${migrationFile} completed successfully!`);
        executedCount++;
      } catch (error) {
        console.error(`Migration ${migrationFile} failed:`, error.message);
        console.error('Stack:', error.stack);
        // Stop on migration failure
        process.exit(1);
      }
    }

    console.log(`All migrations completed! ${executedCount} migrations were executed.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration process failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

runProductionMigrations();