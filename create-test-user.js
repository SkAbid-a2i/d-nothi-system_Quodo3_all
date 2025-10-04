require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function createTestUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Create test agent user
    const agentUser = await User.create({
      username: 'agent',
      email: 'agent@example.com',
      password: 'agent123',
      fullName: 'Test Agent',
      role: 'Agent',
      office: 'Head Office',
      isActive: true
    });
    
    console.log('Test agent user created successfully');
    console.log('Username: agent');
    console.log('Password: agent123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();