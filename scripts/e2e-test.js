const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

class E2ETestRunner {
  constructor() {
    this.authToken = null;
    this.apiClient = null;
    this.testResults = [];
  }
  
  logResult(testName, status, message = '') {
    const result = {
      name: testName,
      status: status ? '✅ PASS' : '❌ FAIL',
      message: message
    };
    this.testResults.push(result);
    console.log(`${result.status} ${testName}${message ? ` - ${message}` : ''}`);
  }
  
  async runTest(testName, testFn) {
    try {
      const result = await testFn();
      this.logResult(testName, result.success, result.message);
      return result;
    } catch (error) {
      this.logResult(testName, false, error.message);
      return { success: false, message: error.message };
    }
  }
  
  async testDatabaseConnection() {
    try {
      const sequelize = require('../config/database');
      await sequelize.authenticate();
      await sequelize.close();
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      return { success: false, message: `Database connection failed: ${error.message}` };
    }
  }
  
  async testApiHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return { success: true, message: `API health check passed: ${response.data.message}` };
    } catch (error) {
      return { success: false, message: `API health check failed: ${error.message}` };
    }
  }
  
  async testAuthentication() {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
      this.authToken = response.data.token;
      this.apiClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, message: `Authentication successful for user: ${response.data.user.username}` };
    } catch (error) {
      return { success: false, message: `Authentication failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async testUserDataAccess() {
    if (!this.apiClient) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      const response = await this.apiClient.get('/users');
      return { success: true, message: `Retrieved ${response.data.length} users` };
    } catch (error) {
      return { success: false, message: `User data access failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async testTaskDataAccess() {
    if (!this.apiClient) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      const response = await this.apiClient.get('/tasks');
      return { success: true, message: `Retrieved ${response.data.length} tasks` };
    } catch (error) {
      return { success: false, message: `Task data access failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async testLeaveDataAccess() {
    if (!this.apiClient) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      const response = await this.apiClient.get('/leaves');
      return { success: true, message: `Retrieved ${response.data.length} leaves` };
    } catch (error) {
      return { success: false, message: `Leave data access failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async testDropdownDataAccess() {
    if (!this.apiClient) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      const response = await this.apiClient.get('/dropdowns');
      return { success: true, message: `Retrieved ${response.data.length} dropdowns` };
    } catch (error) {
      return { success: false, message: `Dropdown data access failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async testPermissionTemplateAccess() {
    if (!this.apiClient) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      const response = await this.apiClient.get('/permissions/templates');
      return { success: true, message: `Retrieved ${response.data.length} permission templates` };
    } catch (error) {
      return { success: false, message: `Permission template access failed: ${error.response?.data?.message || error.message}` };
    }
  }
  
  async runAllTests() {
    console.log('🚀 Starting End-to-End Tests...\n');
    
    // Test database connection
    await this.runTest('Database Connection', () => this.testDatabaseConnection());
    
    // Test API health
    await this.runTest('API Health Check', () => this.testApiHealth());
    
    // Test authentication
    await this.runTest('User Authentication', () => this.testAuthentication());
    
    // Test data access
    await this.runTest('User Data Access', () => this.testUserDataAccess());
    await this.runTest('Task Data Access', () => this.testTaskDataAccess());
    await this.runTest('Leave Data Access', () => this.testLeaveDataAccess());
    await this.runTest('Dropdown Data Access', () => this.testDropdownDataAccess());
    await this.runTest('Permission Template Access', () => this.testPermissionTemplateAccess());
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.name}${result.message ? ` - ${result.message}` : ''}`);
      if (result.status.includes('PASS')) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log('\n📈 Summary:');
    console.log(`   Total Tests: ${this.testResults.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Ready for production deployment.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please fix issues before deployment.');
      process.exit(1);
    }
  }
}

// Run the E2E tests
const testRunner = new E2ETestRunner();
testRunner.runAllTests();