// Test script to verify CRUD operations for all models
const User = require('./models/User');
const Task = require('./models/Task');
const Leave = require('./models/Leave');
const Dropdown = require('./models/Dropdown');
const sequelize = require('./config/database');

async function testCRUDOperations() {
  try {
    console.log('Testing CRUD operations for all models...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Test 1: User CRUD operations
    console.log('=== Testing User CRUD Operations ===');
    
    // Create
    const timestamp = Date.now();
    const userData = {
      username: `crud_test_user_${timestamp}`,
      email: `crud_test_${timestamp}@example.com`,
      password: 'password123',
      fullName: 'CRUD Test User',
      role: 'Agent',
      office: 'Test Office'
    };
    
    const user = await User.create(userData);
    console.log('✅ User created:', user.id);
    
    // Read
    const foundUser = await User.findByPk(user.id);
    console.log('✅ User read:', foundUser ? 'Success' : 'Failed');
    
    // Update
    const updatedUser = await User.update(
      { fullName: 'Updated CRUD Test User' },
      { where: { id: user.id } }
    );
    console.log('✅ User updated:', updatedUser[0] > 0 ? 'Success' : 'Failed');
    
    // Delete
    const deletedUser = await User.destroy({ where: { id: user.id } });
    console.log('✅ User deleted:', deletedUser > 0 ? 'Success' : 'Failed');
    
    // Test 2: Task CRUD operations
    console.log('\n=== Testing Task CRUD Operations ===');
    
    // Create a temporary user for task testing
    const tempUser = await User.create({
      username: `temp_user_${timestamp}`,
      email: `temp_${timestamp}@example.com`,
      password: 'password123',
      fullName: 'Temp User',
      role: 'Agent',
      office: 'Test Office'
    });
    
    const taskData = {
      date: new Date(),
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      userId: tempUser.id,
      userName: tempUser.fullName,
      office: tempUser.office,
      description: 'CRUD test task'
    };
    
    const task = await Task.create(taskData);
    console.log('✅ Task created:', task.id);
    
    // Read
    const foundTask = await Task.findByPk(task.id);
    console.log('✅ Task read:', foundTask ? 'Success' : 'Failed');
    
    // Update
    const updatedTask = await Task.update(
      { description: 'Updated CRUD test task' },
      { where: { id: task.id } }
    );
    console.log('✅ Task updated:', updatedTask[0] > 0 ? 'Success' : 'Failed');
    
    // Delete
    const deletedTask = await Task.destroy({ where: { id: task.id } });
    console.log('✅ Task deleted:', deletedTask > 0 ? 'Success' : 'Failed');
    
    // Clean up temp user
    await User.destroy({ where: { id: tempUser.id } });
    
    // Test 3: Leave CRUD operations
    console.log('\n=== Testing Leave CRUD Operations ===');
    
    // Create another temporary user for leave testing
    const tempUser2 = await User.create({
      username: `temp_user2_${timestamp}`,
      email: `temp2_${timestamp}@example.com`,
      password: 'password123',
      fullName: 'Temp User 2',
      role: 'Agent',
      office: 'Test Office'
    });
    
    const leaveData = {
      userId: tempUser2.id,
      userName: tempUser2.fullName,
      office: tempUser2.office,
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-12'),
      reason: 'CRUD test leave'
    };
    
    const leave = await Leave.create(leaveData);
    console.log('✅ Leave created:', leave.id);
    
    // Read
    const foundLeave = await Leave.findByPk(leave.id);
    console.log('✅ Leave read:', foundLeave ? 'Success' : 'Failed');
    
    // Update
    const updatedLeave = await Leave.update(
      { reason: 'Updated CRUD test leave' },
      { where: { id: leave.id } }
    );
    console.log('✅ Leave updated:', updatedLeave[0] > 0 ? 'Success' : 'Failed');
    
    // Delete
    const deletedLeave = await Leave.destroy({ where: { id: leave.id } });
    console.log('✅ Leave deleted:', deletedLeave > 0 ? 'Success' : 'Failed');
    
    // Clean up temp user
    await User.destroy({ where: { id: tempUser2.id } });
    
    // Test 4: Dropdown CRUD operations
    console.log('\n=== Testing Dropdown CRUD Operations ===');
    
    const dropdownData = {
      type: 'Category',
      value: `CRUD Test Category ${timestamp}`,
      createdBy: 1 // SystemAdmin user ID
    };
    
    const dropdown = await Dropdown.create(dropdownData);
    console.log('✅ Dropdown created:', dropdown.id);
    
    // Read
    const foundDropdown = await Dropdown.findByPk(dropdown.id);
    console.log('✅ Dropdown read:', foundDropdown ? 'Success' : 'Failed');
    
    // Update
    const updatedDropdown = await Dropdown.update(
      { value: `Updated CRUD Test Category ${timestamp}` },
      { where: { id: dropdown.id } }
    );
    console.log('✅ Dropdown updated:', updatedDropdown[0] > 0 ? 'Success' : 'Failed');
    
    // Delete (soft delete - set isActive to false)
    const deletedDropdown = await Dropdown.update(
      { isActive: false },
      { where: { id: dropdown.id } }
    );
    console.log('✅ Dropdown deleted (soft delete):', deletedDropdown[0] > 0 ? 'Success' : 'Failed');
    
    console.log('\n🎉 All CRUD operation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing CRUD operations:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
  }
}

testCRUDOperations();