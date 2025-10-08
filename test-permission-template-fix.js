// Test script to verify permission template functionality
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('Testing Permission Template functionality...');

// Test 1: Check if we can access the permission templates endpoint
async function testPermissionTemplatesEndpoint() {
  try {
    console.log('Testing permission templates endpoint...');
    const response = await api.get('/permissions/templates');
    console.log('✓ Permission templates endpoint accessible');
    console.log(`Found ${response.data.length} permission templates`);
    return response.data;
  } catch (error) {
    console.error('✗ Error accessing permission templates endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Test 2: Check if we can create a permission template with all permissions
async function testCreatePermissionTemplate() {
  try {
    console.log('Testing permission template creation...');
    
    // Sample permission template data with all permissions
    const templateData = {
      name: 'Test Template ' + Date.now(),
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
      }
    };
    
    const response = await api.post('/permissions/templates', templateData);
    console.log('✓ Permission template created successfully');
    console.log('Template ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('✗ Error creating permission template:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Test 3: Check if we can update a permission template
async function testUpdatePermissionTemplate(templateId) {
  if (!templateId) {
    console.log('Skipping permission template update test (no template ID)');
    return;
  }
  
  try {
    console.log('Testing permission template update...');
    
    const updateData = {
      name: 'Updated Test Template ' + Date.now(),
      permissions: {
        canCreateTasks: false,
        canAssignTasks: false,
        canViewAllTasks: false,
        canCreateLeaves: true,
        canApproveLeaves: true,
        canViewAllLeaves: true,
        canManageUsers: false,
        canManageDropdowns: false,
        canViewReports: true,
        canManageFiles: true,
        canViewLogs: false
      }
    };
    
    const response = await api.put(`/permissions/templates/${templateId}`, updateData);
    console.log('✓ Permission template updated successfully');
    console.log('Updated template name:', response.data.name);
    return true;
  } catch (error) {
    console.error('✗ Error updating permission template:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test 4: Check if we can delete a permission template
async function testDeletePermissionTemplate(templateId) {
  if (!templateId) {
    console.log('Skipping permission template delete test (no template ID)');
    return;
  }
  
  try {
    console.log('Testing permission template deletion...');
    
    const response = await api.delete(`/permissions/templates/${templateId}`);
    console.log('✓ Permission template deleted successfully');
    return true;
  } catch (error) {
    console.error('✗ Error deleting permission template:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Permission Template tests...\n');
  
  // Test 1: Check permission templates endpoint
  const templates = await testPermissionTemplatesEndpoint();
  
  // Test 2: Create permission template
  const templateId = await testCreatePermissionTemplate();
  
  // Test 3: Update permission template
  if (templateId) {
    await testUpdatePermissionTemplate(templateId);
  }
  
  // Test 4: Delete permission template
  if (templateId) {
    await testDeletePermissionTemplate(templateId);
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testPermissionTemplatesEndpoint,
  testCreatePermissionTemplate,
  testUpdatePermissionTemplate,
  testDeletePermissionTemplate
};