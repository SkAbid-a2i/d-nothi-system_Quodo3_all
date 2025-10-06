const { spawn } = require('child_process');
const path = require('path');

class ComprehensiveTester {
  constructor() {
    this.testResults = [];
  }
  
  runCommand(command, args, testName) {
    return new Promise((resolve) => {
      console.log(`\n🔍 Running ${testName}...`);
      console.log(`   Command: ${command} ${args.join(' ')}\n`);
      
      const child = spawn(command, args, { 
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        const success = code === 0;
        this.testResults.push({
          name: testName,
          success: success,
          exitCode: code
        });
        
        if (success) {
          console.log(`✅ ${testName} completed successfully\n`);
        } else {
          console.log(`❌ ${testName} failed with exit code ${code}\n`);
        }
        
        resolve(success);
      });
      
      child.on('error', (error) => {
        console.log(`❌ ${testName} failed with error: ${error.message}\n`);
        this.testResults.push({
          name: testName,
          success: false,
          error: error.message
        });
        resolve(false);
      });
    });
  }
  
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Testing Suite...\n');
    console.log('This will test database connection, API endpoints, and end-to-end functionality.\n');
    
    // Test 1: Database connection
    const dbTest = await this.runCommand('node', ['scripts/test-db-connection.js'], 'Database Connection Test');
    
    if (!dbTest) {
      console.log('⚠️  Skipping further tests due to database connection failure\n');
    } else {
      // Test 2: Database tables
      await this.runCommand('node', ['scripts/check-db-tables.js'], 'Database Tables Check');
      
      // Test 3: Admin user verification
      await this.runCommand('node', ['scripts/verify-admin-user.js'], 'Admin User Verification');
      
      // Test 4: API endpoints (requires server to be running)
      console.log('ℹ️  Please ensure the backend server is running (npm run dev) before proceeding with API tests');
      console.log('   Press any key to continue with API tests, or Ctrl+C to skip...');
      
      process.stdin.setRawMode(true);
      process.stdin.resume();
      
      await new Promise((resolve) => {
        process.stdin.once('data', () => {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          resolve();
        });
      });
      
      await this.runCommand('node', ['scripts/test-api-endpoints.js'], 'API Endpoints Test');
      
      // Test 5: End-to-end test
      await this.runCommand('node', ['scripts/e2e-test.js'], 'End-to-End Test');
    }
    
    // Summary
    console.log('\n📊 Comprehensive Test Results:');
    console.log('==============================');
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log('\n📈 Final Summary:');
    console.log(`   Total Tests: ${this.testResults.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your application is ready for deployment.');
      console.log('📋 Please review the DEPLOYMENT_CHECKLIST.md before pushing to production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please address the issues before deployment.');
      console.log('📝 Check the output above for details on what failed and why.');
    }
  }
}

// Run the comprehensive tests
const tester = new ComprehensiveTester();
tester.runAllTests().catch(error => {
  console.error('❌ Comprehensive testing failed with error:', error);
  process.exit(1);
});