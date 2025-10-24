// Script to verify Obligation implementation across all components
const fs = require('fs');
const path = require('path');

console.log('Verifying Obligation implementation across all components...\n');

// Check if Obligation is included in dropdownTypes in AdminConsole
const adminConsolePath = path.join(__dirname, 'client/src/components/AdminConsole_Commit737cdc2.js');
if (fs.existsSync(adminConsolePath)) {
  const adminConsoleContent = fs.readFileSync(adminConsolePath, 'utf8');
  if (adminConsoleContent.includes("'Obligation'")) {
    console.log('✓ AdminConsole: Obligation found in dropdownTypes');
  } else {
    console.log('✗ AdminConsole: Obligation NOT found in dropdownTypes');
  }
} else {
  console.log('✗ AdminConsole file not found');
}

// Check if Obligation dropdown is implemented in TaskManagement
const taskManagementPath = path.join(__dirname, 'client/src/components/TaskManagement.js');
if (fs.existsSync(taskManagementPath)) {
  const taskManagementContent = fs.readFileSync(taskManagementPath, 'utf8');
  if (taskManagementContent.includes('Obligation') && taskManagementContent.includes('obligations')) {
    console.log('✓ TaskManagement: Obligation dropdown implemented');
  } else {
    console.log('✗ TaskManagement: Obligation dropdown NOT implemented');
  }
} else {
  console.log('✗ TaskManagement file not found');
}

// Check if Obligation dropdown is implemented in AgentDashboard
const agentDashboardPath = path.join(__dirname, 'client/src/components/AgentDashboard.js');
if (fs.existsSync(agentDashboardPath)) {
  const agentDashboardContent = fs.readFileSync(agentDashboardPath, 'utf8');
  if (agentDashboardContent.includes('Obligation') && agentDashboardContent.includes('editObligations')) {
    console.log('✓ AgentDashboard: Obligation dropdown implemented');
  } else {
    console.log('✗ AgentDashboard: Obligation dropdown NOT implemented');
  }
} else {
  console.log('✗ AgentDashboard file not found');
}

// Check if Obligation dropdown is implemented in ModernTaskLogger
const modernTaskLoggerPath = path.join(__dirname, 'client/src/components/ModernTaskLogger.js');
if (fs.existsSync(modernTaskLoggerPath)) {
  const modernTaskLoggerContent = fs.readFileSync(modernTaskLoggerPath, 'utf8');
  if (modernTaskLoggerContent.includes('Obligation') && modernTaskLoggerContent.includes('obligations')) {
    console.log('✓ ModernTaskLogger: Obligation dropdown implemented');
  } else {
    console.log('✗ ModernTaskLogger: Obligation dropdown NOT implemented');
  }
} else {
  console.log('✗ ModernTaskLogger file not found');
}

// Check if Obligation values exist in database
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);
db.get("SELECT COUNT(*) as count FROM dropdowns WHERE type = 'Obligation' AND isActive = 1", (err, row) => {
  if (err) {
    console.error('Error checking Obligation values in database:', err.message);
  } else {
    if (row.count > 0) {
      console.log(`✓ Database: ${row.count} Obligation values found`);
    } else {
      console.log('✗ Database: No Obligation values found');
    }
  }
  
  // Close database connection
  db.close();
  
  console.log('\nVerification complete.');
});