const sequelize = require('./config/database'); 
const User = require('./models/User'); 
const Meeting = require('./models/Meeting'); 
const notificationService = require('./services/notification.service');

async function testNotifications() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get all users
    const users = await User.findAll();
    console.log('Users:', users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role
    })));
    
    // Get a meeting to test with
    const meetings = await Meeting.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }, {
        model: User,
        as: 'selectedUsers',
        attributes: ['id', 'username', 'fullName'],
        through: { attributes: [] }
      }]
    });
    
    if (meetings.length > 0) {
      const meeting = meetings[0];
      console.log('\nTesting notification for meeting:', {
        id: meeting.id,
        subject: meeting.subject,
        createdBy: meeting.createdBy,
        creator: meeting.creator ? meeting.creator.username : 'Unknown',
        selectedUserIds: meeting.selectedUserIds,
        selectedUsers: meeting.selectedUsers ? meeting.selectedUsers.map(u => u.username) : []
      });
      
      // Test the sendToRelevantUsersForMeeting function
      console.log('\n--- Testing sendToRelevantUsersForMeeting ---');
      
      // Mock client connections (simulate users being connected)
      console.log('Simulating user connections...');
      users.forEach(user => {
        // Create a mock response object
        const mockResponse = {
          writeHead: () => {},
          write: (data) => {
            console.log(`Notification sent to ${user.username}:`, data);
          },
          on: (event, callback) => {
            if (event === 'close') {
              // Don't call callback immediately to avoid removing the client
            }
          }
        };
        
        notificationService.addClient(user.id, mockResponse);
      });
      
      console.log(`Connected clients: ${notificationService.getConnectedClients()}`);
      
      // Test sending notification to relevant users
      const testData = {
        type: 'meetingCreated',
        meetingId: meeting.id,
        meeting: meeting.toJSON(),
        timestamp: new Date().toISOString()
      };
      
      await notificationService.sendToRelevantUsersForMeeting(meeting, testData);
      
      console.log('\nNotification test completed');
    } else {
      console.log('No meetings found to test with');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.parent) {
      console.error('Parent error:', err.parent.message);
    }
  } finally {
    // Clean up
    notificationService.clients.clear();
    process.exit(0);
  }
}

testNotifications();

// Test script for notification functionality
const http = require('http');

// Test creating a collaboration
const data = JSON.stringify({
  title: 'Test Collaboration',
  description: 'This is a test collaboration for notification testing'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/collaborations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', chunk => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    
    // Try to parse the response
    try {
      const result = JSON.parse(responseData);
      console.log('Created collaboration:', result.data);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
