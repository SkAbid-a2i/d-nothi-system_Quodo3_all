const sequelize = require('../config/database');
const Dropdown = require('../models/Dropdown');

async function seedDropdowns() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Check if dropdowns already exist
    const existingDropdowns = await Dropdown.count();
    if (existingDropdowns > 0) {
      console.log('ℹ️  Dropdowns already exist in the database. Skipping seeding.');
      await sequelize.close();
      return;
    }
    
    console.log('\n🌱 Seeding dropdown values...');
    
    // Create sample dropdown values
    const dropdowns = [
      // Categories
      { type: 'Category', value: 'IT Support' },
      { type: 'Category', value: 'HR' },
      { type: 'Category', value: 'Finance' },
      { type: 'Category', value: 'Administration' },
      
      // Sources
      { type: 'Source', value: 'Email' },
      { type: 'Source', value: 'Phone' },
      { type: 'Source', value: 'Walk-in' },
      { type: 'Source', value: 'Online Form' },
      
      // Offices
      { type: 'Office', value: 'Head Office' },
      { type: 'Office', value: 'Branch Office' },
      { type: 'Office', value: 'Remote' },
      
      // Services (with parent categories)
      { type: 'Service', value: 'Software Installation', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Hardware Repair', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Network Issues', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Leave Request', parentType: 'Category', parentValue: 'HR' },
      { type: 'Service', value: 'Recruitment', parentType: 'Category', parentValue: 'HR' },
      { type: 'Service', value: 'Payroll', parentType: 'Category', parentValue: 'Finance' },
      { type: 'Service', value: 'Invoicing', parentType: 'Category', parentValue: 'Finance' },
      { type: 'Service', value: 'Document Processing', parentType: 'Category', parentValue: 'Administration' },
      { type: 'Service', value: 'Meeting Scheduling', parentType: 'Category', parentValue: 'Administration' }
    ];
    
    // Insert dropdown values
    for (const dropdown of dropdowns) {
      await Dropdown.create({
        ...dropdown,
        createdBy: 1 // Default admin user ID
      });
      console.log(`✅ Created ${dropdown.type}: ${dropdown.value}`);
    }
    
    console.log('\n✅ Dropdown seeding completed successfully!');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the seed script
seedDropdowns();