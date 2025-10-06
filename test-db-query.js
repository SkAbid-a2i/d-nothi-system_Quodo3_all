require('dotenv').config();
const sequelize = require('./config/database');
const Task = require('./models/Task');

async function testDbQuery() {
  try {
    console.log('Testing direct database query...');
    
    // Authenticate first
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Try a simple query
    console.log('\n1. Testing simple query...');
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('   ✓ Simple query successful:', results[0].result);
    
    // Try to count tasks
    console.log('\n2. Testing task count...');
    const taskCount = await Task.count();
    console.log('   ✓ Task count successful:', taskCount);
    
    // Try to fetch tasks
    console.log('\n3. Testing task fetch...');
    const tasks = await Task.findAll({ limit: 5 });
    console.log('   ✓ Task fetch successful:', tasks.length, 'tasks');
    
    await sequelize.close();
    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
    if (error.original) {
      console.error('   Original error:', error.original.message);
    }
  }
}

testDbQuery();