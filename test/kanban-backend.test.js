// Test file for Kanban backend functionality
const fs = require('fs');
const path = require('path');

// Test that the kanban routes have been updated
const kanbanRoutesPath = path.join(__dirname, '../routes/kanban.routes.js');
if (fs.existsSync(kanbanRoutesPath)) {
  const content = fs.readFileSync(kanbanRoutesPath, 'utf8');
  
  // Check for improved CORS configuration
  const hasImprovedCORS = content.includes('origin: function (origin, callback)') &&
                          content.includes('router.use(cors(corsOptions))') &&
                          content.includes('router.options');
  
  // Check for consistent status values
  const hasConsistentStatus = content.includes("status: status || 'backlog'") &&
                              !content.includes("status: status || 'Backlog'");
  
  console.log('kanban.routes.js tests:');
  console.log('- Improved CORS configuration:', hasImprovedCORS ? 'PASS' : 'FAIL');
  console.log('- Consistent status values:', hasConsistentStatus ? 'PASS' : 'FAIL');
  
  if (hasImprovedCORS && hasConsistentStatus) {
    console.log('✅ All backend tests passed');
    process.exit(0);
  } else {
    console.log('❌ Some backend tests failed');
    process.exit(1);
  }
} else {
  console.log('❌ kanban.routes.js not found');
  process.exit(1);
}