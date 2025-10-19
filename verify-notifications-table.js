// Script to verify notifications table creation
const sequelize = require('./config/database');
const Notification = require('./models/Notification');

async function verifyNotificationsTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    console.log('Checking if notifications table exists...');
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if table exists
    const tables = await queryInterface.showAllSchemas();
    const tableNames = tables.map(table => table.name || table);
    
    if (tableNames.includes('notifications')) {
      console.log('✓ Notifications table already exists');
    } else {
      console.log('Creating notifications table...');
      await Notification.sync({ alter: true });
      console.log('✓ Notifications table created successfully');
    }
    
    // Test inserting a sample notification
    console.log('Testing notification insertion...');
    const sampleNotification = await Notification.create({
      type: 'test',
      message: 'Test notification for verification',
      userId: null,
      recipientRole: null,
      data: { test: true },
      isRead: false
    });
    console.log('✓ Sample notification inserted successfully');
    
    // Test querying notifications
    console.log('Testing notification query...');
    const notifications = await Notification.findAll({
      limit: 1
    });
    console.log('✓ Notification query successful');
    
    // Clean up test notification
    await sampleNotification.destroy();
    console.log('✓ Test notification cleaned up');
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('✓ All database checks passed');
    console.log('✓ Notifications table is ready for production');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database verification failed:', error.message);
    process.exit(1);
  }
}

verifyNotificationsTable();