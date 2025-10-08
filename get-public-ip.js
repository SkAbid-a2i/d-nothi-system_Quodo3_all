const https = require('https');

console.log('Finding your public IP address...');

https.get('https://api.ipify.org', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Your public IP address is:', data);
    console.log('\n📋 Add this IP to your TiDB Cloud whitelist:');
    console.log('   1. Log in to https://tidbcloud.com/');
    console.log('   2. Go to your cluster');
    console.log('   3. Navigate to "Access Control"');
    console.log('   4. Add this IP to the whitelist');
    
    console.log('\n🔧 Then test the connection with:');
    console.log(`   mysql --ssl-mode=REQUIRED \\`);
    console.log(`         --host=gateway01.eu-central-1.prod.aws.tidbcloud.com \\`);
    console.log(`         --port=4000 \\`);
    console.log(`         --user=4VmPGSU3EFyEhLJ.root \\`);
    console.log(`         --password \\`);
    console.log(`         --database=d_nothi_db`);
  });
}).on('error', (err) => {
  console.log('❌ Error finding IP address:', err.message);
  console.log('Try running: curl ifconfig.me');
});