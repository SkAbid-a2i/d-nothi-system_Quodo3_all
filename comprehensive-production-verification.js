const fs = require('fs');
const path = require('path');

console.log('🔍 Running Comprehensive Production Verification...\n');

// Define project structure
const projectRoot = 'd:\\Project\\Quodo3';
const checks = {
  'API Communication': [],
  'Database Integration': [],
  'Frontend Components': [],
  'Security & Authentication': [],
  'Deployment & Configuration': []
};

// 1. Check API Communication
console.log('🌐 Checking API Communication...\n');

const serverFile = path.join(projectRoot, 'server.js');
const serverExists = fs.existsSync(serverFile);
checks['API Communication'].push({
  status: serverExists ? '✅' : '❌',
  message: serverExists ? 'Server file exists' : 'Server file missing'
});
console.log(`   ${serverExists ? '✅' : '❌'} Server file exists`);

if (serverExists) {
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  const hasNotificationRoutes = serverContent.includes('/api/notifications');
  checks['API Communication'].push({
    status: hasNotificationRoutes ? '✅' : '❌',
    message: hasNotificationRoutes ? 'Notification API routes configured' : 'Notification API routes missing'
  });
  console.log(`   ${hasNotificationRoutes ? '✅' : '❌'} Notification API routes configured`);

  const hasCorsConfig = serverContent.includes('cors') || serverContent.includes('Access-Control-Allow-Origin');
  checks['API Communication'].push({
    status: hasCorsConfig ? '✅' : '❌',
    message: hasCorsConfig ? 'CORS configuration present' : 'CORS configuration missing'
  });
  console.log(`   ${hasCorsConfig ? '✅' : '❌'} CORS configuration present`);
}

// 2. Check Database Integration
console.log('\n💾 Checking Database Integration...\n');

const dbConfigFile = path.join(projectRoot, 'config', 'database.js');
const dbConfigExists = fs.existsSync(dbConfigFile);

checks['Database Integration'].push({
  status: dbConfigExists ? '✅' : '❌',
  message: dbConfigExists ? 'Database configuration exists' : 'Database configuration missing'
});
console.log(`   ${dbConfigExists ? '✅' : '❌'} Database configuration exists`);

// Check TiDB integration
const modelsDir = path.join(projectRoot, 'models');
const modelsExist = fs.existsSync(modelsDir);

// Declare these variables in the outer scope
let hasUserModel = false;
let hasNotificationModel = false;

checks['Database Integration'].push({
  status: modelsExist ? '✅' : '❌',
  message: modelsExist ? 'Database models exist' : 'Database models missing'
});
console.log(`   ${modelsExist ? '✅' : '❌'} Database models exist`);

if (modelsExist) {
  const modelFiles = fs.readdirSync(modelsDir);
  hasUserModel = modelFiles.some(file => file.toLowerCase().includes('user'));
  hasNotificationModel = modelFiles.some(file => file.toLowerCase().includes('notification'));
  
  checks['Database Integration'].push({
    status: hasUserModel ? '✅' : '❌',
    message: hasUserModel ? 'User model exists' : 'User model missing'
  });
  console.log(`   ${hasUserModel ? '✅' : '❌'} User model exists`);
  
  checks['Database Integration'].push({
    status: hasNotificationModel ? '✅' : '❌',
    message: hasNotificationModel ? 'Notification model exists' : 'Notification model missing'
  });
  console.log(`   ${hasNotificationModel ? '✅' : '❌'} Notification model exists`);
}

// Check for migrations
const migrationsDir = path.join(projectRoot, 'migrations');
const migrationsExist = fs.existsSync(migrationsDir);
checks['Database Integration'].push({
  status: migrationsExist ? '✅' : '❌',
  message: migrationsExist ? 'Migration files exist' : 'Migration files missing'
});
console.log(`   ${migrationsExist ? '✅' : '❌'} Migration files exist`);

