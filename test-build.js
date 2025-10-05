// Test script to verify the build process
const fs = require('fs');
const path = require('path');

console.log('=== Testing Build Process ===');

// Check if build directory exists
const buildDir = path.join(__dirname, 'client', 'build');
console.log('Checking build directory:', buildDir);

if (fs.existsSync(buildDir)) {
  console.log('✓ Build directory exists');
  
  // Check key files
  const keyFiles = ['index.html', 'static'];
  keyFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${file} exists`);
    } else {
      console.log(`✗ ${file} missing`);
    }
  });
  
  // Check index.html content
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    console.log('Index.html size:', content.length, 'bytes');
    if (content.includes('<div id="root">')) {
      console.log('✓ Root div found in index.html');
    } else {
      console.log('✗ Root div not found in index.html');
    }
  }
} else {
  console.log('✗ Build directory does not exist');
}

// Check package.json
const packagePath = path.join(__dirname, 'client', 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✓ package.json exists');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('Build script:', pkg.scripts?.build);
} else {
  console.log('✗ package.json not found');
}

console.log('=== Build Test Complete ===');