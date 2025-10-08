#!/usr/bin/env node

/**
 * Production Monitoring Test Script
 * Comprehensive test suite for production-level monitoring
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-token';

console.log('🏭 Production Monitoring Test Suite');
console.log('====================================');

// Test categories
const TEST_CATEGORIES = {
  ERROR_MONITORING: 'Error Monitoring',
  FIELD_TRACKING: 'Field Tracking',
  API_MONITORING: 'API Monitoring',
  MIGRATION_DETECTION: 'Migration Detection',
  UI_VISIBILITY: 'UI Visibility'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function logResult(category, testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ [${category}] ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ [${category}] ${testName}`);
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.details.push({
    category,
    testName,
    passed,
    details
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions

// 1. Error Monitoring Tests
async function testErrorMonitoring() {
  console.log('\n--- Error Monitoring Tests ---');
  
  try {
    // Test sending frontend logs
    const testLog = {
      level: 'error',
      message: 'Production test error',
      metadata: {
        source: 'production-test',
        component: 'TestSuite',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, testLog);
    logResult(TEST_CATEGORIES.ERROR_MONITORING, 'Send Frontend Log', 
              response.status === 200, `Status: ${response.status}`);
    
    // Test fetching logs
    const fetchResponse = await axios.get(`${API_BASE_URL}/logs?level=error&source=frontend`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    logResult(TEST_CATEGORIES.ERROR_MONITORING, 'Fetch Error Logs', 
              fetchResponse.status === 200, `Status: ${fetchResponse.status}, Count: ${fetchResponse.data.logs?.length || 0}`);
    
    // Test log analysis
    const analysisResponse = await axios.get(`${API_BASE_URL}/logs/analyze`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    logResult(TEST_CATEGORIES.ERROR_MONITORING, 'Log Analysis', 
              analysisResponse.status === 200, `Status: ${analysisResponse.status}`);
    
  } catch (error) {
    logResult(TEST_CATEGORIES.ERROR_MONITORING, 'Error Monitoring Suite', 
              false, `Error: ${error.message}`);
  }
}

// 2. Field Tracking Tests
async function testFieldTracking() {
  console.log('\n--- Field Tracking Tests ---');
  
  try {
    // Test field visibility issue reporting
    const fieldIssue = {
      level: 'warn',
      message: 'Field Issue',
      metadata: {
        source: 'production-test',
        field: 'test-input-field',
        issue: 'Field is not visible in UI',
        component: 'TestForm',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, fieldIssue);
    logResult(TEST_CATEGORIES.FIELD_TRACKING, 'Report Field Visibility Issue', 
              response.status === 200, `Status: ${response.status}`);
    
    // Test missing field detection
    const missingField = {
      level: 'error',
      message: 'Missing Field Error',
      metadata: {
        source: 'production-test',
        field: 'required-field',
        error: 'Required field not found in form',
        component: 'TestForm',
        timestamp: new Date().toISOString()
      }
    };
    
    const missingResponse = await axios.post(`${API_BASE_URL}/logs/frontend`, missingField);
    logResult(TEST_CATEGORIES.FIELD_TRACKING, 'Report Missing Field', 
              missingResponse.status === 200, `Status: ${missingResponse.status}`);
    
  } catch (error) {
    logResult(TEST_CATEGORIES.FIELD_TRACKING, 'Field Tracking Suite', 
              false, `Error: ${error.message}`);
  }
}

// 3. API Monitoring Tests
async function testApiMonitoring() {
  console.log('\n--- API Monitoring Tests ---');
  
  try {
    // Test API error reporting
    const apiError = {
      level: 'error',
      message: 'API Error',
      metadata: {
        source: 'production-test',
        url: '/api/test-endpoint',
        method: 'GET',
        status: 500,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, apiError);
    logResult(TEST_CATEGORIES.API_MONITORING, 'Report API Error', 
              response.status === 200, `Status: ${response.status}`);
    
    // Test API timeout reporting
    const timeoutError = {
      level: 'warn',
      message: 'API Timeout',
      metadata: {
        source: 'production-test',
        url: '/api/slow-endpoint',
        method: 'POST',
        duration: '30000ms',
        error: 'Request timeout after 30 seconds',
        timestamp: new Date().toISOString()
      }
    };
    
    const timeoutResponse = await axios.post(`${API_BASE_URL}/logs/frontend`, timeoutError);
    logResult(TEST_CATEGORIES.API_MONITORING, 'Report API Timeout', 
              timeoutResponse.status === 200, `Status: ${timeoutResponse.status}`);
    
    // Test non-working API detection
    const nonWorkingApi = {
      level: 'error',
      message: 'API Not Working',
      metadata: {
        source: 'production-test',
        url: '/api/broken-endpoint',
        method: 'PUT',
        status: 404,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
      }
    };
    
    const nonWorkingResponse = await axios.post(`${API_BASE_URL}/logs/frontend`, nonWorkingApi);
    logResult(TEST_CATEGORIES.API_MONITORING, 'Report Non-Working API', 
              nonWorkingResponse.status === 200, `Status: ${nonWorkingResponse.status}`);
    
  } catch (error) {
    logResult(TEST_CATEGORIES.API_MONITORING, 'API Monitoring Suite', 
              false, `Error: ${error.message}`);
  }
}

// 4. Migration Detection Tests
async function testMigrationDetection() {
  console.log('\n--- Migration Detection Tests ---');
  
  try {
    // Test migration error reporting
    const migrationError = {
      level: 'error',
      message: 'Database migration failed',
      metadata: {
        source: 'production-test',
        migration: 'users-table-v2',
        error: 'Duplicate column name "email"',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, migrationError);
    logResult(TEST_CATEGORIES.MIGRATION_DETECTION, 'Report Migration Error', 
              response.status === 200, `Status: ${response.status}`);
    
    // Test migration warning reporting
    const migrationWarning = {
      level: 'warn',
      message: 'Migration performance issue',
      metadata: {
        source: 'production-test',
        migration: 'tasks-table-index',
        warning: 'Migration taking longer than expected',
        duration: '120000ms',
        timestamp: new Date().toISOString()
      }
    };
    
    const warningResponse = await axios.post(`${API_BASE_URL}/logs/frontend`, migrationWarning);
    logResult(TEST_CATEGORIES.MIGRATION_DETECTION, 'Report Migration Warning', 
              warningResponse.status === 200, `Status: ${warningResponse.status}`);
    
  } catch (error) {
    logResult(TEST_CATEGORIES.MIGRATION_DETECTION, 'Migration Detection Suite', 
              false, `Error: ${error.message}`);
  }
}

// 5. UI Visibility Tests
async function testUiVisibility() {
  console.log('\n--- UI Visibility Tests ---');
  
  try {
    // Test live UI field visibility issue
    const uiIssue = {
      level: 'warn',
      message: 'Field Visibility Issue',
      metadata: {
        source: 'production-test',
        field: 'live-ui-field',
        issue: 'Field not visible in live UI',
        page: '/dashboard',
        component: 'DashboardWidget',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, uiIssue);
    logResult(TEST_CATEGORIES.UI_VISIBILITY, 'Report UI Field Visibility', 
              response.status === 200, `Status: ${response.status}`);
    
    // Test missing UI element
    const missingElement = {
      level: 'error',
      message: 'Missing UI Element',
      metadata: {
        source: 'production-test',
        element: 'critical-button',
        error: 'Expected UI element not found',
        page: '/reports',
        component: 'ReportGenerator',
        timestamp: new Date().toISOString()
      }
    };
    
    const missingResponse = await axios.post(`${API_BASE_URL}/logs/frontend`, missingElement);
    logResult(TEST_CATEGORIES.UI_VISIBILITY, 'Report Missing UI Element', 
              missingResponse.status === 200, `Status: ${missingResponse.status}`);
    
  } catch (error) {
    logResult(TEST_CATEGORIES.UI_VISIBILITY, 'UI Visibility Suite', 
              false, `Error: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Production Monitoring Test Suite...\n');
  
  // Run all test categories
  await testErrorMonitoring();
  await delay(1000); // Small delay between test categories
  
  await testFieldTracking();
  await delay(1000);
  
  await testApiMonitoring();
  await delay(1000);
  
  await testMigrationDetection();
  await delay(1000);
  
  await testUiVisibility();
  
  // Print summary
  console.log('\n📋 Test Results Summary');
  console.log('======================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(detail => !detail.passed)
      .forEach(detail => {
        console.log(`   - [${detail.category}] ${detail.testName}: ${detail.details}`);
      });
  }
  
  // Save results to file
  const resultsFile = path.join(__dirname, 'test-results.json');
  const resultsData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(2)
    },
    details: testResults.details
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2));
  console.log(`\n💾 Test results saved to: ${resultsFile}`);
  
  // Return appropriate exit code
  return testResults.failed === 0 ? 0 : 1;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test suite terminated');
  process.exit(0);
});

// Run the test suite
if (require.main === module) {
  runAllTests()
    .then(exitCode => {
      console.log('\n🏁 Production Monitoring Test Suite completed');
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Test suite failed with unhandled error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testErrorMonitoring,
  testFieldTracking,
  testApiMonitoring,
  testMigrationDetection,
  testUiVisibility
};