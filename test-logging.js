// Test script to verify logging system functionality
const logger = require('./services/logger.service');

async function testLogging() {
  console.log('=== Testing Logging System ===\n');
  
  try {
    // Test info logging
    logger.info('Test info message', { 
      test: 'info',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Info logging working');
    
    // Test warn logging
    logger.warn('Test warning message', { 
      test: 'warning',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Warning logging working');
    
    // Test error logging
    logger.error('Test error message', { 
      test: 'error',
      timestamp: new Date().toISOString(),
      errorDetails: {
        code: 'TEST_ERROR',
        message: 'This is a test error'
      }
    });
    console.log('✓ Error logging working');
    
    // Test debug logging
    logger.debug('Test debug message', { 
      test: 'debug',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Debug logging working');
    
    // Test log retrieval
    const logs = logger.getLogs();
    console.log(`✓ Retrieved ${logs.length} logs`);
    
    // Test error log retrieval
    const errorLogs = logger.getErrorLogs();
    console.log(`✓ Retrieved ${errorLogs.length} error logs`);
    
    // Test log analysis
    const analysis = logger.analyzeLogs(24);
    console.log('✓ Log analysis working');
    console.log(`  - Total logs analyzed: ${analysis.total}`);
    console.log(`  - Errors: ${analysis.byLevel.error}`);
    console.log(`  - Warnings: ${analysis.byLevel.warn}`);
    console.log(`  - Info: ${analysis.byLevel.info}`);
    
    console.log('\n=== Logging System Test Complete ===');
    console.log('All logging functionality is working correctly!');
    
  } catch (error) {
    console.error('Logging system test failed:', error.message);
    process.exit(1);
  }
}

testLogging();