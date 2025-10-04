// Test script to create sample data for testing UI components
const axios = require('axios');

async function createSampleData() {
  try {
    console.log('Creating sample data for testing...');
    
    // Login as admin
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Create sample dropdown values
    console.log('\nCreating sample dropdown values...');
    const dropdowns = [
      { type: 'Source', value: 'Email' },
      { type: 'Source', value: 'Phone' },
      { type: 'Category', value: 'IT Support' },
      { type: 'Category', value: 'HR' },
      { type: 'Service', value: 'Software', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Hardware', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Office', value: 'Head Office' },
      { type: 'Office', value: 'Branch Office' }
    ];
    
    for (const dropdown of dropdowns) {
      try {
        await axios.post('http://localhost:5000/api/dropdowns', dropdown, { headers });
        console.log(`✅ Created ${dropdown.type}: ${dropdown.value}`);
      } catch (error) {
        console.log(`ℹ️  ${dropdown.type} ${dropdown.value} already exists or error:`, error.response?.data?.message);
      }
    }
    
    // Create a sample task
    console.log('\nCreating sample task...');
    const taskData = {
      date: new Date().toISOString().split('T')[0],
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      description: 'Sample task for testing UI components',
      status: 'Pending',
      userId: authResponse.data.user.id,
      userName: authResponse.data.user.fullName,
      office: authResponse.data.user.office
    };
    
    const taskResponse = await axios.post('http://localhost:5000/api/tasks', taskData, { headers });
    console.log('✅ Created sample task with ID:', taskResponse.data.id);
    
    // Create a sample leave
    console.log('\nCreating sample leave...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const leaveData = {
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Sample leave for testing UI components'
    };
    
    const leaveResponse = await axios.post('http://localhost:5000/api/leaves', leaveData, { headers });
    console.log('✅ Created sample leave with ID:', leaveResponse.data.id);
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('You can now test the UI components with this data.');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.response?.data || error.message);
  }
}

createSampleData();