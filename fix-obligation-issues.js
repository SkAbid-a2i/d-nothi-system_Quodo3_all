// Script to fix Obligation dropdown issues
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Fixing Obligation dropdown issues...');

// Ensure Obligation values exist and are active
const obligationValues = [
  'Compliance',
  'Legal',
  'Financial',
  'Operational',
  'Regulatory',
  'Contractual'
];

// Check if Obligation values exist, if not, create them
obligationValues.forEach((value, index) => {
  db.get("SELECT id FROM dropdowns WHERE type = 'Obligation' AND value = ?", [value], (err, row) => {
    if (err) {
      console.error('Error checking Obligation value:', err.message);
      return;
    }
    
    if (!row) {
      // Insert missing Obligation value
      db.run(
        "INSERT INTO dropdowns (type, value, isActive, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
        ['Obligation', value, 1],
        function(err) {
          if (err) {
            console.error('Error inserting Obligation value:', err.message);
          } else {
            console.log(`Inserted Obligation value: ${value} with ID: ${this.lastID}`);
          }
        }
      );
    } else {
      // Ensure the Obligation value is active
      db.run(
        "UPDATE dropdowns SET isActive = 1 WHERE id = ?",
        [row.id],
        function(err) {
          if (err) {
            console.error('Error updating Obligation value:', err.message);
          } else if (this.changes > 0) {
            console.log(`Activated Obligation value: ${value}`);
          }
        }
      );
    }
  });
});

// Check for any duplicate Obligation values
db.all("SELECT id, value, COUNT(*) as count FROM dropdowns WHERE type = 'Obligation' GROUP BY value HAVING COUNT(*) > 1", (err, rows) => {
  if (err) {
    console.error('Error checking for duplicate Obligation values:', err.message);
    return;
  }
  
  if (rows.length > 0) {
    console.log('Found duplicate Obligation values:', rows);
    // Keep the first one and deactivate the rest
    rows.forEach(row => {
      db.all("SELECT id FROM dropdowns WHERE type = 'Obligation' AND value = ? ORDER BY id", [row.value], (err, ids) => {
        if (err) {
          console.error('Error getting Obligation IDs:', err.message);
          return;
        }
        
        // Deactivate all but the first one
        for (let i = 1; i < ids.length; i++) {
          db.run("UPDATE dropdowns SET isActive = 0 WHERE id = ?", [ids[i].id], function(err) {
            if (err) {
              console.error('Error deactivating duplicate Obligation:', err.message);
            } else {
              console.log(`Deactivated duplicate Obligation value: ${row.value} with ID: ${ids[i].id}`);
            }
          });
        }
      });
    });
  } else {
    console.log('No duplicate Obligation values found.');
  }
});

// Close the database connection after a delay to ensure all operations complete
setTimeout(() => {
  db.close();
  console.log('Database connection closed.');
}, 2000);