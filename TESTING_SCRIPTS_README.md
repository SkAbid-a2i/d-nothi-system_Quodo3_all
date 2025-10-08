# Production Monitoring and Testing Scripts

This directory contains comprehensive testing scripts for monitoring and validating the production environment of the Quodo3 application.

## Overview

The testing scripts are designed to:

1. **Monitor real-time errors** and issues in the application
2. **Track field visibility** problems in the UI
3. **Monitor API performance** and failures
4. **Detect migration issues** in the database
5. **Verify UI element visibility** in live environments

## Scripts Included

### 1. Error Monitoring Test (`test-error-monitoring.js`)

Tests the real-time error monitoring system functionality.

**Usage:**
```bash
node scripts/test-error-monitoring.js
```

**Features:**
- Sends test logs to the monitoring system
- Verifies log storage and retrieval
- Tests field visibility monitoring
- Tests API error monitoring
- Tests migration issue detection

### 2. Production Monitoring Test Suite (`production-monitoring-test.js`)

Comprehensive test suite for production-level monitoring.

**Usage:**
```bash
node scripts/production-monitoring-test.js
```

**Features:**
- Tests all monitoring categories
- Generates detailed test reports
- Validates error monitoring functionality
- Tests field tracking capabilities
- Verifies API monitoring
- Checks migration detection
- Validates UI visibility monitoring

### 3. Production Issue Simulation (`simulate-production-issues.js`)

Simulates various production issues to test the monitoring system.

**Usage:**
```bash
# Simulate all types of issues
node scripts/simulate-production-issues.js

# Simulate specific issue types
node scripts/simulate-production-issues.js field
node scripts/simulate-production-issues.js api
node scripts/simulate-production-issues.js server
node scripts/simulate-production-issues.js migration
node scripts/simulate-production-issues.js ui
```

**Features:**
- Simulates field visibility issues
- Simulates API errors and timeouts
- Simulates server errors
- Simulates database migration issues
- Simulates UI visibility problems
- Configurable simulation duration and intensity

## Monitoring Capabilities

### Error Monitoring
- Real-time error detection and reporting
- Backend and frontend error differentiation
- Error categorization and analysis
- Common error pattern identification

### Field Tracking
- Missing field detection
- Field visibility monitoring
- Form validation issue tracking
- Required field enforcement monitoring

### API Monitoring
- API response time tracking
- API error rate monitoring
- Timeout detection
- Endpoint availability monitoring
- Rate limit monitoring

### Migration Detection
- Database migration error detection
- Migration performance monitoring
- Schema change tracking
- Rollback failure detection

### UI Visibility Monitoring
- Live UI element visibility tracking
- Responsive design issue detection
- Missing UI component detection
- Cross-device visibility monitoring

## Configuration

The scripts can be configured using environment variables:

```bash
# API endpoint configuration
export API_URL=http://localhost:5000/api
export FRONTEND_URL=http://localhost:3000
export ADMIN_TOKEN=your-admin-token
```

## Running Tests

### Prerequisites
1. Node.js installed
2. Application server running
3. Database configured and accessible

### Running Individual Tests
```bash
# Run error monitoring tests
node scripts/test-error-monitoring.js

# Run comprehensive production monitoring tests
node scripts/production-monitoring-test.js

# Run production issue simulation
node scripts/simulate-production-issues.js
```

### Test Output
- Console output with real-time results
- Detailed test reports in JSON format
- Pass/fail statistics
- Error details and debugging information

## Integration with CI/CD

These scripts can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Production Monitoring Tests
  run: |
    node scripts/production-monitoring-test.js
  env:
    API_URL: ${{ secrets.API_URL }}
    ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
```

## Monitoring Dashboard

The Error Monitoring component in the application provides:

1. **Real-time Log Viewing**
   - Filter by log level (error, warning, info)
   - Filter by source (frontend, backend)
   - Date range filtering
   - User-specific filtering

2. **Log Analysis**
   - Error statistics and trends
   - Common error patterns
   - API activity monitoring
   - Frontend issue tracking
   - Migration problem detection

3. **Real-time Updates**
   - Automatic log refreshing
   - Live monitoring mode
   - Instant issue detection

## Best Practices

1. **Regular Testing**: Run monitoring tests regularly to ensure system health
2. **Issue Simulation**: Use simulation scripts to test monitoring capabilities
3. **Log Analysis**: Regularly review log analysis for patterns and trends
4. **Alert Configuration**: Configure alerts based on monitoring results
5. **Performance Monitoring**: Monitor API performance and response times
6. **Migration Tracking**: Track database migrations for issues

## Troubleshooting

### Common Issues
1. **Connection Errors**: Verify API endpoints and network connectivity
2. **Authentication Failures**: Check admin tokens and permissions
3. **Log Storage Issues**: Verify disk space and file permissions
4. **Performance Problems**: Monitor system resources during testing

### Debugging
- Check console output for detailed error messages
- Review generated test reports
- Verify environment variable configuration
- Ensure all services are running correctly

## Contributing

To add new test cases or monitoring capabilities:

1. Extend the existing test scripts
2. Add new issue templates to simulation scripts
3. Update the Error Monitoring component UI
4. Enhance backend log analysis capabilities
5. Add new monitoring categories as needed

## Support

For issues with the monitoring scripts or system:

1. Check the console output for error messages
2. Review the generated test reports
3. Verify all environment variables are set correctly
4. Ensure the application server is running
5. Check database connectivity and permissions