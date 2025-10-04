// Test script to verify Dropdown model functionality
const Dropdown = require('./models/Dropdown');
const sequelize = require('./config/database');

async function testDropdownModel() {
  try {
    console.log('Testing Dropdown model...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test finding dropdowns
    console.log('\nTesting dropdown fetching...');
    const dropdowns = await Dropdown.findAll({ 
      where: { isActive: true },
      order: [['type', 'ASC'], ['value', 'ASC']],
      limit: 5
    });
    console.log('✅ Dropdown fetching successful, found:', dropdowns.length, 'dropdowns');
    
    if (dropdowns.length > 0) {
      console.log('Sample dropdown:', {
        id: dropdowns[0].id,
        type: dropdowns[0].type,
        value: dropdowns[0].value
      });
    }
    
    // Test finding by type
    console.log('\nTesting dropdown fetching by type...');
    const categories = await Dropdown.findAll({ 
      where: { type: 'Category', isActive: true },
      order: [['value', 'ASC']],
      limit: 5
    });
    console.log('✅ Category fetching successful, found:', categories.length, 'categories');
    
    console.log('\n🎉 All Dropdown model tests passed!');
    
  } catch (error) {
    console.error('❌ Dropdown model test failed:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
  }
}

testDropdownModel();