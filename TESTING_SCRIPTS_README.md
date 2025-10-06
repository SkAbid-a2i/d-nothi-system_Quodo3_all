# Testing Scripts

This directory contains various scripts to help test and verify the application before deployment.

## Available Scripts

### Database Testing
- `npm run test:db` - Test database connection and basic table access
- `npm run test:tables` - Check if all required database tables exist
- `npm run test:admin` - Verify admin user exists and create if missing

### API Testing
- `npm run test:api` - Test all API endpoints with sample requests

### End-to-End Testing
- `npm run test:e2e` - Run comprehensive end-to-end tests
- `npm run test:comprehensive` - Run all tests in sequence with interactive prompts

## Usage Instructions

### Quick Start
1. Ensure your `.env` file is configured with correct database credentials
2. Run `npm run test:db` to verify database connection
3. Run `npm run test:api` to test API endpoints (requires server running)
4. Run `npm run test:e2e` for comprehensive testing

### Comprehensive Testing
Run `npm run test:comprehensive` for a complete testing suite that will:
1. Test database connection
2. Check required tables
3. Verify admin user
4. Test API endpoints (interactive)
5. Run end-to-end tests

## Prerequisites

Before running tests, ensure:
1. Database credentials are correct in `.env` file
2. Backend server is running for API tests (`npm run dev`)
3. All npm dependencies are installed (`npm install`)

## Troubleshooting

### Database Connection Errors
- Verify credentials in `.env` file
- Check network connectivity to database
- Ensure database user has proper permissions

### API Test Failures
- Ensure backend server is running (`npm run dev`)
- Check console output for specific error messages
- Verify API endpoints in `routes/` directory

### Test Script Issues
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Review script output for specific error details

## Adding New Tests

To add new tests:
1. Create a new script in the `scripts/` directory
2. Add the script to `package.json` scripts section
3. Document the new script in this README
4. Update `DEPLOYMENT_CHECKLIST.md` if applicable

## Best Practices

1. Run tests regularly during development
2. Always run comprehensive tests before deployment
3. Fix any test failures before pushing to production
4. Update tests when adding new features
5. Keep test data separate from production data