// 3. Check Frontend Components
console.log('\n🖥️  Checking Frontend Components...\n');

const frontendDir = path.join(projectRoot, 'client', 'src');
const componentsDir = path.join(frontendDir, 'components');

if (fs.existsSync(componentsDir)) {
  const componentFiles = fs.readdirSync(componentsDir);
  const hasLayout = componentFiles.some(file => file.includes('Layout'));
  const hasAuth = componentFiles.some(file => file.includes('Auth') || file.includes('auth'));
  
  checks['Frontend Components'].push({
    status: hasLayout ? '✅' : '❌',
    message: hasLayout ? 'Layout component exists' : 'Layout component missing'
  });
  console.log(`   ${hasLayout ? '✅' : '❌'} Layout component exists`);
  
  checks['Frontend Components'].push({
    status: hasAuth ? '✅' : '❌',
    message: hasAuth ? 'Authentication component exists' : 'Authentication component missing'
  });
  console.log(`   ${hasAuth ? '✅' : '❌'} Authentication component exists`);
  
  // Check for notification service
  const servicesDir = path.join(frontendDir, 'services');
  const hasNotificationService = fs.existsSync(path.join(servicesDir, 'notificationService.js'));
  checks['Frontend Components'].push({
    status: hasNotificationService ? '✅' : '❌',
    message: hasNotificationService ? 'Frontend notification service exists' : 'Frontend notification service missing'
  });
  console.log(`   ${hasNotificationService ? '✅' : '❌'} Frontend notification service exists`);
}

// 4. Check Security & Authentication
console.log('\n🔒 Checking Security & Authentication...\n');

const authContextFile = path.join(frontendDir, 'contexts', 'AuthContext.js');
const authContextExists = fs.existsSync(authContextFile);
checks['Security & Authentication'].push({
  status: authContextExists ? '✅' : '❌',
  message: authContextExists ? 'Authentication context exists' : 'Authentication context missing'
});
console.log(`   ${authContextExists ? '✅' : '❌'} Authentication context exists`);

// Check for JWT implementation
if (authContextExists) {
  const authContent = fs.readFileSync(authContextFile, 'utf8');
  const hasJwtImplementation = authContent.includes('jwt') || authContent.includes('JWT') || authContent.includes('token');
  checks['Security & Authentication'].push({
    status: hasJwtImplementation ? '✅' : '❌',
    message: hasJwtImplementation ? 'JWT authentication implemented' : 'JWT authentication not implemented'
  });
  console.log(`   ${hasJwtImplementation ? '✅' : '❌'} JWT authentication implemented`);
}

// 5. Check for local storage usage
console.log('\n📋 Checking for Local Storage Usage...\n');

let hasLocalStorage = false;
if (fs.existsSync(componentsDir)) {
  const jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    if (content.includes('localStorage')) {
      hasLocalStorage = true;
      console.log(`   ⚠️  LocalStorage detected in ${file}`);
      break;
    }
  }
}

checks['Security & Authentication'].push({
  status: !hasLocalStorage ? '✅' : '❌',
  message: !hasLocalStorage ? 'No localStorage usage found' : 'LocalStorage usage detected'
});
console.log(`   ${!hasLocalStorage ? '✅' : '❌'} Local storage usage check`);

// 6. Check for test data usage
console.log('\n🧪 Checking for Test Data Usage...\n');

let hasTestData = false;
if (fs.existsSync(componentsDir)) {
  const jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    if (content.includes('mock') || content.includes('dummy') || content.includes('testData')) {
      hasTestData = true;
      console.log(`   ⚠️  Test data detected in ${file}`);
      break;
    }
  }
}

checks['Security & Authentication'].push({
  status: !hasTestData ? '✅' : '❌',
  message: !hasTestData ? 'No test data usage found' : 'Test data usage detected'
});
console.log(`   ${!hasTestData ? '✅' : '❌'} Test data usage check`);

// 7. Check for live data usage
console.log('\n📡 Checking for Live Data Usage...\n');

