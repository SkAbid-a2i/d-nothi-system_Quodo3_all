const sequelize = require('./config/database');
const User = require('./models/User');

async function testDatabaseConnection() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Test fetching users
    console.log('\n🔍 Fetching users from database...');
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Exclude password field
      limit: 5 // Limit to 5 users for testing
    });
    
    console.log(`\n✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Full Name: ${user.fullName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Office: ${user.office}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Created At: ${user.createdAt}`);
    });
    
    // Test finding a specific user
    console.log('\n🔍 Testing user lookup by username...');
    const adminUser = await User.findOne({
      where: { username: 'admin' },
      attributes: { exclude: ['password'] }
    });
    
    if (adminUser) {
      console.log('\n✅ Found admin user:');
      console.log(`  ID: ${adminUser.id}`);
      console.log(`  Username: ${adminUser.username}`);
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Role: ${adminUser.role}`);
    } else {
      console.log('❌ Admin user not found');
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
testDatabaseConnection();