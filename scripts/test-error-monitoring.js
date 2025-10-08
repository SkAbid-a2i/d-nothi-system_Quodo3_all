#!/usr/bin/env node

/**
 * Error Monitoring Test Script
 * Tests the real-time error monitoring system functionality
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_DURATION = 60000; // 1 minute
const LOG_INTERVAL = 5000; // 5 seconds

console.log('🚀 Starting Error Monitoring Test Script');
console.log('=====================================');

// Test data
const testLogs = [
  {
    level: 'info',
    message: 'Test info log from monitoring script',
    metadata: {
      source: 'test-script',
      testType: 'info-log',
      timestamp: new Date().toISOString()
    }
  },
  {
    level: 'warn',
    message: 'Test warning log from monitoring script',
    metadata: {
      source: 'test-script',
      testType: 'warning-log',
      timestamp: new Date().toISOString()
    }
  },
  {
    level: 'error',
    message: 'Test error log from monitoring script',
    metadata: {
      source: 'test-script',
      testType: 'error-log',
      error: 'This is a simulated error for testing',
      stack: 'Error: Simulated error\n    at testFunction (test-script.js:10:15)',
      timestamp: new Date().toISOString()
    }
  }
];

// Function to send test logs
async function sendTestLog(logData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, logData);
    console.log(`✅ Log sent successfully: ${logData.level} - ${logData.message}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to send log: ${logData.level} - ${logData.message}`);
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

// Function to fetch logs
async function fetchLogs() {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs?source=all`, {
      headers: {
        'Authorization': 'Bearer test-token' // This would need a real token in production
      }
    });
    console.log(`📊 Fetched ${response.data.logs?.length || response.data.count || 0} logs`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch logs: ${error.message}`);
    return null;
  }
}

// Function to test field visibility monitoring
function testFieldVisibility() {
  console.log('🔍 Testing field visibility monitoring...');
  
  // Simulate a field visibility issue
  const fieldIssue = {
    level: 'warn',
    message: 'Field Issue',
    metadata: {
      source: 'test-script',
      field: 'test-field',
      issue: 'Field is not visible in UI',
      component: 'TestComponent',
      timestamp: new Date().toISOString()
    }
  };
  
  return sendTestLog(fieldIssue);
}

// Function to test API error monitoring
function testApiErrorMonitoring() {
  console.log('🌐 Testing API error monitoring...');
  
  // Simulate an API error
  const apiError = {
    level: 'error',
    message: 'API Error',
    metadata: {
      source: 'test-script',
      url: '/api/test-endpoint',
      error: 'Network error: Connection timeout',
      stack: 'Error: Connection timeout\n    at axios.request (axios.js:100:15)',
      timestamp: new Date().toISOString()
    }
  };
  
  return sendTestLog(apiError);
}

// Function to test migration issue detection
function testMigrationIssueDetection() {
  console.log('💾 Testing migration issue detection...');
  
  // Simulate a migration issue
  const migrationIssue = {
    level: 'error',
    message: 'Database migration failed',
    metadata: {
      source: 'test-script',
      migration: 'users-table-migration-v2',
      error: 'Column "email" already exists',
      timestamp: new Date().toISOString()
    }
  };
  
  return sendTestLog(migrationIssue);
}

// Main test function
async function runTests() {
  console.log(`⏱️  Running tests for ${TEST_DURATION / 1000} seconds...\n`);
  
  const startTime = Date.now();
  let logCount = 0;
  
  // Send initial test logs
  for (const log of testLogs) {
    await sendTestLog(log);
    logCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between logs
  }
  
  // Run specialized tests
  await testFieldVisibility();
  logCount++;
  
  await testApiErrorMonitoring();
  logCount++;
  
  await testMigrationIssueDetection();
  logCount++;
  
  // Continue sending logs at intervals
  const interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < TEST_DURATION) {
      // Send a random log
      const randomLog = testLogs[Math.floor(Math.random() * testLogs.length)];
      await sendTestLog({
        ...randomLog,
        metadata: {
          ...randomLog.metadata,
          timestamp: new Date().toISOString(),
          testRun: 'continuous'
        }
      });
      logCount++;
      
      // Occasionally fetch logs to verify they're being stored
      if (Math.random() < 0.3) { // 30% chance
        await fetchLogs();
      }
    } else {
      clearInterval(interval);
    }
  }, LOG_INTERVAL);
  
  // Wait for the test duration to complete
  setTimeout(async () => {
    clearInterval(interval);
    
    console.log('\n✅ Test completed!');
    console.log(`📈 Total logs sent: ${logCount}`);
    
    // Final verification
    console.log('\n🔍 Final verification...');
    await fetchLogs();
    
    console.log('\n🎉 Error Monitoring Test Script finished successfully!');
  }, TEST_DURATION);
}

// Function to test the analysis endpoint
async function testAnalysis() {
  console.log('📊 Testing log analysis endpoint...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/analyze`, {
      headers: {
        'Authorization': 'Bearer test-token' // This would need a real token in production
      }
    });
    
    console.log('✅ Analysis endpoint working');
    console.log(`   Found ${response.data.total || 0} total logs`);
    console.log(`   Found ${response.data.byLevel?.error || 0} errors`);
    console.log(`   Found ${response.data.frontendIssues?.total || 0} frontend issues`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to analyze logs: ${error.message}`);
    return null;
  }
}

// Run the tests
async function main() {
  try {
    // Test basic connectivity
    console.log('📡 Testing API connectivity...');
    await fetchLogs();
    
    // Test analysis
    await testAnalysis();
    
    // Run main tests
    await runTests();
  } catch (error) {
    console.error('💥 Test script failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test script interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test script terminated');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  sendTestLog,
  fetchLogs,
  testFieldVisibility,
  testApiErrorMonitoring,
  testMigrationIssueDetection,
  testAnalysis
};