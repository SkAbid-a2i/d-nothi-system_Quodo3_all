const sequelize = require('./config/database');
const User = require('./models/User');

async function checkUsers() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Get all users
    const users = await User.findAll();
    
    console.log(`\nFound ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`\nID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: ${user.fullName}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
    });
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkUsers();