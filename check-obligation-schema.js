// Check the Obligation schema and database structure
const sequelize = require('./config/database');
const Dropdown = require('./models/Dropdown');

async function checkObligationSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check the Dropdown model structure
    console.log('\n=== DROPDOWN MODEL STRUCTURE ===');
    console.log('Table name:', Dropdown.tableName);
    console.log('Attributes:', Object.keys(Dropdown.rawAttributes));
    
    // Check the type enum values
    const typeAttribute = Dropdown.rawAttributes.type;
    if (typeAttribute && typeAttribute.type && typeAttribute.type.values) {
      console.log('Valid types:', typeAttribute.type.values);
    }
    
    // Check if Obligation values exist and are active
    console.log('\n=== OBLIGATION VALUES CHECK ===');
    const obligations = await Dropdown.findAll({ 
      where: { type: 'Obligation' },
      order: [['id', 'ASC']]
    });
    
    console.log('📊 Total Obligation records:', obligations.length);
    
    if (obligations.length > 0) {
      console.log('\n📋 All Obligation records:');
      obligations.forEach((obligation, index) => {
        console.log(`  ${index + 1}. ID: ${obligation.id}, Value: "${obligation.value}", Active: ${obligation.isActive}, Created: ${obligation.createdAt}`);
      });
      
      // Check active Obligation values specifically
      const activeObligations = obligations.filter(o => o.isActive);
      console.log(`\n📊 Active Obligation values: ${activeObligations.length}`);
      
      if (activeObligations.length > 0) {
        console.log('\n📋 Active Obligation values:');
        activeObligations.forEach((obligation, index) => {
          console.log(`  ${index + 1}. ${obligation.value}`);
        });
      }
    } else {
      console.log('No Obligation records found in database');
    }
    
    // Test the specific API query that the frontend uses
    console.log('\n=== TESTING API QUERY ===');
    const apiQueryResult = await Dropdown.findAll({ 
      where: { type: 'Obligation', isActive: true },
      order: [['value', 'ASC']]
    });
    
    console.log('📊 API query result count:', apiQueryResult.length);
    console.log('📋 API query results:');
    apiQueryResult.forEach((obligation, index) => {
      console.log(`  ${index + 1}. ${obligation.value}`);
    });
    
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the check
checkObligationSchema();