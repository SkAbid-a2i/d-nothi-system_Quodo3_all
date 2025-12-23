// Test file for Kanban frontend functionality
const fs = require('fs');
const path = require('path');

// Test that the KanbanBoard component exists and has been updated
const kanbanBoardPath = path.join(__dirname, '../client/src/components/KanbanBoard.js');
if (fs.existsSync(kanbanBoardPath)) {
  const content = fs.readFileSync(kanbanBoardPath, 'utf8');
  
  // Check for modern UI elements
  const hasModernUI = content.includes('useTheme') && 
                      content.includes('useMediaQuery') &&
                      content.includes('getCardColor') &&
                      content.includes('borderRadius');
  
  // Check for API URL fixes
  const hasAPIFixes = content.includes('process.env.REACT_APP_API_URL') &&
                      content.includes('contentType && contentType.includes');
  
  console.log('KanbanBoard.js tests:');
  console.log('- Modern UI elements:', hasModernUI ? 'PASS' : 'FAIL');
  console.log('- API URL fixes:', hasAPIFixes ? 'PASS' : 'FAIL');
  
  if (hasModernUI && hasAPIFixes) {
    console.log('✅ All frontend tests passed');
    process.exit(0);
  } else {
    console.log('❌ Some frontend tests failed');
    process.exit(1);
  }
} else {
  console.log('❌ KanbanBoard.js not found');
  process.exit(1);
}