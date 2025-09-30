require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function testAPI() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get the admin user
    const adminUser = await User.findOne({
      where: {
        username: 'admin'
      }
    });
    
    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    // Create a valid token
    const token = jwt.sign(
      { 
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    console.log('Generated token:', token);
    
    // Test getting all users
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    console.log('Users in database:', users.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPI();