const sequelize = require('./config/database');
const Kanban = require('./models/Kanban');

async function testKanbanModel() {
  try {
    console.log('Testing Kanban model...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test if Kanban table exists and sync
    await sequelize.sync({ alter: true });
    console.log('✅ Kanban model synced successfully');
    
    // Test creating a sample card
    const sampleCard = await Kanban.create({
      title: 'Test Card',
      description: 'This is a test card',
      status: 'backlog'
    });
    console.log('✅ Sample card created:', sampleCard.toJSON());
    
    // Test fetching cards
    const cards = await Kanban.findAll();
    console.log('✅ Cards fetched:', cards.length, 'cards found');
    
    // Clean up - delete the test card
    await sampleCard.destroy();
    console.log('✅ Test card cleaned up');
    
    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
    process.exit(1);
  }
}

testKanbanModel();