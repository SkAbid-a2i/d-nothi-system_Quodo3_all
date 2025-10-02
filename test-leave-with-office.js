const sequelize = require('./config/database');
const Leave = require('./models/Leave');

async function testLeaveWithOffice() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Try to create a test leave with office field
    console.log('\n🔍 Testing leave creation with office field...');
    const testLeave = await Leave.create({
      userId: 1,
      userName: 'Test User',
      office: 'Test Office',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // Tomorrow
      reason: 'Test leave request'
    });
    
    console.log('✅ Leave created successfully');
    console.log(`  ID: ${testLeave.id}`);
    console.log(`  Office: ${testLeave.office}`);
    console.log(`  User ID: ${testLeave.userId}`);
    console.log(`  User Name: ${testLeave.userName}`);
    console.log(`  Start Date: ${testLeave.startDate}`);
    console.log(`  End Date: ${testLeave.endDate}`);
    console.log(`  Reason: ${testLeave.reason}`);
    
    // Test querying the leave
    console.log('\n🔍 Testing leave query...');
    const foundLeave = await Leave.findByPk(testLeave.id);
    if (foundLeave) {
      console.log('✅ Leave found successfully');
      console.log(`  Office: ${foundLeave.office}`);
    } else {
      console.log('❌ Leave not found');
    }
    
    // Clean up - delete the test leave
    await testLeave.destroy();
    console.log('✅ Test leave cleaned up');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testLeaveWithOffice();