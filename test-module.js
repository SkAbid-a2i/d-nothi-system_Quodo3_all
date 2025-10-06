// Test file to check module loading
console.log('Testing module loading...');

try {
  const Task = require('./models/Task');
  console.log('Task model loaded successfully');
  console.log('Task model keys:', Object.keys(Task));
} catch (error) {
  console.error('Error loading Task model:', error);
}

console.log('Test completed');