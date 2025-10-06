// Debug the database configuration
require('dotenv').config();

console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

// Test with mysql2 directly
const mysql = require('mysql2');

console.log('\nTesting with mysql2...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error('mysql2 connection failed:', err.message);
    if (err.code) {
      console.error('Error code:', err.code);
    }
    if (err.errno) {
      console.error('Error number:', err.errno);
    }
    if (err.sqlState) {
      console.error('SQL state:', err.sqlState);
    }
    return;
  }
  
  console.log('mysql2 connection successful!');
  connection.end();
});

// Test with sequelize
console.log('\nTesting with sequelize...');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: console.log,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connection successful!');
    return sequelize.close();
  })
  .catch(err => {
    console.error('Sequelize connection failed:', err.message);
    if (err.parent) {
      console.error('Parent error:', err.parent.message);
      if (err.parent.code) {
        console.error('Parent error code:', err.parent.code);
      }
      if (err.parent.errno) {
        console.error('Parent error number:', err.parent.errno);
      }
      if (err.parent.sqlState) {
        console.error('Parent SQL state:', err.parent.sqlState);
      }
    }
  });