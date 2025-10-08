// Test script to verify all TiDB functionality
const User = require('./models/User');
const Task = require('./models/Task');
const Leave = require('./models/Leave');
const Dropdown = require('./models/Dropdown');
const sequelize = require('./config/database');

async function testAllFunctionality() {
  try {
    console.log('Testing TiDB functionality...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test user creation with unique username
    const timestamp = Date.now();
    const user = await User.create({
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'password123',
      fullName: 'Test User',
      role: 'Agent'
    });
    console.log('✅ User creation successful:', user.id);
    
    // Test task creation
    const task = await Task.create({
      date: new Date(),
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      userId: user.id,
      userName: user.fullName,
      description: 'Test task for functionality verification'
    });
    console.log('✅ Task creation successful:', task.id);
    
    // Test leave creation
    const leave = await Leave.create({
      userId: user.id,
      userName: user.fullName,
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-12'),
      reason: 'Medical leave'
    });
    console.log('✅ Leave creation successful:', leave.id);
    
    // Test dropdown creation
    const dropdown = await Dropdown.create({
      type: 'Category',
      value: `HR_${timestamp}`
    });
    console.log('✅ Dropdown creation successful:', dropdown.id);
    
    // Test data retrieval
    const users = await User.findAll();
    console.log('✅ User retrieval successful:', users.length, 'users found');
    
    const tasks = await Task.findAll();
    console.log('✅ Task retrieval successful:', tasks.length, 'tasks found');
    
    const leaves = await Leave.findAll();
    console.log('✅ Leave retrieval successful:', leaves.length, 'leaves found');
    
    const dropdowns = await Dropdown.findAll();
    console.log('✅ Dropdown retrieval successful:', dropdowns.length, 'dropdowns found');
    
    console.log('\n🎉 All TiDB functionality tests passed!');
    console.log('The application is ready to work with TiDB database.');
    
  } catch (error) {
    console.error('❌ Error testing functionality:', error);
  }
}

testAllFunctionality();