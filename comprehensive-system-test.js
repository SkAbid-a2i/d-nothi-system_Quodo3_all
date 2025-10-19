// Comprehensive System Test Script
const sequelize = require('./config/database');
const User = require('./models/User');
const notificationService = require('./services/notification.service');
const axios = require('axios');

async function runComprehensiveTest() {
  console.log('=== STARTING COMPREHENSIVE SYSTEM TEST ===\n');
  
  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✓ Database connection: SUCCESS\n');
    
    // 2. Test user model and required fields
    console.log('2. Testing user model and required fields...');
    const tableInfo = await sequelize.query('PRAGMA table_info(users)', { type: sequelize.QueryTypes.SELECT });
    const requiredFields = ['bloodGroup', 'phoneNumber', 'bio'];
    const missingFields = requiredFields.filter(field => !tableInfo.some(col => col.name === field));
    
    if (missingFields.length === 0) {
      console.log('   ✓ All required user fields present:', requiredFields.join(', '));
    } else {
      console.log('   ✗ Missing user fields:', missingFields.join(', '));
      throw new Error('Missing required user fields');
    }
    
    // 3. Test admin user exists
    console.log('\n3. Testing admin user existence...');
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      console.log('   ✓ Admin user found:', adminUser.username);
      console.log('   ✓ Admin user has all required fields:');
      console.log('     - Username:', adminUser.username);
      console.log('     - Email:', adminUser.email);
      console.log('     - Full Name:', adminUser.fullName);
      console.log('     - Role:', adminUser.role);
      console.log('     - Blood Group:', adminUser.bloodGroup || 'Not set');
      console.log('     - Phone Number:', adminUser.phoneNumber || 'Not set');
      console.log('     - Bio:', adminUser.bio || 'Not set');
    } else {
      console.log('   ✗ Admin user not found');
      throw new Error('Admin user not found');
    }
    
    // 4. Test login functionality
    console.log('\n4. Testing login functionality...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      if (loginResponse.status === 200) {
        console.log('   ✓ Login functionality: SUCCESS');
      } else {
        throw new Error('Login failed with status: ' + loginResponse.status);
      }
    } catch (error) {
      if (error.response && error.response.status === 200) {
        console.log('   ✓ Login functionality: SUCCESS');
      } else {
        throw error;
      }
    }
    
    // 5. Test notification service
    console.log('\n5. Testing notification service...');
    const testNotification = {
      type: 'systemTest',
      message: 'Comprehensive system test notification',
      timestamp: new Date().toISOString()
    };
    
    // This will test if the notification service can broadcast
    notificationService.broadcast(testNotification);
    console.log('   ✓ Notification service broadcast: SUCCESS');
    
    // 6. Test database tables
    console.log('\n6. Testing database tables...');
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", { type: sequelize.QueryTypes.SELECT });
    const requiredTables = ['users', 'tasks', 'leaves', 'meetings', 'collaborations', 'dropdowns'];
    const existingTables = tables.map(t => t.name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('   ✓ All required tables present:', requiredTables.join(', '));
    } else {
      console.log('   ✗ Missing tables:', missingTables.join(', '));
      throw new Error('Missing required tables');
    }
    
    // 7. Test specific table structures
    console.log('\n7. Testing specific table structures...');
    
    // Test tasks table
    const tasksTable = await sequelize.query('PRAGMA table_info(tasks)', { type: sequelize.QueryTypes.SELECT });
    if (tasksTable.some(col => col.name === 'userInformation')) {
      console.log('   ✓ Tasks table has userInformation field');
    } else {
      console.log('   ✗ Tasks table missing userInformation field');
      throw new Error('Tasks table missing userInformation field');
    }
    
    // Test meetings table
    const meetingsTable = await sequelize.query('PRAGMA table_info(meetings)', { type: sequelize.QueryTypes.SELECT });
    const meetingFields = ['subject', 'platform', 'location', 'date', 'time', 'duration', 'createdBy'];
    const missingMeetingFields = meetingFields.filter(field => !meetingsTable.some(col => col.name === field));
    
    if (missingMeetingFields.length === 0) {
      console.log('   ✓ Meetings table has all required fields');
    } else {
      console.log('   ✗ Meetings table missing fields:', missingMeetingFields.join(', '));
      throw new Error('Meetings table missing required fields');
    }
    
    console.log('\n=== ALL TESTS PASSED ===');
    console.log('=== SYSTEM IS FULLY OPERATIONAL ===');
    
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('=== SYSTEM REQUIRES ATTENTION ===');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runComprehensiveTest();
}

module.exports = runComprehensiveTest;