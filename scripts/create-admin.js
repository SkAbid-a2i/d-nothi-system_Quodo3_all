require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: {
        role: 'SystemAdmin'
      }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
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
    
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();