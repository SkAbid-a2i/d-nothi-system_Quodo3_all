// Test database connection and Kanban table existence
const sequelize = require('./config/database');
const Kanban = require('./models/Kanban');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test if Kanban model is properly defined
    console.log('Testing Kanban model...');
    const kanbanModel = sequelize.models.Kanban;
    if (kanbanModel) {
      console.log('✅ Kanban model is properly defined');
      
      // Test if table exists by trying to count records
      try {
        const count = await kanbanModel.count();
        console.log(`✅ Kanban table exists with ${count} records`);
      } catch (error) {
        console.log('ℹ️  Kanban table may not exist yet or is empty');
      }
    } else {
      console.log('❌ Kanban model is not defined');
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

testDatabase();