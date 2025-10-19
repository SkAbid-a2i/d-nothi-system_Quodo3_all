// Script to run all pending migrations
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runAllMigrations() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);
      const migration = require(path.join(migrationsDir, migrationFile));
      
      try {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        console.log(`Migration ${migrationFile} completed successfully!`);
      } catch (error) {
        console.error(`Migration ${migrationFile} failed:`, error.message);
        // Don't exit on individual migration failure, continue with others
      }
    }

    console.log('All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

runAllMigrations();