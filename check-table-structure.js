const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('database.sqlite');

console.log('Checking dropdowns table structure...');

// Get table info
db.all("PRAGMA table_info(dropdowns);", (err, rows) => {
  if (err) {
    console.error('Error getting table info:', err.message);
  } else {
    console.log('Table structure:');
    rows.forEach(row => {
      console.log(`  ${row.name} (${row.type}) ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });
  }
  
  // Check the current ENUM values (if any)
  console.log('\nChecking existing dropdown types...');
  db.all("SELECT DISTINCT type FROM dropdowns;", (err, rows) => {
    if (err) {
      console.error('Error getting dropdown types:', err.message);
    } else {
      console.log('Existing dropdown types:');
      rows.forEach(row => {
        console.log(`  - ${row.type}`);
      });
    }
    
    // Close the database
    db.close();
  });
});