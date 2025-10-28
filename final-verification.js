// Final verification script to ensure all Obligation implementations are working correctly

console.log('=== FINAL VERIFICATION OF OBLIGATION IMPLEMENTATIONS ===\n');

// 1. Check database values
console.log('1. DATABASE VALUES CHECK');
const sequelize = require('./config/database');
const Dropdown = require('./models/Dropdown');

async function verifyDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const obligations = await Dropdown.findAll({ 
      where: { type: 'Obligation', isActive: true },
      order: [['value', 'ASC']]
    });
    
    console.log(`📊 Active Obligation values in database: ${obligations.length}`);
    if (obligations.length > 0) {
      console.log('📋 Obligation values:');
      obligations.forEach((obligation, index) => {
        console.log(`   ${index + 1}. ${obligation.value}`);
      });
    } else {
      console.log('❌ No active Obligation values found in database');
    }
    
    await sequelize.close();
    return obligations.length > 0;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return false;
  }
}

// 2. Check API routes
console.log('\n2. API ROUTES CHECK');
const fs = require('fs');
const path = require('path');

function verifyAPIRoutes() {
  try {
    const dropdownRoutesPath = path.join(__dirname, 'routes', 'dropdown.routes.js');
    const dropdownRoutesContent = fs.readFileSync(dropdownRoutesPath, 'utf8');
    
    const validTypesCheck = dropdownRoutesContent.includes("['Source', 'Category', 'Service', 'Office', 'Obligation']");
    console.log('✅ Valid types include Obligation:', validTypesCheck);
    
    const obligationRouteCheck = dropdownRoutesContent.includes("router.get('/:type'");
    console.log('✅ Obligation route exists:', obligationRouteCheck);
    
    return validTypesCheck && obligationRouteCheck;
  } catch (error) {
    console.error('❌ API routes check error:', error.message);
    return false;
  }
}

// 3. Check frontend components
console.log('\n3. FRONTEND COMPONENTS CHECK');

