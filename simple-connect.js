const { Sequelize } = require('sequelize');

console.log('Testing connection to TiDB Cloud...');

// Simple connection test with a different variable name
const sequelizeTest = new Sequelize('d_nothi_db', '4VmPGSU3EFyEhLJ.root', 'gWe9gfuhBBE50H1u', {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
  },
  logging: console.log,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await sequelizeTest.authenticate();
    console.log('✅ Connection successful!');
    
    // Test with a simple query
    const [results] = await sequelizeTest.query('SELECT USER(), DATABASE()');
    console.log('User:', results[0]['USER()']);
    console.log('Database:', results[0]['DATABASE()']);
    
    // Check if tasks table exists
    console.log('\nChecking for tasks table...');
    try {
      const [tableResults] = await sequelizeTest.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'd_nothi_db' 
        AND TABLE_NAME = 'tasks'
      `);
      
      if (tableResults.length > 0) {
        console.log('✅ Tasks table exists');
        
        // Get table schema
        const [schemaResults] = await sequelizeTest.query(`
          SELECT 
            COLUMN_NAME,
            COLUMN_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT,
            COLUMN_KEY,
            EXTRA
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'd_nothi_db' 
          AND TABLE_NAME = 'tasks'
          ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\nTasks table schema:');
        console.log('Column Name'.padEnd(20) + 'Type'.padEnd(20) + 'Nullable'.padEnd(12) + 'Key'.padEnd(10) + 'Extra');
        console.log('-'.repeat(80));
        
        schemaResults.forEach(row => {
          console.log(
            row.COLUMN_NAME.padEnd(20) +
            row.COLUMN_TYPE.padEnd(20) +
            row.IS_NULLABLE.padEnd(12) +
            row.COLUMN_KEY.padEnd(10) +
            row.EXTRA
          );
        });
      } else {
        console.log('❌ Tasks table not found');
        
        // Check for any tables with 'task' in the name
        const [searchResults] = await sequelizeTest.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = 'd_nothi_db' 
          AND TABLE_NAME LIKE '%task%'
        `);
        
        if (searchResults.length > 0) {
          console.log('Found tables with "task" in name:');
          searchResults.forEach(row => {
            console.log('  -', row.TABLE_NAME);
          });
        }
      }
    } catch (schemaError) {
      console.error('Error checking table schema:', schemaError.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
    
    // Provide troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your credentials in TiDB Cloud console');
    console.log('2. Check that your IP is whitelisted in TiDB Cloud Access Control');
    console.log('3. Your IP appears to be: 103.159.72.119');
    console.log('4. Ensure the database d_nothi_db exists');
    console.log('5. Verify user 4VmPGSU3EFyEhLJ.root has access to the database');
  } finally {
    await sequelizeTest.close();
  }
}

testConnection();