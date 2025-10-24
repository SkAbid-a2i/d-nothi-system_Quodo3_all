// Comprehensive debug script to check all components of the Obligation dropdown implementation

// 1. Check database values
console.log('=== DATABASE CHECK ===');
const sequelize = require('./config/database');
const Dropdown = require('./models/Dropdown');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const obligations = await Dropdown.findAll({ 
      where: { type: 'Obligation', isActive: true },
      order: [['value', 'ASC']]
    });
    
    console.log('📊 Obligation values in database:', obligations.length);
    obligations.forEach((obligation, index) => {
      console.log(`  ${index + 1}. ${obligation.value}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

// 2. Check API routes file
console.log('\n=== API ROUTES CHECK ===');
const fs = require('fs');
const path = require('path');

try {
  const dropdownRoutesPath = path.join(__dirname, 'routes', 'dropdown.routes.js');
  const dropdownRoutesContent = fs.readFileSync(dropdownRoutesPath, 'utf8');
  
  // Check if Obligation is included in the valid types
  const validTypesCheck = dropdownRoutesContent.includes("['Source', 'Category', 'Service', 'Office', 'Obligation']");
  console.log('✅ Valid types include Obligation:', validTypesCheck);
  
  // Check if Obligation route exists
  const obligationRouteCheck = dropdownRoutesContent.includes("router.get('/:type'");
  console.log('✅ Obligation route exists:', obligationRouteCheck);
  
} catch (error) {
  console.error('❌ API routes check error:', error.message);
}

// 3. Check frontend API service
console.log('\n=== FRONTEND API SERVICE CHECK ===');
try {
  const apiServicePath = path.join(__dirname, 'client', 'src', 'services', 'api.js');
  const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
  
  // Check if dropdownAPI.getDropdownValues exists
  const dropdownAPICheck = apiServiceContent.includes('getDropdownValues: (type, parentValue) => api.get(`/dropdowns/${type}`');
  console.log('✅ dropdownAPI.getDropdownValues exists:', dropdownAPICheck);
  
} catch (error) {
  console.error('❌ Frontend API service check error:', error.message);
}

// 4. Check AgentDashboard implementation
console.log('\n=== AGENT DASHBOARD CHECK ===');
try {
  const agentDashboardPath = path.join(__dirname, 'client', 'src', 'components', 'AgentDashboard.js');
  const agentDashboardContent = fs.readFileSync(agentDashboardPath, 'utf8');
  
  // Check if editObligations state exists
  const editObligationsStateCheck = agentDashboardContent.includes('editObligations, setEditObligations');
  console.log('✅ editObligations state exists:', editObligationsStateCheck);
  
  // Check if Obligation dropdown is implemented in edit dialog
  const obligationEditDropdownCheck = agentDashboardContent.includes('Add Obligation Dropdown');
  console.log('✅ Obligation dropdown in edit dialog:', obligationEditDropdownCheck);
  
  // Check if fetchDropdownValues includes Obligation
  const fetchObligationCheck = agentDashboardContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
  console.log('✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
  
} catch (error) {
  console.error('❌ Agent Dashboard check error:', error.message);
}

// 5. Check TaskManagement implementation
console.log('\n=== TASK MANAGEMENT CHECK ===');
try {
  const taskManagementPath = path.join(__dirname, 'client', 'src', 'components', 'TaskManagement.js');
  const taskManagementContent = fs.readFileSync(taskManagementPath, 'utf8');
  
  // Check if obligations state exists
  const obligationsStateCheck = taskManagementContent.includes('obligations, setObligations');
  console.log('✅ obligations state exists:', obligationsStateCheck);
  
  // Check if Obligation dropdown is implemented in create form
  const obligationCreateDropdownCheck = taskManagementContent.includes('DEBUG: Obligation Dropdown');
  console.log('✅ Obligation dropdown in create form:', obligationCreateDropdownCheck);
  
  // Check if Obligation dropdown is implemented in edit form
  const obligationEditDropdownCheck = taskManagementContent.includes('DEBUG: Edit Obligation Dropdown');
  console.log('✅ Obligation dropdown in edit form:', obligationEditDropdownCheck);
  
  // Check if fetchDropdownValues includes Obligation
  const fetchObligationCheck = taskManagementContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
  console.log('✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
  
} catch (error) {
  console.error('❌ Task Management check error:', error.message);
}

// 6. Check ModernTaskLogger implementation
console.log('\n=== MODERN TASK LOGGER CHECK ===');
try {
  const modernTaskLoggerPath = path.join(__dirname, 'client', 'src', 'components', 'ModernTaskLogger.js');
  const modernTaskLoggerContent = fs.readFileSync(modernTaskLoggerPath, 'utf8');
  
  // Check if obligations state exists
  const obligationsStateCheck = modernTaskLoggerContent.includes('obligations, setObligations');
  console.log('✅ obligations state exists:', obligationsStateCheck);
  
  // Check if Obligation dropdown is implemented in create form
  const obligationCreateDropdownCheck = modernTaskLoggerContent.includes('Add Obligation Dropdown');
  console.log('✅ Obligation dropdown in create form:', obligationCreateDropdownCheck);
  
  // Check if Obligation dropdown is implemented in edit form
  const obligationEditDropdownCheck = modernTaskLoggerContent.includes('Add Obligation Dropdown');
  console.log('✅ Obligation dropdown in edit form:', obligationEditDropdownCheck);
  
  // Check if fetchDropdownValues includes Obligation
  const fetchObligationCheck = modernTaskLoggerContent.includes('dropdownAPI.getDropdownValues(\'Obligation\'');
  console.log('✅ fetchDropdownValues includes Obligation:', fetchObligationCheck);
  
} catch (error) {
  console.error('❌ Modern Task Logger check error:', error.message);
}

// 7. Check AdminConsole implementation
console.log('\n=== ADMIN CONSOLE CHECK ===');
try {
  const adminConsolePath = path.join(__dirname, 'client', 'src', 'components', 'AdminConsole_Commit737cdc2.js');
  const adminConsoleContent = fs.readFileSync(adminConsolePath, 'utf8');
  
  // Check if Obligation is in dropdownTypes
  const obligationInDropdownTypesCheck = adminConsoleContent.includes('\'Obligation\'');
  console.log('✅ Obligation in dropdownTypes:', obligationInDropdownTypesCheck);
  
  // Check if Obligation styling exists
  const obligationStylingCheck = adminConsoleContent.includes('dropdown.type === \'Obligation\'');
  console.log('✅ Obligation styling exists:', obligationStylingCheck);
  
} catch (error) {
  console.error('❌ Admin Console check error:', error.message);
}

// Run database check
checkDatabase();