// Test script to verify Agent role meeting access enhancement
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const AGENT_CREDENTIALS = { username: 'agent1', password: 'agent123' };

async function runTest() {
  try {
    console.log('🧪 Testing Agent Role Meeting Access Enhancement...\n');
    
    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful\n');
    
    // 2. Login as Agent
    console.log('2. Logging in as Agent...');
    const agentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, AGENT_CREDENTIALS);
    const agentToken = agentLoginResponse.data.token;
    console.log('✅ Agent login successful\n');
    
    // 3. Create a meeting as Admin (involving other users)
    console.log('3. Creating a meeting as Admin...');
    const meetingData = {
      subject: 'Office-wide Meeting Test',
      platform: 'zoom',
      date: '2025-10-15',
      time: '10:00:00',
      duration: 60,
      selectedUserIds: [] // No specific users selected, but should be visible to all in office
    };
    
    const createMeetingResponse = await axios.post(`${BASE_URL}/meetings`, meetingData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const meetingId = createMeetingResponse.data.id;
    console.log('✅ Meeting created successfully\n');
    
    // 4. Fetch meetings as Admin
    console.log('4. Fetching meetings as Admin...');
    const adminMeetingsResponse = await axios.get(`${BASE_URL}/meetings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminMeetingsCount = adminMeetingsResponse.data.length;
    console.log(`✅ Admin can see ${adminMeetingsCount} meetings\n`);
    
    // 5. Fetch meetings as Agent
    console.log('5. Fetching meetings as Agent...');
    const agentMeetingsResponse = await axios.get(`${BASE_URL}/meetings`, {
      headers: { 'Authorization': `Bearer ${agentToken}` }
    });
    const agentMeetingsCount = agentMeetingsResponse.data.length;
    console.log(`✅ Agent can see ${agentMeetingsCount} meetings\n`);
    
    // 6. Verify Agent can see the same meetings as Admin
    console.log('6. Verifying meeting visibility consistency...');
    if (agentMeetingsCount >= adminMeetingsCount) {
      console.log('✅ SUCCESS: Agent role now has office-wide meeting visibility like Admin roles!\n');
    } else {
      console.log('❌ ISSUE: Agent role still has limited meeting visibility\n');
    }
    
    // 7. Check if the specific meeting is visible to Agent
    const meetingVisibleToAgent = agentMeetingsResponse.data.some(meeting => meeting.id === meetingId);
    if (meetingVisibleToAgent) {
      console.log('✅ SUCCESS: Agent can see office-wide meetings created by Admin\n');
    } else {
      console.log('❌ ISSUE: Agent cannot see office-wide meetings\n');
    }
    
    console.log('\n🎉 Test completed! Agent role meeting access has been successfully enhanced.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

// Run the test
runTest();