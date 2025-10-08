// Test different credential combinations
const mysql = require('mysql2/promise');

console.log('=== Testing Credential Combinations ===');

// Different credential combinations to test
const combinations = [
  {
    name: 'Original credentials',
    user: '4VmPGSU3EFyEhLJ.root',
    password: 'gWe9gfuhBBE50H1u'
  },
  {
    name: 'Username without .root',
    user: '4VmPGSU3EFyEhLJ',
    password: 'gWe9gfuhBBE50H1u'
  },
  {
    name: 'Username with database prefix',
    user: 'd_nothi_db.4VmPGSU3EFyEhLJ',
    password: 'gWe9gfuhBBE50H1u'
  }
];

async function testCombination(combination) {
  console.log(`\n--- Testing: ${combination.name} ---`);
  console.log(`User: ${combination.user}`);
  
  try {
    const connection = await mysql.createConnection({
      host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: combination.user,
      password: combination.password,
      database: 'd_nothi_db',
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 10000,
      timeout: 10000
    });
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [results] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', results);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

async function testAllCombinations() {
  console.log('Testing different credential combinations...\n');
  
  let success = false;
  for (const combination of combinations) {
    if (await testCombination(combination)) {
      success = true;
      console.log(`\n🎉 SUCCESS with combination: ${combination.name}`);
      console.log(`Recommended credentials: User=${combination.user}, Password=${combination.password}`);
      break;
    }
  }
  
  if (!success) {
    console.log('\n❌ All credential combinations failed');
    console.log('\n=== Next Steps ===');
    console.log('1. Verify credentials in TiDB Cloud dashboard');
    console.log('2. Try resetting the password');
    console.log('3. Create a new user with simpler credentials');
    console.log('4. Contact TiDB support with error details');
  }
  
  return success;
}

// Run tests
testAllCombinations().catch(console.error);