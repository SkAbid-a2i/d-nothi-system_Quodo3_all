#!/usr/bin/env node

/**
 * System Monitoring Dashboard
 * Comprehensive monitoring of database, tasks, and field visibility
 */

const axios = require('axios');
const { testDatabaseConnection, testTaskOperations } = require('./test-db-connection');
const FieldVisibilityMonitor = require('./monitor-field-visibility');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

class SystemMonitor {
  constructor() {
    this.fieldMonitor = new FieldVisibilityMonitor();
    this.status = {
      database: 'unknown',
      api: 'unknown',
      tasks: 'unknown',
      fieldVisibility: 'unknown'
    };
  }

  // Test API health
  async testApiHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000 // 5 second timeout
      });
      
      if (response.status === 200) {
        this.status.api = 'healthy';
        return true;
      } else {
        this.status.api = 'unhealthy';
        return false;
      }
    } catch (error) {
      this.status.api = 'unhealthy';
      return false;
    }
  }

  // Test database health
  async testDatabaseHealth() {
    const connected = await testDatabaseConnection();
    this.status.database = connected ? 'healthy' : 'unhealthy';
    return connected;
  }

  // Test task operations
  async testTaskHealth() {
    const working = await testTaskOperations();
    this.status.tasks = working ? 'healthy' : 'unhealthy';
    return working;
  }

  // Run comprehensive health check
  async runHealthCheck() {
    console.log('\n🏥 System Health Check');
    console.log('====================');
    
    // Test components in parallel
    const [apiHealthy, dbHealthy, tasksHealthy] = await Promise.all([
      this.testApiHealth(),
      this.testDatabaseHealth(),
      this.testTaskHealth()
    ]);
    
    // Run field visibility monitoring
    const fieldReport = await this.fieldMonitor.runCycle();
    this.status.fieldVisibility = fieldReport ? 'monitored' : 'error';
    
    // Print status
    const timestamp = new Date().toISOString();
    console.log(`\n📋 System Status (${timestamp})`);
    console.log('========================');
    console.log(`API: ${this.status.api.toUpperCase()}`);
    console.log(`Database: ${this.status.database.toUpperCase()}`);
    console.log(`Tasks: ${this.status.tasks.toUpperCase()}`);
    console.log(`Field Visibility: ${this.status.fieldVisibility.toUpperCase()}`);
    
    // Overall system health
    const allHealthy = apiHealthy && dbHealthy && tasksHealthy;
    console.log(`\n🏥 Overall System: ${allHealthy ? 'HEALTHY' : 'ISSUES DETECTED'}`);
    
    return allHealthy;
  }

  // Start continuous monitoring
  startMonitoring(interval = HEALTH_CHECK_INTERVAL) {
    console.log('🚀 Starting system monitoring...');
    console.log(`   Interval: ${interval / 1000} seconds`);
    
    // Run initial check
    this.runHealthCheck();
    
    // Set up interval
    setInterval(() => {
      this.runHealthCheck();
    }, interval);
  }

  // Generate detailed report
  async generateDetailedReport() {
    console.log('\n📊 Detailed System Report');
    console.log('========================');
    
    // Database details
    console.log('\n🗄️  Database Details:');
    // API details
    console.log('\n🌐 API Details:');
    // Task details
    console.log('\n📝 Task Details:');
    
    // Field visibility details from the field monitor
    console.log('\n🔍 Field Visibility Details:');
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
  const monitor = new SystemMonitor();
  
  switch (command) {
    case 'monitor':
      monitor.startMonitoring();
      break;
      
    case 'check':
      await monitor.runHealthCheck();
      break;
      
    case 'report':
      await monitor.generateDetailedReport();
      break;
      
    default:
      console.log('Usage: node system-monitor.js [monitor|check|report]');
      console.log('  monitor - Start continuous monitoring (default)');
      console.log('  check - Run health check once');
      console.log('  report - Generate detailed report');
      process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 System monitoring stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 System monitoring terminated');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 System monitoring failed with unhandled error:', error);
    process.exit(1);
  });
}

module.exports = SystemMonitor;