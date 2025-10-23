const sequelize = require('../config/database');
const Dropdown = require('../models/Dropdown');

// Check all dropdown values in the database
async function checkDropdownValues() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Sync only the Dropdown model
    await Dropdown.sync();
    
    // Get all dropdown values
    const dropdowns = await Dropdown.findAll({
      where: { isActive: true },
      order: [['type', 'ASC'], ['value', 'ASC']]
    });
    
    console.log('All dropdown values:');
    const grouped = {};
    
    dropdowns.forEach(dropdown => {
      if (!grouped[dropdown.type]) {
        grouped[dropdown.type] = [];
      }
      grouped[dropdown.type].push(dropdown.value);
    });
    
    Object.keys(grouped).forEach(type => {
      console.log(`\n${type}:`);
      grouped[type].forEach(value => {
        console.log(`  - ${value}`);
      });
    });
    
    // Specifically check for obligation values
    const obligations = await Dropdown.findAll({
      where: { 
        type: 'Obligation',
        isActive: true
      },
      order: [['value', 'ASC']]
    });
    
    console.log('\nObligation values specifically:');
    if (obligations.length > 0) {
      obligations.forEach(obligation => {
        console.log(`  - ${obligation.value} (ID: ${obligation.id})`);
      });
    } else {
      console.log('  No obligation values found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking dropdown values:', error);
    process.exit(1);
  }
}

checkDropdownValues();