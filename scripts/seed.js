const sequelize = require('../config/database');
const User = require('../models/User');
const Dropdown = require('../models/Dropdown');

// Test the connection and seed database
sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to TiDB database');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synced successfully');
    return seedDatabase();
  })
  .catch(err => {
    console.error('Unable to connect to TiDB database:', err);
  });

async function seedDatabase() {
  try {
    // Create default System Admin user
    const adminUser = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@d-nothi.com',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'SystemAdmin',
      }
    });

    if (adminUser[1]) {
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }

    // Create default dropdown values
    const defaultDropdowns = [
      // Sources
      { type: 'Source', value: 'Email' },
      { type: 'Source', value: 'Phone' },
      { type: 'Source', value: 'Walk-in' },
      
      // Categories
      { type: 'Category', value: 'IT Support' },
      { type: 'Category', value: 'HR' },
      { type: 'Category', value: 'Finance' },
      { type: 'Category', value: 'General' },
      
      // Services (dependent on categories)
      { type: 'Service', value: 'Hardware', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Software', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Network', parentType: 'Category', parentValue: 'IT Support' },
      { type: 'Service', value: 'Leave', parentType: 'Category', parentValue: 'HR' },
      { type: 'Service', value: 'Payroll', parentType: 'Category', parentValue: 'HR' },
      { type: 'Service', value: 'Recruitment', parentType: 'Category', parentValue: 'HR' },
      { type: 'Service', value: 'Accounts', parentType: 'Category', parentValue: 'Finance' },
      { type: 'Service', value: 'Billing', parentType: 'Category', parentValue: 'Finance' },
      { type: 'Service', value: 'Inquiry', parentType: 'Category', parentValue: 'General' },
      
      // Offices
      { type: 'Office', value: 'Head Office' },
      { type: 'Office', value: 'Dhaka Branch' },
      { type: 'Office', value: 'Chittagong Branch' },
      { type: 'Office', value: 'Sylhet Branch' },
    ];

    for (const dropdownData of defaultDropdowns) {
      const [dropdown, created] = await Dropdown.findOrCreate({
        where: { 
          type: dropdownData.type, 
          value: dropdownData.value 
        },
        defaults: dropdownData
      });
      
      if (created) {
        console.log(`Created dropdown: ${dropdownData.type} - ${dropdownData.value}`);
      }
    }

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}