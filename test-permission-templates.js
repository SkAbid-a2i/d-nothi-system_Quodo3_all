// Test script to verify permission templates functionality
const PermissionTemplate = require('./models/PermissionTemplate');
const sequelize = require('./config/database');

async function testPermissionTemplates() {
  try {
    console.log('Testing Permission Templates model...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test creating a permission template
    console.log('\nCreating a permission template...');
    const template = await PermissionTemplate.create({
      name: 'Test Template',
      permissions: {
        manageTasks: true,
        editTasks: true,
        deleteTasks: false,
        manageLeaves: true,
        manageUsers: false,
        manageDropdowns: true
      },
      createdBy: 1
    });
    console.log('✅ Permission template created:', template.id);
    
    // Test finding permission templates
    console.log('\nFetching permission templates...');
    const templates = await PermissionTemplate.findAll();
    console.log('✅ Found', templates.length, 'permission templates');
    
    if (templates.length > 0) {
      console.log('Sample template:', {
        id: templates[0].id,
        name: templates[0].name,
        permissions: templates[0].permissions
      });
    }
    
    // Test updating a permission template
    console.log('\nUpdating permission template...');
    if (templates.length > 0) {
      const updatedTemplate = await PermissionTemplate.update(
        { 
          name: 'Updated Test Template',
          permissions: {
            manageTasks: false,
            editTasks: false,
            deleteTasks: false,
            manageLeaves: false,
            manageUsers: false,
            manageDropdowns: false
          },
          updatedBy: 1
        },
        { where: { id: templates[0].id } }
      );
      console.log('✅ Permission template updated');
    }
    
    // Test deleting a permission template
    console.log('\nDeleting permission template...');
    if (templates.length > 0) {
      await PermissionTemplate.destroy({ where: { id: templates[0].id } });
      console.log('✅ Permission template deleted');
    }
    
    console.log('\n🎉 All Permission Templates tests passed!');
    
  } catch (error) {
    console.error('❌ Permission Templates test failed:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
  }
}

testPermissionTemplates();