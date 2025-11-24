// Script to diagnose Kanban table schema in the database
const sequelize = require('../config/database');

async function diagnoseKanbanSchema() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if kanban table exists
    console.log('\n--- Checking if kanban table exists ---');
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'kanban'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!tables || tables.length === 0) {
      console.log('❌ Kanban table not found');
      return;
    }
    console.log('✅ Kanban table exists');
    
    // Get table structure
    console.log('\n--- Getting table structure ---');
    const [structure] = await sequelize.query(
      "DESCRIBE kanban",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Table structure:');
    structure.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key} ${field.Default ? `DEFAULT ${field.Default}` : ''} ${field.Extra}`);
    });
    
    // Check if all required fields exist
    console.log('\n--- Checking required fields ---');
    const requiredFields = ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt'];
    const fieldNames = structure.map(field => field.Field);
    
    let allFieldsExist = true;
    requiredFields.forEach(field => {
      if (fieldNames.includes(field)) {
        console.log(`✅ Field '${field}' exists`);
      } else {
        console.log(`❌ Field '${field}' is missing`);
        allFieldsExist = false;
      }
    });
    
    if (allFieldsExist) {
      console.log('\n✅ All required fields exist in the kanban table');
    } else {
      console.log('\n❌ Some required fields are missing');
    }
    
    // Check indexes
    console.log('\n--- Checking indexes ---');
    const [indexes] = await sequelize.query(
      "SHOW INDEX FROM kanban",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Indexes:');
    indexes.forEach(index => {
      console.log(`  ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? 'Non-unique' : 'Unique'})`);
    });
    
    // Test creating a sample record
    console.log('\n--- Testing record creation ---');
    try {
      const Kanban = require('../models/Kanban');
      const sampleCard = await Kanban.create({
        title: 'Test Card',
        description: 'This is a test card for schema verification',
        status: 'backlog'
      });
      console.log('✅ Sample card created successfully:', sampleCard.toJSON());
      
      // Clean up
      await sampleCard.destroy();
      console.log('✅ Sample card cleaned up');
    } catch (createError) {
      console.log('❌ Error creating sample card:', createError.message);
      if (createError.parent) {
        console.log('   Parent error:', createError.parent.message);
      }
    }
    
    console.log('\n--- Diagnosis complete ---');
  } catch (error) {
    console.error('❌ Error diagnosing Kanban schema:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

diagnoseKanbanSchema();