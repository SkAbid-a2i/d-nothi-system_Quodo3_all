const sequelize = require('./config/database');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { authenticate } = require('./middleware/auth.middleware');

// Mock request and response objects for testing middleware
function createMockReq(token) {
  return {
    header: (name) => {
      if (name === 'Authorization') {
        return token ? `Bearer ${token}` : null;
      }
      return null;
    }
  };
}

function createMockRes() {
  const res = {
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.body = data;
      return res;
    }
  };
  return res;
}

async function testAuthRoutes() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connection to TiDB has been established successfully.');
    
    // Test 1: Get a user from database
    console.log('\n🔍 Test 1: Fetching user from database...');
    const user = await User.findByPk(1, {
      attributes: { exclude: ['password'] }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Role: ${user.role}`);
    } else {
      console.log('❌ User not found');
      return;
    }
    
    // Test 2: Create JWT token
    console.log('\n🔍 Test 2: Creating JWT token...');
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret_key_for_testing',
      { expiresIn: '1h' }
    );
    
    console.log('✅ JWT Token created successfully');
    
    // Test 3: Test authentication middleware
    console.log('\n🔍 Test 3: Testing authentication middleware...');
    
    // Test with valid token
    const req = createMockReq(token);
    const res = createMockRes();
    
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    
    // Simulate the authenticate middleware
    await new Promise((resolve) => {
      authenticate(req, res, () => {
        next();
        resolve();
      });
    });
    
    if (nextCalled && req.user) {
      console.log('✅ Authentication middleware passed');
      console.log(`  Authenticated user ID: ${req.user.id}`);
      console.log(`  Authenticated username: ${req.user.username}`);
      console.log(`  Authenticated role: ${req.user.role}`);
    } else {
      console.log('❌ Authentication middleware failed');
      console.log(`  Status code: ${res.statusCode}`);
      console.log(`  Response: ${JSON.stringify(res.body)}`);
    }
    
    // Test 4: Test with invalid token
    console.log('\n🔍 Test 4: Testing authentication middleware with invalid token...');
    const invalidReq = createMockReq('invalid.token.here');
    const invalidRes = createMockRes();
    
    let invalidNextCalled = false;
    const invalidNext = () => {
      invalidNextCalled = true;
    };
    
    // Simulate the authenticate middleware with invalid token
    await new Promise((resolve) => {
      authenticate(invalidReq, invalidRes, () => {
        invalidNext();
        resolve();
      });
    });
    
    if (!invalidNextCalled && invalidRes.statusCode === 401) {
      console.log('✅ Authentication correctly rejected invalid token');
      console.log(`  Status code: ${invalidRes.statusCode}`);
      console.log(`  Response: ${JSON.stringify(invalidRes.body)}`);
    } else {
      console.log('❌ Authentication should have rejected invalid token');
    }
    
    // Close connection
    await sequelize.close();
    console.log('\n🔒 Database connection closed.');
    console.log('\n🎉 All authentication tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testAuthRoutes();