const Task = require('./models/Task');
const sequelize = require('./config/database');

async function directDbTest() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Try to create a task directly
    console.log('Creating task directly...');
    const task = await Task.create({
      date: new Date(),
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      userId: 1,
      userName: 'Test User',
      office: null,
      description: 'Direct DB test task'
    });
    
    console.log('Task created successfully:', task.id);
    
    // Clean up
    await task.destroy();
    console.log('Task deleted successfully');
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error('Validation error:', err.message);
      });
    }
  }
}

directDbTest();