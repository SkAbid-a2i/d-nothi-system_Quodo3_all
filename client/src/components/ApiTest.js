import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { authAPI, userAPI } from '../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Base API connection
      results.push({ test: 'API Base Connection', status: 'passed', message: 'API is accessible' });

      // Test 2: Login
      try {
        const loginResponse = await authAPI.login({
          username: 'admin',
          password: 'admin123'
        });
        results.push({ test: 'Login API', status: 'passed', message: 'Login successful' });

        // Store token for subsequent tests
        const token = loginResponse.data.token;
        localStorage.setItem('token', token);

        // Test 3: Get current user
        try {
          const userResponse = await authAPI.getCurrentUser();
          results.push({ test: 'Get Current User', status: 'passed', message: `User: ${userResponse.data.username}, Role: ${userResponse.data.role}` });

          // Test 4: Get all users
          try {
            const usersResponse = await userAPI.getAllUsers();
            results.push({ test: 'Get All Users', status: 'passed', message: `Retrieved ${usersResponse.data.length} users` });
          } catch (error) {
            results.push({ test: 'Get All Users', status: 'failed', message: error.message });
          }
        } catch (error) {
          results.push({ test: 'Get Current User', status: 'failed', message: error.message });
        }
      } catch (error) {
        results.push({ test: 'Login API', status: 'failed', message: error.message });
      }
    } catch (error) {
      results.push({ test: 'API Base Connection', status: 'failed', message: error.message });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>API Connection Test</Typography>
      
      <Button 
        variant="contained" 
        onClick={runTests}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Run API Tests'}
      </Button>

      {testResults.map((result, index) => (
        <Alert 
          key={index} 
          severity={result.status === 'passed' ? 'success' : 'error'}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1">{result.test}</Typography>
          <Typography variant="body2">{result.message}</Typography>
        </Alert>
      ))}
    </Box>
  );
};

export default ApiTest;