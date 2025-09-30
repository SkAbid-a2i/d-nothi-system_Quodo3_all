const fs = require('fs');
const path = require('path');

// Function to check if a directory exists
const dirExists = (dirPath) => {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};

// Function to check if a file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};

// Function to check if a package is installed
const isPackageInstalled = (packageName, packageJsonPath) => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch (error) {
    return false;
  }
};

console.log('🔍 Checking Quodo3 setup...\n');

// Check backend setup
console.log(' Backend Setup:');
const backendPackageJson = path.join(__dirname, '..', 'package.json');

if (fileExists(backendPackageJson)) {
  console.log('  ✅ package.json found');
  
  // Check required backend packages
  const requiredBackendPackages = [
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv',
    'multer',
    'helmet',
    'morgan',
    'joi'
  ];
  
  requiredBackendPackages.forEach(pkg => {
    if (isPackageInstalled(pkg, backendPackageJson)) {
      console.log(`  ✅ ${pkg} installed`);
    } else {
      console.log(`  ❌ ${pkg} missing`);
    }
  });
} else {
  console.log('  ❌ package.json not found');
}

console.log();

// Check frontend setup
console.log(' Frontend Setup:');
const frontendDir = path.join(__dirname, '..', 'client');
const frontendPackageJson = path.join(frontendDir, 'package.json');

if (dirExists(frontendDir)) {
  console.log('  ✅ client directory found');
  
  if (fileExists(frontendPackageJson)) {
    console.log('  ✅ client/package.json found');
    
    // Check required frontend packages
    const requiredFrontendPackages = [
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@mui/icons-material',
      'axios',
      'react-router-dom'
    ];
    
    requiredFrontendPackages.forEach(pkg => {
      if (isPackageInstalled(pkg, frontendPackageJson)) {
        console.log(`  ✅ ${pkg} installed`);
      } else {
        console.log(`  ❌ ${pkg} missing`);
      }
    });
  } else {
    console.log('  ❌ client/package.json not found');
  }
} else {
  console.log('  ❌ client directory not found');
}

console.log();

// Check required directories
console.log(' Required Directories:');
const requiredDirs = [
  'models',
  'routes',
  'middleware',
  'validators',
  'scripts',
  '__tests__',
  'client/src/components',
  'client/src/contexts',
  'client/src/services'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (dirExists(fullPath)) {
    console.log(`  ✅ ${dir} exists`);
  } else {
    console.log(`  ❌ ${dir} missing`);
  }
});

console.log();

// Check required files
console.log(' Required Files:');
const requiredFiles = [
  'server.js',
  '.env',
  'client/.env',
  'README.md',
  'API_DOCUMENTATION.md',
  'ARCHITECTURE.md'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fileExists(fullPath)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
  }
});

console.log('\n✅ Setup check completed!');