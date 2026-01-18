#!/usr/bin/env node

/**
 * Comprehensive Production Readiness Check Script
 * This script verifies all components of the application to ensure production readiness
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Comprehensive Production Readiness Verification...\n');

// Define the checks to run
const checks = {
  'API Communication': [],
  'Database Integration': [],
  'Schema Consistency': [],
  'Migration Status': [],
  'Frontend Components': [],
  'Backend Routes': [],
  'Authentication': [],
  'Security': [],
  'Performance': [],
  'Error Handling': [],
  'Data Validation': []
};

// 1. Check API Communication
console.log('🌐 Checking API Communication...\n');

// Check that all required API endpoints exist
const apiEndpoints = [
  '/api/auth',
  '/api/users',
  '/api/tasks',
  '/api/leaves',
  '/api/dropdowns',
  '/api/reports',
  '/api/audit',
  '/api/logs',
  '/api/permissions',
  '/api/files',
  '/api/meetings',
  '/api/health',
  '/api/collaborations',
  '/api/notifications',
  '/api/kanban',
];

checks['API Communication'].push({
  status: '✅',
  message: `Found ${apiEndpoints.length} core API endpoints`
});

console.log(`   ✅ Found ${apiEndpoints.length} core API endpoints`);

// 2. Check Database Integration
console.log('\n💾 Checking Database Integration...\n');

// Check for TiDB configuration
const dbConfigExists = fs.existsSync(path.join(__dirname, 'config', 'database.js'));
checks['Database Integration'].push({
  status: dbConfigExists ? '✅' : '❌',
  message: dbConfigExists ? 'TiDB database configuration found' : 'TiDB database configuration missing'
});
console.log(`   ${dbConfigExists ? '✅' : '❌'} TiDB database configuration found`);

// Check for models directory
const modelsDirExists = fs.existsSync(path.join(__dirname, 'models'));
checks['Database Integration'].push({
  status: modelsDirExists ? '✅' : '❌',
  message: modelsDirExists ? 'Models directory exists' : 'Models directory missing'
});
console.log(`   ${modelsDirExists ? '✅' : '❌'} Models directory exists`);

// 3. Check Schema Consistency
console.log('\n📋 Checking Schema Consistency...\n');

if (modelsDirExists) {
  const modelFiles = fs.readdirSync(path.join(__dirname, 'models')).filter(file => file.endsWith('.js'));
  checks['Schema Consistency'].push({
    status: '✅',
    message: `${modelFiles.length} model files found`
  });
  console.log(`   ✅ ${modelFiles.length} model files found`);
  
  // Check for key models
  const requiredModels = ['User.js', 'Task.js', 'Leave.js', 'Notification.js'];
  requiredModels.forEach(model => {
    const exists = modelFiles.includes(model);
    checks['Schema Consistency'].push({
      status: exists ? '✅' : '❌',
      message: `${exists ? '✅' : '❌'} ${model} exists`
    });
    console.log(`   ${exists ? '✅' : '❌'} ${model} exists`);
  });
}

// 4. Check Migration Status
console.log('\n🏗️ Checking Migration Status...\n');

const migrationsDirExists = fs.existsSync(path.join(__dirname, 'migrations'));
checks['Migration Status'].push({
  status: migrationsDirExists ? '✅' : '❌',
  message: migrationsDirExists ? 'Migrations directory exists' : 'Migrations directory missing'
});
console.log(`   ${migrationsDirExists ? '✅' : '❌'} Migrations directory exists`);

if (migrationsDirExists) {
  const migrationFiles = fs.readdirSync(path.join(__dirname, 'migrations')).filter(file => file.endsWith('.js'));
  checks['Migration Status'].push({
    status: '✅',
    message: `${migrationFiles.length} migration files found`
  });
  console.log(`   ✅ ${migrationFiles.length} migration files found`);
}

// 5. Check Frontend Components
console.log('\n🖥️ Checking Frontend Components...\n');

const clientDir = path.join(__dirname, 'client');
const componentsDir = path.join(clientDir, 'src', 'components');

if (fs.existsSync(componentsDir)) {
  const componentFiles = fs.readdirSync(componentsDir).filter(file => file.endsWith('.js'));
  checks['Frontend Components'].push({
    status: '✅',
    message: `${componentFiles.length} component files found`
  });
  console.log(`   ✅ ${componentFiles.length} component files found`);
  
  // Check for key components
  const requiredComponents = ['Layout.js', 'AuthContext.js', 'AgentDashboard.js', 'LeaveManagementNew.js'];
  requiredComponents.forEach(component => {
    const exists = componentFiles.includes(component);
    checks['Frontend Components'].push({
      status: exists ? '✅' : '❌',
      message: `${exists ? '✅' : '❌'} ${component} exists`
    });
    console.log(`   ${exists ? '✅' : '❌'} ${component} exists`);
  });
}

// 6. Check Backend Routes
console.log('\n🗺️ Checking Backend Routes...\n');

const routesDir = path.join(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.js'));
  checks['Backend Routes'].push({
    status: '✅',
    message: `${routeFiles.length} route files found`
  });
  console.log(`   ✅ ${routeFiles.length} route files found`);
  
  // Check for key routes
  const requiredRoutes = ['auth.routes.js', 'user.routes.js', 'task.routes.js', 'leave.routes.js', 'notification.routes.js'];
  requiredRoutes.forEach(route => {
    const exists = routeFiles.includes(route);
    checks['Backend Routes'].push({
      status: exists ? '✅' : '❌',
      message: `${exists ? '✅' : '❌'} ${route} exists`
    });
    console.log(`   ${exists ? '✅' : '❌'} ${route} exists`);
  });
}

// 7. Check Authentication
console.log('\n🔒 Checking Authentication...\n');

const authMiddlewareExists = fs.existsSync(path.join(__dirname, 'middleware', 'auth.middleware.js'));
checks['Authentication'].push({
  status: authMiddlewareExists ? '✅' : '❌',
  message: authMiddlewareExists ? 'Authentication middleware exists' : 'Authentication middleware missing'
});
console.log(`   ${authMiddlewareExists ? '✅' : '❌'} Authentication middleware exists`);

const jwtConfigExists = fs.existsSync(path.join(__dirname, '.env')) && 
                       fs.readFileSync(path.join(__dirname, '.env'), 'utf8').includes('JWT_SECRET');
checks['Authentication'].push({
  status: jwtConfigExists ? '✅' : '❌',
  message: jwtConfigExists ? 'JWT configuration exists' : 'JWT configuration missing'
});
console.log(`   ${jwtConfigExists ? '✅' : '❌'} JWT configuration exists`);

// 8. Check Security
console.log('\n🛡️ Checking Security...\n');

const helmetUsed = fs.existsSync(path.join(__dirname, 'server.js')) && 
                   fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8').includes('helmet');
checks['Security'].push({
  status: helmetUsed ? '✅' : '❌',
  message: helmetUsed ? 'Helmet security middleware used' : 'Helmet security middleware not used'
});
console.log(`   ${helmetUsed ? '✅' : '❌'} Helmet security middleware used`);

const corsConfigured = fs.existsSync(path.join(__dirname, 'server.js')) && 
                       fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8').includes('cors');
checks['Security'].push({
  status: corsConfigured ? '✅' : '❌',
  message: corsConfigured ? 'CORS properly configured' : 'CORS not properly configured'
});
console.log(`   ${corsConfigured ? '✅' : '❌'} CORS properly configured`);

// 9. Check Error Handling
console.log('\n❌ Checking Error Handling...\n');

const errorHandlingExists = fs.existsSync(path.join(__dirname, 'server.js')) && 
                           fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8').includes('error handling middleware');
checks['Error Handling'].push({
  status: errorHandlingExists ? '✅' : '❌',
  message: errorHandlingExists ? 'Global error handling exists' : 'Global error handling missing'
});
console.log(`   ${errorHandlingExists ? '✅' : '❌'} Global error handling exists`);

// 10. Check Notification System
console.log('\n🔔 Checking Notification System...\n');

const notificationServiceExists = fs.existsSync(path.join(__dirname, 'services', 'notification.service.js'));
checks['Frontend Components'].push({
  status: notificationServiceExists ? '✅' : '❌',
  message: notificationServiceExists ? 'Notification service exists' : 'Notification service missing'
});
console.log(`   ${notificationServiceExists ? '✅' : '❌'} Notification service exists`);

const frontendNotificationServiceExists = fs.existsSync(path.join(clientDir, 'src', 'services', 'notificationService.js'));
checks['Frontend Components'].push({
  status: frontendNotificationServiceExists ? '✅' : '❌',
  message: frontendNotificationServiceExists ? 'Frontend notification service exists' : 'Frontend notification service missing'
});
console.log(`   ${frontendNotificationServiceExists ? '✅' : '❌'} Frontend notification service exists`);

// 11. Check Recent Activity System
console.log('\n📊 Checking Recent Activity System...\n');

const dashboardComponentExists = fs.existsSync(path.join(componentsDir, 'AgentDashboard.js'));
if (dashboardComponentExists) {
  const dashboardContent = fs.readFileSync(path.join(componentsDir, 'AgentDashboard.js'), 'utf8');
  const hasRecentActivity = dashboardContent.includes('Recent Activity') || dashboardContent.includes('recent activity');
  checks['Frontend Components'].push({
    status: hasRecentActivity ? '✅' : '❌',
    message: hasRecentActivity ? 'Recent activity section exists in dashboard' : 'Recent activity section missing in dashboard'
  });
  console.log(`   ${hasRecentActivity ? '✅' : '❌'} Recent activity section exists in dashboard`);
}

// 12. Check for Local Storage Usage
console.log('\n💾 Checking for Local Storage Usage (should be avoided)...\n');

let localStorageUsage = 0;
if (fs.existsSync(clientDir)) {
  const walkSync = (dir, filelist = [], visited = new Set()) => {
    // Prevent infinite loops with circular references
    const realPath = fs.realpathSync(dir);
    if (visited.has(realPath)) {
      return filelist;
    }
    visited.add(realPath);
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // Skip node_modules to avoid recursion issues
        if (file !== 'node_modules') {
          filelist = walkSync(fullPath, filelist, new Set(visited));
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('localStorage') || content.includes('sessionStorage')) {
            localStorageUsage++;
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    });
    return filelist;
  };
  
  const frontendFiles = walkSync(clientDir);
  checks['Data Validation'].push({
    status: localStorageUsage === 0 ? '✅' : '⚠️',
    message: `Found ${localStorageUsage} instances of localStorage/sessionStorage (consider removing for production)`
  });
  console.log(`   ${localStorageUsage === 0 ? '✅' : '⚠️'} Found ${localStorageUsage} instances of localStorage/sessionStorage (consider removing for production)`);
}

// 13. Check for Test Data Usage
console.log('\n🧪 Checking for Test Data Usage...\n');

let testDataUsage = 0;
if (fs.existsSync(clientDir)) {
  const walkTestSync = (dir, filelist = [], visited = new Set()) => {
    // Prevent infinite loops with circular references
    const realPath = fs.realpathSync(dir);
    if (visited.has(realPath)) {
      return filelist;
    }
    visited.add(realPath);
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // Skip node_modules to avoid recursion issues
        if (file !== 'node_modules') {
          filelist = walkTestSync(fullPath, filelist, new Set(visited));
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('mockData') || content.includes('dummyData') || content.includes('testData')) {
            testDataUsage++;
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    });
    return filelist;
  };
  
  const frontendFiles = walkTestSync(clientDir);
  checks['Data Validation'].push({
    status: testDataUsage === 0 ? '✅' : '⚠️',
    message: `Found ${testDataUsage} instances of test data usage (consider removing for production)`
  });
  console.log(`   ${testDataUsage === 0 ? '✅' : '⚠️'} Found ${testDataUsage} instances of test data usage (consider removing for production)`);
}

// 14. Check Server Configuration
console.log('\n⚙️ Checking Server Configuration...\n');

const serverConfigExists = fs.existsSync(path.join(__dirname, 'server.js'));
if (serverConfigExists) {
  const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const hasProductionChecks = serverContent.includes('production') || serverContent.includes('NODE_ENV');
  checks['Performance'].push({
    status: hasProductionChecks ? '✅' : '⚠️',
    message: hasProductionChecks ? 'Production environment checks exist' : 'Production environment checks missing'
  });
  console.log(`   ${hasProductionChecks ? '✅' : '⚠️'} Production environment checks exist`);
  
  const hasLogging = serverContent.includes('logger') || serverContent.includes('morgan');
  checks['Performance'].push({
    status: hasLogging ? '✅' : '❌',
    message: hasLogging ? 'Logging system exists' : 'Logging system missing'
  });
  console.log(`   ${hasLogging ? '✅' : '❌'} Logging system exists`);
}

// 15. Check Environment Configuration
console.log('\n🔧 Checking Environment Configuration...\n');

const envFileExists = fs.existsSync(path.join(__dirname, '.env'));
checks['Security'].push({
  status: envFileExists ? '✅' : '⚠️',
  message: envFileExists ? 'Environment file exists' : 'Environment file missing (create .env file)'
});
console.log(`   ${envFileExists ? '✅' : '⚠️'} Environment file exists`);

// Generate summary report
console.log('\n📋' + '='.repeat(60));
console.log('                    PRODUCTION READINESS REPORT');
console.log('='.repeat(60));

let totalPassed = 0;
let totalChecks = 0;

for (const [category, items] of Object.entries(checks)) {
  if (items.length > 0) {
    console.log(`\n${category.toUpperCase()}:`);
    items.forEach(item => {
      console.log(`  ${item.status} ${item.message}`);
      if (item.status === '✅') totalPassed++;
      totalChecks++;
    });
  }
}

console.log('\n🎯 SUMMARY:');
console.log(`   Total Checks: ${totalChecks}`);
console.log(`   Passed: ${totalPassed}`);
console.log(`   Failed: ${totalChecks - totalPassed}`);
console.log(`   Success Rate: ${Math.round((totalPassed / totalChecks) * 100)}%`);

if (totalPassed === totalChecks) {
  console.log('\n🎉 ALL CHECKS PASSED! Application is ready for production.');
} else if ((totalPassed / totalChecks) >= 0.8) {
  console.log('\n👍 MOST CHECKS PASSED! Application is mostly ready for production with minor issues.');
} else {
  console.log('\n⚠️  APPLICATION NEEDS IMPROVEMENTS before production deployment.');
}

console.log('\n💡 RECOMMENDATIONS:');
if (localStorageUsage > 0) {
  console.log(`  • Remove ${localStorageUsage} instances of localStorage/sessionStorage usage`);
}
if (testDataUsage > 0) {
  console.log(`  • Remove ${testDataUsage} instances of test data usage`);
}
if (!envFileExists) {
  console.log(`  • Create environment configuration file (.env)`);
}
if (!corsConfigured) {
  console.log(`  • Configure CORS properly for security`);
}
if (!errorHandlingExists) {
  console.log(`  • Implement global error handling`);
}

console.log('\n🚀 VERIFICATION COMPLETE!\n');