// Script to run a specific migration
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get migration file from command line argument
    const migrationName = process.argv[2];
    if (!migrationName) {
      console.error('Please provide a migration file name as an argument');
      console.log('Usage: node run-migration.js <migration-file-name>');
      process.exit(1);
    }

    // Check if migration file exists
    const migrationPath = path.join(__dirname, '../migrations', migrationName);
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    // Load migration
    const migration = require(migrationPath);
    
    // Run migration
    console.log(`Running migration: ${migrationName}`);
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();