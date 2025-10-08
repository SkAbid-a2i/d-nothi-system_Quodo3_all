// Detailed database connection diagnostic script
const { Sequelize } = require('sequelize');

console.log('=== Database Connection Diagnostic ===');

// Environment variables
const config = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  username: '4VmPGSU3EFyEhLJ.root',
  password: 'gWe9gfuhBBE50H1u',
  database: 'd_nothi_db'
};

console.log('Connection Configuration:');
console.log('- Host:', config.host);
console.log('- Port:', config.port);
console.log('- Username:', config.username);
console.log('- Database:', config.database);
console.log('- Password length:', config.password.length);

// Create sequelize instance with detailed logging
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    }
  },
  logging: (msg) => console.log('SQL Log:', msg),
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+00:00',
  benchmark: true
});

async function diagnoseConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    await sequelize.authenticate();
    console.log('✅ Basic connection successful');
    
    console.log('\n2. Testing query execution...');
    const [results] = await sequelize.query('SELECT 1 as connection_test');
    console.log('✅ Query execution successful:', results);
    
    console.log('\n3. Testing database access...');
    const [dbResults] = await sequelize.query('SHOW DATABASES');
    const databases = dbResults.map(row => row.Database);
    console.log('✅ Database access successful');
    console.log('Available databases:', databases.filter(db => db.includes('nothi')));
    
    if (databases.includes(config.database)) {
      console.log(`\n4. Testing access to ${config.database}...`);
      await sequelize.query(`USE \`${config.database}\``);
      console.log(`✅ Access to ${config.database} successful`);
      
      console.log('\n5. Testing table listing...');
      const [tableResults] = await sequelize.query('SHOW TABLES');
      console.log('✅ Table listing successful');
      console.log('Tables found:', tableResults);
    } else {
      console.log(`\n⚠️  Database ${config.database} not found in available databases`);
    }
    
    await sequelize.close();
    console.log('\n✅ All diagnostics passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
      
      // Check for specific error types
      if (error.parent.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('\n🔐 ACCESS DENIED - Possible causes:');
        console.error('1. Incorrect username or password');
        console.error('2. User does not have access from this IP address');
        console.error('3. User does not have required privileges');
        console.error('4. Account may be locked or expired');
      } else if (error.parent.code === 'ECONNREFUSED') {
        console.error('\n🔌 CONNECTION REFUSED - Possible causes:');
        console.error('1. Database server is not running');
        console.error('2. Incorrect host or port');
        console.error('3. Firewall blocking connection');
      } else if (error.parent.code === 'ENOTFOUND') {
        console.error('\n🔍 HOST NOT FOUND - Possible causes:');
        console.error('1. Incorrect hostname');
        console.error('2. DNS resolution issues');
        console.error('3. Network connectivity problems');
      }
    }
    
    try {
      await sequelize.close();
      console.log('🔒 Connection closed.');
    } catch (closeError) {
      console.error('❌ Error closing connection:', closeError.message);
    }
  }
}

// Run diagnostics
diagnoseConnection();