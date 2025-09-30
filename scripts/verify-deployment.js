/**
 * Script to verify deployment setup
 * This script checks if all required environment variables are set
 * and if the database connection is working
 */

require('dotenv').config();
const sequelize = require('../config/database');

async function verifyDeployment() {
  console.log('🔍 Verifying deployment setup...\n');
  
  // Check required environment variables
  const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  let allEnvVarsPresent = true;
  
  console.log('🔑 Checking environment variables...');
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: Set`);
    } else {
      console.log(`  ❌ ${envVar}: Missing`);
      allEnvVarsPresent = false;
    }
  }
  
  if (!allEnvVarsPresent) {
    console.log('\n⚠️  Some environment variables are missing. Please set them before deployment.');
    process.exit(1);
  }
  
  console.log('\n🔌 Testing database connection...');
  
  try {
    await sequelize.authenticate();
    console.log('  ✅ Database connection successful');
    
    console.log('\n📊 Testing database synchronization...');
    await sequelize.sync({ dry: true }); // Dry run to check if models are valid
    console.log('  ✅ Database models are valid');
    
    console.log('\n🎉 Deployment verification completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Deploy backend to Render');
    console.log('  2. Deploy frontend to Netlify');
    console.log('  3. Create initial admin user with: node scripts/create-admin.js');
    
  } catch (error) {
    console.error('  ❌ Database connection failed:', error.message);
    console.log('\n⚠️  Please check your database configuration.');
    process.exit(1);
  }
}

// Run the verification
verifyDeployment();