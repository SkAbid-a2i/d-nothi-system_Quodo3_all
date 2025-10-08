// Alternative database connection test with different username format
const { Sequelize } = require('sequelize');

console.log('=== Alternative Database Connection Test ===');

// Try with just the username part (without .root)
const configs = [
  {
    name: 'Full username with .root',
    username: '4VmPGSU3EFyEhLJ.root',
    password: 'gWe9gfuhBBE50H1u'
  },
  {
    name: 'Username without .root',
    username: '4VmPGSU3EFyEhLJ',
    password: 'gWe9gfuhBBE50H1u'
  },
  {
    name: 'Username with quotes',
    username: '"4VmPGSU3EFyEhLJ.root"',
    password: 'gWe9gfuhBBE50H1u'
  }
];

async function testConfig(config) {
  console.log(`\n--- Testing: ${config.name} ---`);
  console.log(`Username: ${config.username}`);
  
  const sequelize = new Sequelize('d_nothi_db', config.username, config.password, {
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 10000,
      idle: 10000
    },
    timezone: '+00:00'
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.parent ? error.parent.message : error.message);
    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignore close errors
    }
    return false;
  }
}

async function testAllConfigs() {
  console.log('Testing different username configurations...\n');
  
  let success = false;
  for (const config of configs) {
    if (await testConfig(config)) {
      success = true;
      console.log(`\n🎉 SUCCESS with configuration: ${config.name}`);
      console.log(`Recommended username: ${config.username}`);
      break;
    }
  }
  
  if (!success) {
    console.log('\n❌ All configurations failed');
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify credentials with TiDB Cloud dashboard');
    console.log('2. Check if your IP is whitelisted in TiDB Cloud');
    console.log('3. Try creating a new user with simpler credentials');
    console.log('4. Contact TiDB support for assistance');
  }
}

// Run tests
testAllConfigs();