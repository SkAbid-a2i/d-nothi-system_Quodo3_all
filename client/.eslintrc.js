module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Convert problematic rules to warnings in CI environment
    'no-unused-vars': 'warn',
    'react/jsx-pascal-case': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
};