const sequelize = require('../config/database');
const Dropdown = require('../models/Dropdown');

async function checkObligationValues() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Get all Obligation values
    const obligations = await Dropdown.findAll({ 
      where: { type: 'Obligation' },
      order: [['value', 'ASC']]
    });
    
    console.log('\n📋 Obligation values in database:');
    if (obligations.length > 0) {
      obligations.forEach((obligation, index) => {
        console.log(`${index + 1}. ${obligation.value} (ID: ${obligation.id}, Active: ${obligation.isActive})`);
      });
    } else {
      console.log('No Obligation values found in database.');
    }
    
    console.log(`\n📊 Total Obligation values: ${obligations.length}`);
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
checkObligationValues();