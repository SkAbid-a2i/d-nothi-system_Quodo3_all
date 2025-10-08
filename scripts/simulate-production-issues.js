#!/usr/bin/env node

/**
 * Production Issue Simulation Script
 * Simulates various production issues to test monitoring system
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const SIMULATION_DURATION = 300000; // 5 minutes
const ISSUE_INTERVAL = 10000; // 10 seconds

console.log('🎭 Production Issue Simulation Script');
console.log('=====================================');

// Issue templates
const ISSUE_TEMPLATES = {
  FIELD_ISSUES: [
    {
      level: 'warn',
      message: 'Field Issue',
      metadata: {
        source: 'frontend',
        field: 'user-email-input',
        issue: 'Field is not visible in UI',
        component: 'UserForm',
        page: '/users/create'
      }
    },
    {
      level: 'error',
      message: 'Missing Field Error',
      metadata: {
        source: 'frontend',
        field: 'required-phone-number',
        error: 'Required field not found in form submission',
        component: 'ContactForm',
        page: '/contacts/new'
      }
    },
    {
      level: 'warn',
      message: 'Field Validation Issue',
      metadata: {
        source: 'frontend',
        field: 'password-confirm',
        issue: 'Field validation not working properly',
        component: 'RegistrationForm',
        page: '/register'
      }
    }
  ],
  
  API_ISSUES: [
    {
      level: 'error',
      message: 'API Error',
      metadata: {
        source: 'frontend',
        url: '/api/users',
        method: 'GET',
        status: 500,
        error: 'Internal Server Error'
      }
    },
    {
      level: 'warn',
      message: 'API Timeout',
      metadata: {
        source: 'frontend',
        url: '/api/reports/generate',
        method: 'POST',
        duration: '30000ms',
        error: 'Request timeout after 30 seconds'
      }
    },
    {
      level: 'error',
      message: 'API Not Working',
      metadata: {
        source: 'frontend',
        url: '/api/legacy/endpoint',
        method: 'PUT',
        status: 404,
        error: 'Endpoint not found'
      }
    },
    {
      level: 'error',
      message: 'API Rate Limit Exceeded',
      metadata: {
        source: 'frontend',
        url: '/api/tasks',
        method: 'GET',
        status: 429,
        error: 'Too Many Requests'
      }
    }
  ],
  
  SERVER_ERRORS: [
    {
      level: 'error',
      message: 'Database Connection Failed',
      metadata: {
        source: 'backend',
        error: 'Connection timeout to TiDB database',
        service: 'user-service',
        stack: 'Error: connect ETIMEDOUT 127.0.0.1:4000\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)'
      }
    },
    {
      level: 'error',
      message: 'Memory Leak Detected',
      metadata: {
        source: 'backend',
        error: 'Heap out of memory',
        service: 'task-service',
        memoryUsage: '1.8GB',
        limit: '2GB'
      }
    },
    {
      level: 'error',
      message: 'Unhandled Promise Rejection',
      metadata: {
        source: 'backend',
        error: 'Promise rejected with no error handler',
        service: 'notification-service',
        stack: 'Error: Notification service unavailable\n    at NotificationService.send (notification.service.js:45:13)'
      }
    }
  ],
  
  MIGRATION_ISSUES: [
    {
      level: 'error',
      message: 'Database migration failed',
      metadata: {
        source: 'backend',
        migration: 'add-user-profile-fields',
        error: 'Duplicate column name "profile_image"',
        table: 'users'
      }
    },
    {
      level: 'warn',
      message: 'Migration performance issue',
      metadata: {
        source: 'backend',
        migration: 'index-task-table',
        warning: 'Migration taking longer than expected',
        duration: '180000ms',
        estimated: '30000ms'
      }
    },
    {
      level: 'error',
      message: 'Rollback failed',
      metadata: {
        source: 'backend',
        migration: 'update-permission-structure',
        error: 'Cannot drop index because constraints exist',
        table: 'permissions'
      }
    }
  ],
  
  UI_VISIBILITY_ISSUES: [
    {
      level: 'warn',
      message: 'Field Visibility Issue',
      metadata: {
        source: 'frontend',
        field: 'priority-dropdown',
        issue: 'Field not visible in live UI',
        page: '/tasks/create',
        component: 'TaskForm'
      }
    },
    {
      level: 'error',
      message: 'Missing UI Element',
      metadata: {
        source: 'frontend',
        element: 'export-button',
        error: 'Expected UI element not found',
        page: '/reports',
        component: 'ReportDashboard'
      }
    },
    {
      level: 'warn',
      message: 'Responsive Design Issue',
      metadata: {
        source: 'frontend',
        element: 'sidebar-menu',
        issue: 'Element not visible on mobile devices',
        page: '/dashboard',
        device: 'iPhone 12',
        viewport: '390x844'
      }
    }
  ]
};

// Function to send an issue log
async function sendIssue(issueTemplate) {
  try {
    const logData = {
      ...issueTemplate,
      metadata: {
        ...issueTemplate.metadata,
        timestamp: new Date().toISOString(),
        sessionId: `sim_${Date.now()}`,
        userId: 'simulated-user'
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/logs/frontend`, logData);
    console.log(`✅ Issue reported: ${issueTemplate.message} (${issueTemplate.level})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to report issue: ${error.message}`);
    return null;
  }
}

// Function to get a random issue
function getRandomIssue() {
  const categories = Object.keys(ISSUE_TEMPLATES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const issues = ISSUE_TEMPLATES[randomCategory];
  const randomIssue = issues[Math.floor(Math.random() * issues.length)];
  
  return randomIssue;
}

// Function to simulate a specific type of issue
async function simulateIssueType(type, count = 1) {
  console.log(`\n🎯 Simulating ${count} ${type} issues...`);
  
  for (let i = 0; i < count; i++) {
    if (ISSUE_TEMPLATES[type]) {
      const issue = ISSUE_TEMPLATES[type][Math.floor(Math.random() * ISSUE_TEMPLATES[type].length)];
      await sendIssue(issue);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }
  }
}

// Main simulation function
async function runSimulation() {
  console.log(`⏱️  Starting simulation for ${SIMULATION_DURATION / 60000} minutes...\n`);
  
  const startTime = Date.now();
  let issueCount = 0;
  
  // Send initial burst of issues
  console.log('🔥 Sending initial burst of issues...');
  await simulateIssueType('FIELD_ISSUES', 3);
  await simulateIssueType('API_ISSUES', 3);
  await simulateIssueType('SERVER_ERRORS', 2);
  await simulateIssueType('MIGRATION_ISSUES', 2);
  await simulateIssueType('UI_VISIBILITY_ISSUES', 3);
  
  issueCount += 13;
  
  // Continue sending issues at intervals
  const interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < SIMULATION_DURATION) {
      // Send a random issue
      const randomIssue = getRandomIssue();
      await sendIssue(randomIssue);
      issueCount++;
      
      // Occasionally send bursts
      if (Math.random() < 0.2) { // 20% chance
        console.log('💥 Sending issue burst...');
        const burstCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < burstCount; i++) {
          const burstIssue = getRandomIssue();
          await sendIssue(burstIssue);
          issueCount++;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } else {
      clearInterval(interval);
    }
  }, ISSUE_INTERVAL);
  
  // Wait for the simulation to complete
  setTimeout(async () => {
    clearInterval(interval);
    
    console.log('\n✅ Simulation completed!');
    console.log(`📈 Total issues simulated: ${issueCount}`);
    
    // Final summary
    console.log('\n📊 Issue Distribution:');
    Object.keys(ISSUE_TEMPLATES).forEach(category => {
      console.log(`   ${category}: ${ISSUE_TEMPLATES[category].length} templates`);
    });
    
    console.log('\n🎉 Production Issue Simulation finished successfully!');
  }, SIMULATION_DURATION);
}

// Function to run specific simulations
async function runSpecificSimulation(simulationType) {
  switch (simulationType) {
    case 'field':
      await simulateIssueType('FIELD_ISSUES', 5);
      break;
    case 'api':
      await simulateIssueType('API_ISSUES', 5);
      break;
    case 'server':
      await simulateIssueType('SERVER_ERRORS', 3);
      break;
    case 'migration':
      await simulateIssueType('MIGRATION_ISSUES', 3);
      break;
    case 'ui':
      await simulateIssueType('UI_VISIBILITY_ISSUES', 5);
      break;
    case 'all':
    default:
      await runSimulation();
  }
}

// CLI argument handling
function getSimulationType() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args[0].toLowerCase();
  }
  return 'all';
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Simulation interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Simulation terminated');
  process.exit(0);
});

// Run the simulation
if (require.main === module) {
  const simulationType = getSimulationType();
  console.log(`🚀 Starting ${simulationType} issue simulation...`);
  
  runSpecificSimulation(simulationType)
    .catch(error => {
      console.error('💥 Simulation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  sendIssue,
  getRandomIssue,
  simulateIssueType,
  runSimulation,
  runSpecificSimulation
};