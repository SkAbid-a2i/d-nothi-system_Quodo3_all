const sequelize = require('../config/database');
const Dropdown = require('../models/Dropdown');

// Add default obligation values
async function addObligationValues() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Sync only the Dropdown model
    await Dropdown.sync();
    
    // Create default obligation values
    const obligationValues = [
      { type: 'Obligation', value: 'Compliance' },
      { type: 'Obligation', value: 'Legal' },
      { type: 'Obligation', value: 'Financial' },
      { type: 'Obligation', value: 'Operational' },
      { type: 'Obligation', value: 'Regulatory' },
      { type: 'Obligation', value: 'Contractual' },
    ];

    for (const obligationData of obligationValues) {
      const [dropdown, created] = await Dropdown.findOrCreate({
        where: { 
          type: obligationData.type, 
          value: obligationData.value 
        },
        defaults: obligationData
      });
      
      if (created) {
        console.log(`Created obligation: ${obligationData.value}`);
      } else {
        console.log(`Obligation already exists: ${obligationData.value}`);
      }
    }

    console.log('Obligation values added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding obligation values:', error);
    process.exit(1);
  }
}

addObligationValues();