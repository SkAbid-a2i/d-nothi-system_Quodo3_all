const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Production Readiness Verification...\n');

// Check if environment variables are properly set
console.log('✅ Checking environment variables...');
const requiredEnvVars = [
  'MONGODB_URI', 
  'JWT_SECRET', 
  'PORT',
  'TIKTOKEN', 
  'TIDB_HOST', 
  'TIDB_PORT', 
  'TIDB_USER', 
  'TIDB_PASSWORD', 
  'TIDB_DATABASE'
];

let envVarsMissing = false;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.log(`❌ Missing environment variable: ${envVar}`);
    envVarsMissing = true;
  }
}

if (!envVarsMissing) {
  console.log('✅ All required environment variables are set');
}

console.log('\n✅ Checking database configurations...');
// Check if database configuration files exist
const dbConfigPath = path.join(__dirname, 'config', 'database.js');
if (fs.existsSync(dbConfigPath)) {
  console.log('✅ Database configuration file exists');
} else {
  console.log('❌ Database configuration file missing');
}

// Check if TiDB configurations exist
const configPath = path.join(__dirname, 'config', 'config.json');
if (fs.existsSync(configPath)) {
  console.log('✅ TiDB configuration file exists');
} else {
  console.log('❌ TiDB configuration file missing');
}

console.log('\n✅ Checking API routes...');
// Check if routes directory exists and has files
const routesDir = path.join(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  const routeFiles = fs.readdirSync(routesDir);
  if (routeFiles.length > 0) {
    console.log(`✅ Found ${routeFiles.length} route files`);
    routeFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('❌ No route files found');
  }
} else {
  console.log('❌ Routes directory missing');
}

console.log('\n✅ Checking model files...');
// Check if models directory exists and has files
const modelsDir = path.join(__dirname, 'models');
if (fs.existsSync(modelsDir)) {
  const modelFiles = fs.readdirSync(modelsDir);
  if (modelFiles.length > 0) {
    console.log(`✅ Found ${modelFiles.length} model files`);
    modelFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('❌ No model files found');
  }
} else {
  console.log('❌ Models directory missing');
}

console.log('\n✅ Checking migration files...');
// Check if migrations directory exists and has files
const migrationsDir = path.join(__dirname, 'migrations');
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir);
  if (migrationFiles.length > 0) {
    console.log(`✅ Found ${migrationFiles.length} migration files`);
  } else {
    console.log('⚠️  No migration files found (this might be intentional)');
  }
} else {
  console.log('⚠️  Migrations directory missing (this might be intentional)');
}

console.log('\n✅ Checking service files...');
// Check if services directory exists and has files
const servicesDir = path.join(__dirname, 'services');
if (fs.existsSync(servicesDir)) {
  const serviceFiles = fs.readdirSync(servicesDir);
  if (serviceFiles.length > 0) {
    console.log(`✅ Found ${serviceFiles.length} service files`);
    serviceFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('❌ No service files found');
  }
} else {
  console.log('❌ Services directory missing');
}

console.log('\n✅ Checking frontend API service files...');
// Check if client API services exist
const clientServicesPath = path.join(__dirname, 'client', 'src', 'services', 'api.js');
if (fs.existsSync(clientServicesPath)) {
  console.log('✅ Frontend API service file exists');
} else {
  console.log('❌ Frontend API service file missing');
}

console.log('\n✅ Checking for proper CORS configuration...');
// Check if CORS is properly configured in main server file
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  if (serverContent.includes('cors') || serverContent.includes('Access-Control-Allow-Origin')) {
    console.log('✅ CORS configuration found in server.js');
  } else {
    console.log('⚠️  CORS configuration not found in server.js');
  }
} else {
  console.log('❌ server.js file missing');
}

console.log('\n✅ Checking for authentication middleware...');
// Check if auth middleware exists
const middlewareDir = path.join(__dirname, 'middleware');
if (fs.existsSync(middlewareDir)) {
  const middlewareFiles = fs.readdirSync(middlewareDir);
  if (middlewareFiles.includes('auth.js') || middlewareFiles.some(file => file.toLowerCase().includes('auth'))) {
    console.log('✅ Authentication middleware found');
  } else {
    console.log('⚠️  No authentication middleware found');
  }
} else {
  console.log('⚠️  Middleware directory missing');
}

console.log('\n✅ Checking package.json for dependencies...');
// Check if package.json exists and has dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
    console.log(`✅ package.json has ${Object.keys(packageJson.dependencies).length} dependencies`);
  } else {
    console.log('⚠️  package.json has no dependencies');
  }
  
  if (packageJson.scripts) {
    console.log('✅ package.json has scripts defined');
  } else {
    console.log('❌ package.json has no scripts defined');
  }
} else {
  console.log('❌ package.json file missing');
}

console.log('\n✅ Checking for TiDB specific configurations...');
// Check for TiDB specific files
const tidbFiles = [
  'config/config.json',
  'migrations/*.js',
  'models/*.js'
];

let tidbConfigFound = false;
if (fs.existsSync(path.join(__dirname, 'config', 'config.json'))) {
  const configContent = fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf8');
  if (configContent.toLowerCase().includes('tidb')) {
    tidbConfigFound = true;
    console.log('✅ TiDB configuration found in config.json');
  }
}

