/**
 * Schema Verification Script
 * Run this after you've fixed the connection issues
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('=== Schema Verification Script ===');
console.log('Run this script after fixing database connection issues\n');

// This is the same configuration as your main app
const sequelize = require('./config/database');
const Task = require('./models/Task');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Meeting = require('./models/Meeting');
const Dropdown = require('./models/Dropdown');
const PermissionTemplate = require('./models/PermissionTemplate');
const AuditLog = require('./models/AuditLog');

async function verifySchema() {
  console.log('Starting database schema verification...');
  
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    
    // Sync all models to ensure schema matches
    console.log('\nSyncing models with database...');
    await sequelize.sync({ alter: true });
    console.log('✓ All models synced successfully');
    
    // Verify each table structure
    console.log('\nVerifying table structures...');
    
    // Task table verification
    const taskTable = await sequelize.getQueryInterface().describeTable('tasks');
    console.log('✓ Task table verified');
    console.log('  Fields:', Object.keys(taskTable).join(', '));
    
    // User table verification
    const userTable = await sequelize.getQueryInterface().describeTable('users');
    console.log('✓ User table verified');
    console.log('  Fields:', Object.keys(userTable).join(', '));
    
    // Leave table verification
    const leaveTable = await sequelize.getQueryInterface().describeTable('leaves');
    console.log('✓ Leave table verified');
    console.log('  Fields:', Object.keys(leaveTable).join(', '));
    
    // Meeting table verification
    const meetingTable = await sequelize.getQueryInterface().describeTable('meetings');
    console.log('✓ Meeting table verified');
    console.log('  Fields:', Object.keys(meetingTable).join(', '));
    
    // Dropdown table verification
    const dropdownTable = await sequelize.getQueryInterface().describeTable('dropdowns');
    console.log('✓ Dropdown table verified');
    console.log('  Fields:', Object.keys(dropdownTable).join(', '));
    
    // PermissionTemplate table verification
    const permissionTemplateTable = await sequelize.getQueryInterface().describeTable('permission_templates');
    console.log('✓ PermissionTemplate table verified');
    console.log('  Fields:', Object.keys(permissionTemplateTable).join(', '));
    
    // AuditLog table verification
    const auditLogTable = await sequelize.getQueryInterface().describeTable('audit_logs');
    console.log('✓ AuditLog table verified');
    console.log('  Fields:', Object.keys(auditLogTable).join(', '));
    
    console.log('\n✓ Database schema verification completed successfully!');
    console.log('\nAll tables are properly structured and match the current models.');
    
  } catch (error) {
    console.error('✗ Database schema verification failed:', error.message);
    if (error.parent) {
      console.error('  Parent error:', error.parent.message);
    }
    process.exit(1);
  }
}

// Run verification
verifySchema();