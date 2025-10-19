// Script to run all pending migrations using Sequelize CLI approach
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

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
    const executedMigrationNames = executedMigrations.map(m => m.name);
    
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

runMigrations();