function verifyFrontendComponents() {
  let allComponentsValid = true;
  
  // Check AgentDashboard
  try {
    const agentDashboardPath = path.join(__dirname, 'client', 'src', 'components', 'AgentDashboard.js');
    const agentDashboardContent = fs.readFileSync(agentDashboardPath, 'utf8');
    
    const editObligationsStateCheck = agentDashboardContent.includes('editObligations, setEditObligations');
    const obligationDropdownCheck = agentDashboardContent.includes('<InputLabel>Obligation</InputLabel>');
    const fetchObligationCheck = agentDashboardContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
    
    console.log('AgentDashboard.js:');
    console.log('  ✅ editObligations state exists:', editObligationsStateCheck);
    console.log('  ✅ Obligation dropdown implemented:', obligationDropdownCheck);
    console.log('  ✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
    
    if (!(editObligationsStateCheck && obligationDropdownCheck && fetchObligationCheck)) {
      allComponentsValid = false;
    }
  } catch (error) {
    console.error('❌ AgentDashboard check error:', error.message);
    allComponentsValid = false;
  }
  
  // Check TaskManagement
  try {
    const taskManagementPath = path.join(__dirname, 'client', 'src', 'components', 'TaskManagement.js');
    const taskManagementContent = fs.readFileSync(taskManagementPath, 'utf8');
    
    const obligationsStateCheck = taskManagementContent.includes('obligations, setObligations');
    const obligationDropdownCheck = taskManagementContent.includes('label="Obligation"');
    const fetchObligationCheck = taskManagementContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
    
    console.log('TaskManagement.js:');
    console.log('  ✅ obligations state exists:', obligationsStateCheck);
    console.log('  ✅ Obligation dropdown implemented:', obligationDropdownCheck);
    console.log('  ✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
    
    if (!(obligationsStateCheck && obligationDropdownCheck && fetchObligationCheck)) {
      allComponentsValid = false;
    }
  } catch (error) {
    console.error('❌ TaskManagement check error:', error.message);
    allComponentsValid = false;
  }
  
  // Check ModernTaskLogger
  try {
    const modernTaskLoggerPath = path.join(__dirname, 'client', 'src', 'components', 'ModernTaskLogger.js');
    const modernTaskLoggerContent = fs.readFileSync(modernTaskLoggerPath, 'utf8');
    
    const obligationsStateCheck = modernTaskLoggerContent.includes('obligations, setObligations');
    const obligationDropdownCheck = modernTaskLoggerContent.includes('<InputLabel>Obligation</InputLabel>');
    const fetchObligationCheck = modernTaskLoggerContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
    
    console.log('ModernTaskLogger.js:');
    console.log('  ✅ obligations state exists:', obligationsStateCheck);
    console.log('  ✅ Obligation dropdown implemented:', obligationDropdownCheck);
    console.log('  ✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
    
    if (!(obligationsStateCheck && obligationDropdownCheck && fetchObligationCheck)) {
      allComponentsValid = false;
    }
  } catch (error) {
    console.error('❌ ModernTaskLogger check error:', error.message);
    allComponentsValid = false;
  }
  
  // Check AdminConsole
  try {
    const adminConsolePath = path.join(__dirname, 'client', 'src', 'components', 'AdminConsole_Commit737cdc2.js');
    const adminConsoleContent = fs.readFileSync(adminConsolePath, 'utf8');
    
    const obligationInDropdownTypesCheck = adminConsoleContent.includes('\'Obligation\'');
    const obligationStylingCheck = adminConsoleContent.includes('dropdown.type === \'Obligation\'');
    
    console.log('AdminConsole_Commit737cdc2.js:');
    console.log('  ✅ Obligation in dropdownTypes:', obligationInDropdownTypesCheck);
    console.log('  ✅ Obligation styling exists:', obligationStylingCheck);
    
    if (!(obligationInDropdownTypesCheck && obligationStylingCheck)) {
      allComponentsValid = false;
    }
  } catch (error) {
    console.error('❌ AdminConsole check error:', error.message);
    allComponentsValid = false;
  }
  
  return allComponentsValid;
}

// 4. Check that all components are properly linked
console.log('\n4. COMPONENT LINKING CHECK');

function verifyComponentLinking() {
  try {
    // Check that AdminConsole imports the correct component
    const adminConsoleIndexPath = path.join(__dirname, 'client', 'src', 'components', 'AdminConsole.js');
    const adminConsoleIndexContent = fs.readFileSync(adminConsoleIndexPath, 'utf8');
    
    const importsCorrectComponent = adminConsoleIndexContent.includes('AdminConsole_Commit737cdc2');
    console.log('✅ AdminConsole.js imports AdminConsole_Commit737cdc2:', importsCorrectComponent);
    
    return importsCorrectComponent;
  } catch (error) {
    console.error('❌ Component linking check error:', error.message);
    return false;
  }
}

// Run all checks
async function runVerification() {
  console.log('Starting verification...\n');
  
  const databaseValid = await verifyDatabase();
  const apiRoutesValid = verifyAPIRoutes();
  const frontendComponentsValid = verifyFrontendComponents();
  const componentLinkingValid = verifyComponentLinking();
  
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log('✅ Database values:', databaseValid);
  console.log('✅ API routes:', apiRoutesValid);
  console.log('✅ Frontend components:', frontendComponentsValid);
  console.log('✅ Component linking:', componentLinkingValid);
  
  const allValid = databaseValid && apiRoutesValid && frontendComponentsValid && componentLinkingValid;
  
  if (allValid) {
    console.log('\n🎉 ALL CHECKS PASSED! The Obligation implementation should be working correctly.');
    console.log('\n📋 To verify in the application:');
    console.log('   1. Navigate to https://d-nothi-zenith.vercel.app/tasks');
    console.log('   2. Go to the "Create Task" tab and check for Obligation dropdown');
    console.log('   3. Edit an existing task and check for Obligation dropdown');
    console.log('   4. Navigate to https://d-nothi-zenith.vercel.app/my-tasks');
    console.log('   5. Edit a task and check for Obligation dropdown');
    console.log('   6. Navigate to https://d-nothi-zenith.vercel.app/admin');
    console.log('   7. Go to Dropdown Management and verify "Obligation" is in the Type dropdown');
  } else {
    console.log('\n❌ SOME CHECKS FAILED! Please review the output above for specific issues.');
  }
  
  return allValid;
}

// Run the verification
runVerification().then(success => {
  if (success) {
    console.log('\n✅ Verification completed successfully!');
  } else {
    console.log('\n❌ Verification completed with issues!');
  }
});