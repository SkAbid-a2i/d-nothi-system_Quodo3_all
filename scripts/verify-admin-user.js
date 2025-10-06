const sequelize = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function verifyAdminUser() {
  console.log('🔍 Verifying admin user...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Check if admin user exists
    const adminUser = await User.findOne({
      where: {
        username: 'admin'
      }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Full Name: ${adminUser.fullName}`);
      console.log(`   Active: ${adminUser.isActive}`);
    } else {
      console.log('❌ Admin user not found');
      console.log('\n🔧 Creating admin user...');
      
      // Create admin user
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'SystemAdmin',
        isActive: true
      });
      
      console.log('✅ Admin user created successfully:');
      console.log(`   Username: ${newAdmin.username}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Email: ${newAdmin.email}`);
    }
    
    // Check total number of users
    const userCount = await User.count();
    console.log(`\n📊 Total users in system: ${userCount}`);
    
    await sequelize.close();
    console.log('\n✅ Admin user verification completed');
    
  } catch (error) {
    console.error('❌ Admin user verification failed:', error.message);
    process.exit(1);
  }
}

verifyAdminUser();