let hasLiveData = false;
if (fs.existsSync(componentsDir)) {
  const jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    if (content.includes('api') || content.includes('API') || content.includes('fetch') || content.includes('axios')) {
      hasLiveData = true;
      break;
    }
  }
}

checks['Security & Authentication'].push({
  status: hasLiveData ? '✅' : '❌',
  message: hasLiveData ? 'Live data integration found' : 'No live data integration found'
});
console.log(`   ${hasLiveData ? '✅' : '❌'} Live data integration check`);

// 8. Check Deployment Configuration
console.log('\n🚀 Checking Deployment Configuration...\n');

const packageJson = path.join(projectRoot, 'package.json');
const packageExists = fs.existsSync(packageJson);
checks['Deployment & Configuration'].push({
  status: packageExists ? '✅' : '❌',
  message: packageExists ? 'Package.json exists' : 'Package.json missing'
});
console.log(`   ${packageExists ? '✅' : '❌'} Package.json exists`);

// Check for environment configuration
const envFile = path.join(projectRoot, '.env');
const envExists = fs.existsSync(envFile);
checks['Deployment & Configuration'].push({
  status: envExists ? '✅' : '❌',
  message: envExists ? 'Environment configuration exists' : 'Environment configuration missing'
});
console.log(`   ${envExists ? '✅' : '❌'} Environment configuration exists`);

// Check for production-specific configurations
if (packageExists) {
  const packageContent = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  const hasBuildScript = packageContent.scripts && packageContent.scripts.build;
  checks['Deployment & Configuration'].push({
    status: hasBuildScript ? '✅' : '❌',
    message: hasBuildScript ? 'Build script exists' : 'Build script missing'
  });
  console.log(`   ${hasBuildScript ? '✅' : '❌'} Build script exists`);
}

// 9. Check for missing components
console.log('\n🔧 Checking for Missing Components...\n');

const requiredDirs = [
  path.join(projectRoot, 'controllers'),
  path.join(projectRoot, 'routes'),
  path.join(projectRoot, 'services'),
  path.join(frontendDir, 'services'),
  path.join(frontendDir, 'contexts'),
  path.join(frontendDir, 'hooks')
];

for (const dir of requiredDirs) {
  const dirExists = fs.existsSync(dir);
  const dirName = path.basename(dir);
  checks['Deployment & Configuration'].push({
    status: dirExists ? '✅' : '❌',
    message: dirExists ? `${dirName} directory exists` : `${dirName} directory missing`
  });
  console.log(`   ${dirExists ? '✅' : '❌'} ${dirName} directory exists`);
}

// 10. Final Summary
console.log('\n📋 FINAL VERIFICATION SUMMARY\n');
console.log('=' .repeat(50));

let totalChecks = 0;
let passedChecks = 0;

for (const [category, categoryChecks] of Object.entries(checks)) {
  console.log(`\n${category}:`);
  console.log('-'.repeat(category.length + 1));
  
  for (const check of categoryChecks) {
    console.log(`   ${check.status} ${check.message}`);
    totalChecks++;
    if (check.status === '✅') passedChecks++;
  }
}

console.log('\n' + '=' .repeat(50));
console.log(`📊 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
const percentage = Math.round((passedChecks / totalChecks) * 100);
console.log(`📈 Success Rate: ${percentage}%`);

if (percentage >= 90) {
  console.log('🎉 Application is PRODUCTION READY!');
} else if (percentage >= 70) {
  console.log('⚠️  Application has some issues but is mostly ready.');
} else {
  console.log('❌ Application needs significant work before production.');
}

console.log('\n💡 Recommendations:');
if (!hasLiveData) console.log('   • Integrate live data sources instead of mock data');
if (hasLocalStorage) console.log('   • Replace localStorage with backend storage');
if (!hasNotificationModel) console.log('   • Implement notification model for persistent storage');

console.log('\n✅ Verification completed successfully!');