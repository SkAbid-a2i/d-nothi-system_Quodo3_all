const sequelize = require('./config/database');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function testUserLogin() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Test user login simulation
    console.log('\n🔍 Testing user login simulation...');
    
    // Test with admin user
    const username = 'admin';
    const password = 'admin123';
    
    console.log(`\nAttempting login for user: ${username}`);
    
    // Find user by username or email
    const user = await User.findOne({ 
      where: {
        [require('sequelize').Op.or]: [
          { username: username },
          { email: username }
        ],
        isActive: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found or inactive');
      return;
    }
    
    console.log('✅ User found in database');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Office: ${user.office}`);
    
    // Check password (in real app, we would use bcrypt.compare)
    // For this test, we'll just show that the user exists
    console.log('\n🔍 Password verification would happen here...');
    console.log('✅ Password verification passed (simulated)');
    
    // Create JWT token (simulating what happens in auth.routes.js)
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret_key_for_testing',
      { expiresIn: '1h' }
    );
    
    console.log('\n✅ JWT Token created successfully');
    console.log(`Token: ${token}`);
    
    // Decode token to verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_testing');
    console.log('\n✅ Token decoded successfully');
    console.log('Decoded token payload:');
    console.log(`  User ID: ${decoded.id}`);
    console.log(`  Username: ${decoded.username}`);
    console.log(`  Role: ${decoded.role}`);
    console.log(`  Expires at: ${new Date(decoded.exp * 1000)}`);
    
    // Test fetching user data with token (simulating /api/auth/me)
    console.log('\n🔍 Testing user data fetch with token...');
    const userFromToken = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (userFromToken) {
      console.log('✅ User data fetched successfully using token');
      console.log(`  Full Name: ${userFromToken.fullName}`);
      console.log(`  Email: ${userFromToken.email}`);
      console.log(`  Role: ${userFromToken.role}`);
      console.log(`  Active: ${userFromToken.isActive}`);
    }
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testUserLogin();