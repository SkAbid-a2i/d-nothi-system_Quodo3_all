const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking Obligation values in the database...');

// Query for Obligation values
db.all("SELECT * FROM dropdowns WHERE type = 'Obligation'", (err, rows) => {
  if (err) {
    console.error('Error querying database:', err.message);
    return;
  }
  
  console.log('Found Obligation values:', rows);
  console.log('Total count:', rows.length);
  
  if (rows.length === 0) {
    console.log('No Obligation values found in the database.');
  } else {
    console.log('Obligation values exist in the database.');
  }
  
  // Close the database connection
  db.close();
});