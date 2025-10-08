// Test script to verify chart types functionality
const fs = require('fs');
const path = require('path');

console.log('Testing chart types functionality...\n');

// Check AgentDashboard component for chart implementations
const agentDashboardPath = path.join(__dirname, 'client/src/components/AgentDashboard.js');
const agentDashboardContent = fs.readFileSync(agentDashboardPath, 'utf8');

console.log('1. Checking chart type implementations...');

const chartTypes = ['bar', 'pie', 'donut', 'radial', 'line'];
let allChartTypesFound = true;

chartTypes.forEach(chartType => {
  if (agentDashboardContent.includes(`chartType === '${chartType}'`)) {
    console.log(`✅ ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart implementation found`);
  } else {
    console.log(`❌ ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart implementation missing`);
    allChartTypesFound = false;
  }
});

console.log('\n2. Checking chart type selection buttons...');
const chartButtons = ['BarChartIcon', 'PieChartIcon', 'DonutLargeIcon', 'LineChartIcon'];
let allButtonsFound = true;

chartButtons.forEach(button => {
  if (agentDashboardContent.includes(button)) {
    console.log(`✅ ${button} found`);
  } else {
    console.log(`❌ ${button} missing`);
    allButtonsFound = false;
  }
});

if (allChartTypesFound && allButtonsFound) {
  console.log('\n🎉 All chart types functionality is properly implemented!');
} else {
  console.log('\n❌ Some chart types functionality is missing or incomplete.');
}

console.log('\n3. Checking button placement...');
if (agentDashboardContent.includes('Box sx={{ display: \'flex\', justifyContent: \'flex-end\' }}')) {
  console.log('✅ Chart type buttons are properly positioned');
} else {
  console.log('❌ Chart type buttons may not be properly positioned');
}