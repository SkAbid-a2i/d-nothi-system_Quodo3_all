const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Add the userInformation column to the tasks table
db.serialize(() => {
  db.run(`ALTER TABLE tasks ADD COLUMN userInformation TEXT`, (err) => {
    if (err) {
      console.log('Column might already exist or there was an error:', err.message);
    } else {
      console.log('Successfully added userInformation column to tasks table');
    }
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});