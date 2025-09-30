const { spawn } = require('child_process');
const path = require('path');

// Start backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
});

// Start frontend server
const frontend = spawn('npm', ['start'], {
  cwd: path.resolve(__dirname, '..', 'client'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});