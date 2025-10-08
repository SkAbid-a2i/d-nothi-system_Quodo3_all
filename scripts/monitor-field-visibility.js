#!/usr/bin/env node

/**
 * Field Visibility Monitoring Script
 * Monitors and reports field visibility issues in the application
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOGS_DIR = path.join(__dirname, '../logs');
const MONITOR_INTERVAL = 60000; // 1 minute

// Field visibility issue patterns
const FIELD_VISIBILITY_PATTERNS = [
  /Field is not visible in UI/i,
  /Missing field/i,
  /Field visibility issue/i,
  /Element not found/i,
  /Field not rendered/i
];

// API error patterns
const API_ERROR_PATTERNS = [
  /API Error/i,
  /Network timeout/i,
  /Connection failed/i,
  /Request failed/i,
  /500 Internal Server Error/i
];

// Migration issue patterns
const MIGRATION_PATTERNS = [
  /Migration failed/i,
  /Database migration/i,
  /Schema change/i,
  /Table constraint/i
];

class FieldVisibilityMonitor {
  constructor() {
    this.issues = {
      fieldVisibility: [],
      apiErrors: [],
      migrationIssues: [],
      otherErrors: []
    };
  }

  // Read and parse log files
  async readLogs() {
    try {
      const files = await fs.promises.readdir(LOGS_DIR);
      const logFiles = files.filter(file => 
        file.endsWith('.log') || file.endsWith('-frontend.log') || file.endsWith('-error.log')
      );
      
      const allLogs = [];
      
      for (const file of logFiles) {
        const filePath = path.join(LOGS_DIR, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            allLogs.push(logEntry);
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
      
      return allLogs;
    } catch (error) {
      console.error('Error reading logs:', error.message);
      return [];
    }
  }

  // Categorize logs by issue type
  categorizeLogs(logs) {
    this.issues = {
      fieldVisibility: [],
      apiErrors: [],
      migrationIssues: [],
      otherErrors: []
    };
    
    for (const log of logs) {
      const message = log.message || '';
      const logString = JSON.stringify(log);
      
      // Check for field visibility issues
      if (FIELD_VISIBILITY_PATTERNS.some(pattern => pattern.test(message) || pattern.test(logString))) {
        this.issues.fieldVisibility.push(log);
      }
      // Check for API errors
      else if (API_ERROR_PATTERNS.some(pattern => pattern.test(message) || pattern.test(logString))) {
        this.issues.apiErrors.push(log);
      }
      // Check for migration issues
      else if (MIGRATION_PATTERNS.some(pattern => pattern.test(message) || pattern.test(logString))) {
        this.issues.migrationIssues.push(log);
      }
      // Check for other errors
      else if (log.level === 'error' || log.level === 'warn') {
        this.issues.otherErrors.push(log);
      }
    }
  }

  // Generate report
  generateReport() {
    const now = new Date();
    const report = {
      timestamp: now.toISOString(),
      summary: {
        totalIssues: 0,
        fieldVisibility: this.issues.fieldVisibility.length,
        apiErrors: this.issues.apiErrors.length,
        migrationIssues: this.issues.migrationIssues.length,
        otherErrors: this.issues.otherErrors.length
      },
      issues: this.issues
    };
    
    report.summary.totalIssues = 
      report.summary.fieldVisibility + 
      report.summary.apiErrors + 
      report.summary.migrationIssues + 
      report.summary.otherErrors;
    
    return report;
  }

  // Print report to console
  printReport(report) {
    console.log('\n📊 Field Visibility Monitoring Report');
    console.log('====================================');
    console.log(`Generated: ${report.timestamp}`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`Field Visibility Issues: ${report.summary.fieldVisibility}`);
    console.log(`API Errors: ${report.summary.apiErrors}`);
    console.log(`Migration Issues: ${report.summary.migrationIssues}`);
    console.log(`Other Errors: ${report.summary.otherErrors}`);
    
    if (report.summary.fieldVisibility > 0) {
      console.log('\n🔍 Field Visibility Issues:');
      report.issues.fieldVisibility.slice(0, 5).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message} (${issue.timestamp})`);
      });
      if (report.issues.fieldVisibility.length > 5) {
        console.log(`  ... and ${report.issues.fieldVisibility.length - 5} more`);
      }
    }
    
    if (report.summary.apiErrors > 0) {
      console.log('\n🌐 API Errors:');
      report.issues.apiErrors.slice(0, 5).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message} (${issue.timestamp})`);
      });
      if (report.issues.apiErrors.length > 5) {
        console.log(`  ... and ${report.issues.apiErrors.length - 5} more`);
      }
    }
  }

  // Save report to file
  async saveReport(report) {
    const reportFile = path.join(LOGS_DIR, `field-visibility-report-${Date.now()}.json`);
    try {
      await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(`\n💾 Report saved to: ${reportFile}`);
    } catch (error) {
      console.error('Error saving report:', error.message);
    }
  }

  // Run monitoring cycle
  async runCycle() {
    try {
      console.log('\n🔍 Running field visibility monitoring cycle...');
      
      // Read logs
      const logs = await this.readLogs();
      console.log(`   Found ${logs.length} log entries`);
      
      // Categorize logs
      this.categorizeLogs(logs);
      
      // Generate and print report
      const report = this.generateReport();
      this.printReport(report);
      
      // Save report
      await this.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('Error during monitoring cycle:', error.message);
      return null;
    }
  }

  // Start continuous monitoring
  startMonitoring(interval = MONITOR_INTERVAL) {
    console.log('🚀 Starting field visibility monitoring...');
    console.log(`   Interval: ${interval / 1000} seconds`);
    
    // Run initial cycle
    this.runCycle();
    
    // Set up interval
    setInterval(() => {
      this.runCycle();
    }, interval);
  }
}

// CLI argument handling
function getCommand() {
  const args = process.argv.slice(2);
  return args[0] || 'monitor';
}

// Main execution
async function main() {
  const command = getCommand();
  const monitor = new FieldVisibilityMonitor();
  
  switch (command) {
    case 'monitor':
      monitor.startMonitoring();
      break;
      
    case 'once':
      await monitor.runCycle();
      break;
      
    default:
      console.log('Usage: node monitor-field-visibility.js [monitor|once]');
      console.log('  monitor - Start continuous monitoring (default)');
      console.log('  once - Run monitoring cycle once');
      process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Monitoring stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Monitoring terminated');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Monitoring failed with unhandled error:', error);
    process.exit(1);
  });
}

module.exports = FieldVisibilityMonitor;