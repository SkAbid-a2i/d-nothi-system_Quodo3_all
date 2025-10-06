require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function createAdminUser() {
  try {
    console.log('Attempting to connect to database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Role: SystemAdmin');
      process.exit(0);
    }
    
    console.log('Creating admin user...');
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'SystemAdmin',
      office: 'Head Office',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: SystemAdmin');
    console.log('Note: Password is automatically hashed for security');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('Access denied')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check database credentials in .env file');
      console.log('2. Verify user has proper permissions');
      console.log('3. Confirm database is accessible from this IP');
      console.log('4. Check TiDB Cloud console for cluster status');
    }
    
    process.exit(1);
  }
}

// Run the function
createAdminUser();