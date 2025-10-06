const sequelize = require('../config/database');
const PermissionTemplate = require('../models/PermissionTemplate');

async function seedPermissionTemplates() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Check if permission templates already exist
    const existingTemplates = await PermissionTemplate.count();
    if (existingTemplates > 0) {
      console.log('ℹ️  Permission templates already exist in the database. Skipping seeding.');
      await sequelize.close();
      return;
    }
    
    console.log('\n🌱 Seeding permission templates...');
    
    // Create sample permission templates
    const templates = [
      {
        name: 'Agent',
        permissions: {
          canCreateTasks: true,
          canAssignTasks: false,
          canViewAllTasks: false,
          canCreateLeaves: true,
          canApproveLeaves: false,
          canViewAllLeaves: false,
          canManageUsers: false,
          canManageDropdowns: false,
          canViewReports: false,
          canManageFiles: true,
          canViewLogs: false
        },
        createdBy: 1 // Default admin user ID
      },
      {
        name: 'Supervisor',
        permissions: {
          canCreateTasks: true,
          canAssignTasks: true,
          canViewAllTasks: true,
          canCreateLeaves: true,
          canApproveLeaves: true,
          canViewAllLeaves: true,
          canManageUsers: false,
          canManageDropdowns: false,
          canViewReports: true,
          canManageFiles: true,
          canViewLogs: false
        },
        createdBy: 1 // Default admin user ID
      },
      {
        name: 'Admin',
        permissions: {
          canCreateTasks: true,
          canAssignTasks: true,
          canViewAllTasks: true,
          canCreateLeaves: true,
          canApproveLeaves: true,
          canViewAllLeaves: true,
          canManageUsers: true,
          canManageDropdowns: true,
          canViewReports: true,
          canManageFiles: true,
          canViewLogs: true
        },
        createdBy: 1 // Default admin user ID
      },
      {
        name: 'System Admin',
        permissions: {
          canCreateTasks: true,
          canAssignTasks: true,
          canViewAllTasks: true,
          canCreateLeaves: true,
          canApproveLeaves: true,
          canViewAllLeaves: true,
          canManageUsers: true,
          canManageDropdowns: true,
          canViewReports: true,
          canManageFiles: true,
          canViewLogs: true
        },
        createdBy: 1 // Default admin user ID
      }
    ];
    
    // Insert permission templates
    for (const template of templates) {
      await PermissionTemplate.create(template);
      console.log(`✅ Created permission template: ${template.name}`);
    }
    
    console.log('\n✅ Permission template seeding completed successfully!');
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the seed script
seedPermissionTemplates();