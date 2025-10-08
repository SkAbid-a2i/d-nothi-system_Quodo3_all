const sequelize = require('./config/database');
const Dropdown = require('./models/Dropdown');

async function checkDropdowns() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Get all dropdowns
    const dropdowns = await Dropdown.findAll({
      where: { isActive: true },
      order: [['type', 'ASC'], ['value', 'ASC']]
    });
    
    console.log(`\nFound ${dropdowns.length} active dropdown values:`);
    
    // Group by type
    const grouped = {};
    dropdowns.forEach(dropdown => {
      if (!grouped[dropdown.type]) {
        grouped[dropdown.type] = [];
      }
      grouped[dropdown.type].push(dropdown.value);
    });
    
    // Display by type
    Object.keys(grouped).forEach(type => {
      console.log(`\n${type}:`);
      grouped[type].forEach(value => {
        console.log(`  - ${value}`);
      });
    });
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkDropdowns();