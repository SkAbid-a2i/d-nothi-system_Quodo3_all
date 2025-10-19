// User Management Verification Script
// This script verifies that the UserManagement component has all required fields

const fs = require('fs');
const path = require('path');

function verifyUserManagementComponent() {
  console.log('=== USER MANAGEMENT COMPONENT VERIFICATION ===\n');
  
  const componentPath = path.join(__dirname, '../client/src/components/UserManagement.js');
  
  if (!fs.existsSync(componentPath)) {
    console.error('❌ UserManagement component not found at:', componentPath);
    process.exit(1);
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  console.log('🔍 Checking UserManagement component...\n');
  
  // Check for Blood Group field in form
  const hasBloodGroupField = componentContent.includes('Blood Group') && 
                            (componentContent.includes('bloodGroup') || componentContent.includes('BloodGroup'));
  
  // Check for Phone Number field in form
  const hasPhoneNumberField = componentContent.includes('Phone Number') && 
                             (componentContent.includes('phoneNumber') || componentContent.includes('PhoneNumber'));
  
  // Check for Blood Group column in table
  const hasBloodGroupColumn = componentContent.includes('Blood Group') && 
                             componentContent.includes('<TableCell>Blood Group</TableCell>');
  
  // Check for Phone column in table
  const hasPhoneColumn = componentContent.includes('Phone</TableCell>') || 
                        componentContent.includes('Phone Number</TableCell>');
  
  console.log('📋 Form Fields Check:');
  if (hasBloodGroupField) {
    console.log('   ✅ Blood Group field: Present');
  } else {
    console.log('   ❌ Blood Group field: Missing');
  }
  
  if (hasPhoneNumberField) {
    console.log('   ✅ Phone Number field: Present');
  } else {
    console.log('   ❌ Phone Number field: Missing');
  }
  
  console.log('\n📋 Table Columns Check:');
  if (hasBloodGroupColumn) {
    console.log('   ✅ Blood Group column: Present');
  } else {
    console.log('   ❌ Blood Group column: Missing');
  }
  
  if (hasPhoneColumn) {
    console.log('   ✅ Phone column: Present');
  } else {
    console.log('   ❌ Phone column: Missing');
  }
  
  // Check for user data handling
  const hasUserDataHandling = componentContent.includes('bloodGroup:') && 
                             componentContent.includes('phoneNumber:');
  
  console.log('\n📋 Data Handling Check:');
  if (hasUserDataHandling) {
    console.log('   ✅ User data handling for bloodGroup and phoneNumber: Present');
  } else {
    console.log('   ❌ User data handling for bloodGroup and phoneNumber: Missing');
  }
  
  const allChecksPassed = hasBloodGroupField && hasPhoneNumberField && 
                         hasBloodGroupColumn && hasPhoneColumn && hasUserDataHandling;
  
  console.log('\n=== VERIFICATION RESULT ===');
  if (allChecksPassed) {
    console.log('✅ All UserManagement fields are present and correctly implemented');
    console.log('\n💡 Next steps:');
    console.log('1. Ensure the latest code is deployed to production');
    console.log('2. Clear browser cache and refresh the page');
    console.log('3. Verify that the database schema includes bloodGroup and phoneNumber columns');
  } else {
    console.log('❌ Some UserManagement fields are missing or incorrectly implemented');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check that the latest code has been deployed');
    console.log('2. Verify database schema has required columns');
    console.log('3. Clear browser cache and hard refresh');
    console.log('4. Check browser console for JavaScript errors');
  }
  
  return allChecksPassed;
}

if (require.main === module) {
  const result = verifyUserManagementComponent();
  process.exit(result ? 0 : 1);
}

module.exports = verifyUserManagementComponent;