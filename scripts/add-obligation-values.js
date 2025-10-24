const sequelize = require('../config/database');
const Dropdown = require('../models/Dropdown');

async function addObligationValues() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Check if Obligation values already exist
    const existingObligations = await Dropdown.count({ where: { type: 'Obligation' } });
    if (existingObligations > 0) {
      console.log('ℹ️  Obligation values already exist in the database. Skipping seeding.');
      await sequelize.close();
      return;
    }
    
    console.log('\n🌱 Adding Obligation values...');
    
    // Create Obligation dropdown values
    const obligations = [
      { type: 'Obligation', value: 'Compliance' },
      { type: 'Obligation', value: 'Contractual' },
      { type: 'Obligation', value: 'Financial' },
      { type: 'Obligation', value: 'Legal' },
      { type: 'Obligation', value: 'Operational' },
      { type: 'Obligation', value: 'Regulatory' }
    ];
    
    // Insert Obligation values
    for (const obligation of obligations) {
      await Dropdown.create({
        ...obligation,
        createdBy: 1 // Default admin user ID
      });
      console.log(`✅ Created ${obligation.type}: ${obligation.value}`);
    }
    
    console.log('\n✅ Obligation values added successfully!');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addObligationValues();