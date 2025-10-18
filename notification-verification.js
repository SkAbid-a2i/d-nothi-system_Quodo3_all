// Simple script to verify notification system is working
console.log('Notification System Verification');

// Test 1: Check if notification service can be imported
try {
  const notificationService = require('./client/src/services/notificationService.js');
  console.log('✓ Notification service can be imported');
} catch (error) {
  console.log('✗ Failed to import notification service:', error.message);
}

// Test 2: Check if backend notification service can be imported
try {
  const backendNotificationService = require('./services/notification.service.js');
  console.log('✓ Backend notification service can be imported');
  console.log('  Connected clients:', backendNotificationService.getConnectedClients());
} catch (error) {
  console.log('✗ Failed to import backend notification service:', error.message);
}

// Test 3: Check if collaboration model exists
try {
  const Collaboration = require('./models/Collaboration.js');
  console.log('✓ Collaboration model can be imported');
} catch (error) {
  console.log('✗ Failed to import collaboration model:', error.message);
}

// Test 4: Check if collaboration routes exist
try {
  const collaborationRoutes = require('./routes/collaboration.routes.js');
  console.log('✓ Collaboration routes can be imported');
} catch (error) {
  console.log('✗ Failed to import collaboration routes:', error.message);
}

console.log('\nVerification complete');