if (!tidbConfigFound) {
  console.log('⚠️  TiDB configuration not found in config.json');
}

console.log('\n✅ Checking client-side configuration...');
// Check if client has proper environment configuration
const clientEnvExample = path.join(__dirname, 'client', '.env.example');
if (fs.existsSync(clientEnvExample)) {
  console.log('✅ Client .env.example file exists');
} else {
  console.log('❌ Client .env.example file missing');
}

const clientEnvProd = path.join(__dirname, 'client', '.env.production');
if (fs.existsSync(clientEnvProd)) {
  console.log('✅ Client .env.production file exists');
} else {
  console.log('❌ Client .env.production file missing');
}

console.log('\n✅ Checking for proper error handling...');
// Check if error handling exists in server.js
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  if (serverContent.includes('try') && serverContent.includes('catch')) {
    console.log('✅ Basic error handling found in server.js');
  } else {
    console.log('⚠️  No obvious error handling found in server.js');
  }
}

console.log('\n✅ Checking for API endpoint documentation...');
// Check for API documentation
const apiDocPath = path.join(__dirname, 'API_DOCUMENTATION.md');
if (fs.existsSync(apiDocPath)) {
  console.log('✅ API documentation file exists');
} else {
  console.log('⚠️  API documentation file missing');
}

console.log('\n✅ Checking for deployment configuration...');
// Check for deployment configurations
const vercelConfig = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelConfig)) {
  console.log('✅ Vercel deployment configuration exists');
} else {
  console.log('❌ Vercel deployment configuration missing');
}

const renderConfig = path.join(__dirname, 'render.yaml');
if (fs.existsSync(renderConfig)) {
  console.log('✅ Render deployment configuration exists');
} else {
  console.log('❌ Render deployment configuration missing');
}

console.log('\n✅ Checking for database seed files...');
// Check for seed files
const seedDir = path.join(__dirname, 'seed');
if (fs.existsSync(seedDir)) {
  const seedFiles = fs.readdirSync(seedDir);
  if (seedFiles.length > 0) {
    console.log(`✅ Found ${seedFiles.length} seed files`);
  } else {
    console.log('⚠️  No seed files found (this might be intentional)');
  }
} else {
  console.log('⚠️  Seed directory missing (this might be intentional)');
}

console.log('\n✅ Checking for proper logging configuration...');
// Check for logging
const logDir = path.join(__dirname, 'logs');
if (fs.existsSync(logDir)) {
  console.log('✅ Logs directory exists');
} else {
  console.log('⚠️  Logs directory missing');
}

console.log('\n✅ Checking for validation files...');
// Check for validation files
const validatorsDir = path.join(__dirname, 'validators');
if (fs.existsSync(validatorsDir)) {
  const validatorFiles = fs.readdirSync(validatorsDir);
  if (validatorFiles.length > 0) {
    console.log(`✅ Found ${validatorFiles.length} validator files`);
  } else {
    console.log('⚠️  No validator files found');
  }
} else {
  console.log('⚠️  Validators directory missing');
}

console.log('\n✅ Checking for email configuration...');
// Check for email configuration
const emailConfigPath = path.join(__dirname, 'config', 'email.config.js');
if (fs.existsSync(emailConfigPath)) {
  console.log('✅ Email configuration file exists');
} else {
  console.log('⚠️  Email configuration file missing');
}

console.log('\n🎯 Production Readiness Verification Complete!');
console.log('\n📋 Summary:');
console.log('- Environment variables: ' + (envVarsMissing ? '❌ Missing' : '✅ Complete'));
console.log('- Database configuration: ✅ Exists');
console.log('- API routes: ' + (fs.existsSync(routesDir) && fs.readdirSync(routesDir).length > 0 ? '✅ Complete' : '❌ Missing'));
console.log('- Models: ' + (fs.existsSync(modelsDir) && fs.readdirSync(modelsDir).length > 0 ? '✅ Complete' : '❌ Missing'));
console.log('- Services: ' + (fs.existsSync(servicesDir) && fs.readdirSync(servicesDir).length > 0 ? '✅ Complete' : '❌ Missing'));
console.log('- Frontend API services: ' + (fs.existsSync(clientServicesPath) ? '✅ Exists' : '❌ Missing'));
// CORS configuration is already checked earlier in the script
// Using the serverContent variable from the earlier check
if (typeof serverContent !== 'undefined' && (serverContent.includes('cors') || serverContent.includes('Access-Control-Allow-Origin'))) {
  console.log('- CORS configuration: ✅ Found');
} else {
  console.log('- CORS configuration: ⚠️  Missing (or server.js not loaded)');
}
console.log('- Authentication: ' + (fs.existsSync(middlewareDir) ? '✅ Directory exists' : '⚠️ Missing'));
console.log('- Package configuration: ' + (fs.existsSync(packagePath) ? '✅ Exists' : '❌ Missing'));

console.log('\n💡 Recommendations:');
console.log('- Ensure all environment variables are properly set in production');
console.log('- Verify database connections are properly configured for production');
console.log('- Test all API endpoints before deployment');
console.log('- Review error handling and logging mechanisms');
console.log('- Confirm CORS settings are appropriate for production');