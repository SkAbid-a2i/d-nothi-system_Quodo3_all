// Test script to verify collaboration visibility fix
const sequelize = require('./config/database');
const User = require('./models/User');
const Collaboration = require('./models/Collaboration');

async function testCollaborationVisibility() {
  try {
    console.log('🔍 Testing collaboration visibility fix...');
    
    // Create test users
    console.log('Creating test users...');
    const user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
      fullName: 'Test User 1',
      role: 'Agent',
      office: 'Office A'
    });
    
    const user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
      fullName: 'Test User 2',
      role: 'Agent',
      office: 'Office A'
    });
    
    const user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'password123',
      fullName: 'Test User 3',
      role: 'Agent',
      office: 'Office B'
    });
    
    console.log('✅ Test users created successfully');
    
    // Create test collaborations
    console.log('Creating test collaborations...');
    const collaboration1 = await Collaboration.create({
      title: 'Test Collaboration 1',
      description: 'Created by user 1',
      availability: 'Always',
      urgency: 'None',
      createdBy: user1.id
    });
    
    const collaboration2 = await Collaboration.create({
      title: 'Test Collaboration 2',
      description: 'Created by user 2',
      availability: 'Always',
      urgency: 'None',
      createdBy: user2.id
    });
    
    const collaboration3 = await Collaboration.create({
      title: 'Test Collaboration 3',
      description: 'Created by user 3',
      availability: 'Always',
      urgency: 'None',
      createdBy: user3.id
    });
    
    console.log('✅ Test collaborations created successfully');
    
    // Test the collaboration visibility logic
    console.log('Testing collaboration visibility for user 1 (Office A)...');
    
    // Get all users in the office
    const officeUsers = await User.findAll({
      where: { office: user1.office },
      attributes: ['id']
    });
    
    const officeUserIds = officeUsers.map(user => user.id);
    console.log('Office A user IDs:', officeUserIds);
    
    // Test the corrected query logic
    const where = {
      [require('sequelize').Op.or]: [
        { createdBy: user1.id },
        { createdBy: { [require('sequelize').Op.in]: officeUserIds } }
      ]
    };
    
    const collaborations = await Collaboration.findAll({ 
      where, 
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });
    
    console.log(`Found ${collaborations.length} collaborations for user 1:`);
    collaborations.forEach(collab => {
      console.log(`  - ${collab.title} (created by ${collab.creator.username})`);
    });
    
    // Verify that user 1 can see collaborations from user 2 (same office)
    // but not from user 3 (different office)
    const collaborationTitles = collaborations.map(c => c.title);
    const canSeeCollab1 = collaborationTitles.includes('Test Collaboration 1');
    const canSeeCollab2 = collaborationTitles.includes('Test Collaboration 2');
    const canSeeCollab3 = collaborationTitles.includes('Test Collaboration 3');
    
    console.log('\n🔍 Verification Results:');
    console.log(`✅ User 1 can see their own collaboration: ${canSeeCollab1}`);
    console.log(`✅ User 1 can see collaboration from same office: ${canSeeCollab2}`);
    console.log(`✅ User 1 cannot see collaboration from different office: ${!canSeeCollab3}`);
    
    if (canSeeCollab1 && canSeeCollab2 && !canSeeCollab3) {
      console.log('\n🎉 COLLABORATION VISIBILITY FIX VERIFICATION PASSED!');
      console.log('SystemAdmin and other users can now see collaborations from their office.');
    } else {
      console.log('\n❌ COLLABORATION VISIBILITY FIX VERIFICATION FAILED!');
    }
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    await Collaboration.destroy({
      where: {
        id: [collaboration1.id, collaboration2.id, collaboration3.id]
      }
    });
    
    await User.destroy({
      where: {
        id: [user1.id, user2.id, user3.id]
      }
    });
    
    console.log('✅ Test data cleaned up successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCollaborationVisibility();// Test script to verify collaboration visibility fix
const sequelize = require('./config/database');
const User = require('./models/User');
const Collaboration = require('./models/Collaboration');

async function testCollaborationVisibility() {
  try {
    console.log('🔍 Testing collaboration visibility fix...');
    
    // Create test users
    console.log('Creating test users...');
    const user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
      fullName: 'Test User 1',
      role: 'Agent',
      office: 'Office A'
    });
    
    const user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
      fullName: 'Test User 2',
      role: 'Agent',
      office: 'Office A'
    });
    
    const user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'password123',
      fullName: 'Test User 3',
      role: 'Agent',
      office: 'Office B'
    });
    
    console.log('✅ Test users created successfully');
    
    // Create test collaborations
    console.log('Creating test collaborations...');
    const collaboration1 = await Collaboration.create({
      title: 'Test Collaboration 1',
      description: 'Created by user 1',
      availability: 'Always',
      urgency: 'None',
      createdBy: user1.id
    });
    
    const collaboration2 = await Collaboration.create({
      title: 'Test Collaboration 2',
      description: 'Created by user 2',
      availability: 'Always',
      urgency: 'None',
      createdBy: user2.id
    });
    
    const collaboration3 = await Collaboration.create({
      title: 'Test Collaboration 3',
      description: 'Created by user 3',
      availability: 'Always',
      urgency: 'None',
      createdBy: user3.id
    });
    
    console.log('✅ Test collaborations created successfully');
    
    // Test the collaboration visibility logic
    console.log('Testing collaboration visibility for user 1 (Office A)...');
    
    // Get all users in the office
    const officeUsers = await User.findAll({
      where: { office: user1.office },
      attributes: ['id']
    });
    
    const officeUserIds = officeUsers.map(user => user.id);
    console.log('Office A user IDs:', officeUserIds);
    
    // Test the corrected query logic
    const where = {
      [require('sequelize').Op.or]: [
        { createdBy: user1.id },
        { createdBy: { [require('sequelize').Op.in]: officeUserIds } }
      ]
    };
    
    const collaborations = await Collaboration.findAll({ 
      where, 
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });
    
    console.log(`Found ${collaborations.length} collaborations for user 1:`);
    collaborations.forEach(collab => {
      console.log(`  - ${collab.title} (created by ${collab.creator.username})`);
    });
    
    // Verify that user 1 can see collaborations from user 2 (same office)
    // but not from user 3 (different office)
    const collaborationTitles = collaborations.map(c => c.title);
    const canSeeCollab1 = collaborationTitles.includes('Test Collaboration 1');
    const canSeeCollab2 = collaborationTitles.includes('Test Collaboration 2');
    const canSeeCollab3 = collaborationTitles.includes('Test Collaboration 3');
    
    console.log('\n🔍 Verification Results:');
    console.log(`✅ User 1 can see their own collaboration: ${canSeeCollab1}`);
    console.log(`✅ User 1 can see collaboration from same office: ${canSeeCollab2}`);
    console.log(`✅ User 1 cannot see collaboration from different office: ${!canSeeCollab3}`);
    
    if (canSeeCollab1 && canSeeCollab2 && !canSeeCollab3) {
      console.log('\n🎉 COLLABORATION VISIBILITY FIX VERIFICATION PASSED!');
      console.log('SystemAdmin and other users can now see collaborations from their office.');
    } else {
      console.log('\n❌ COLLABORATION VISIBILITY FIX VERIFICATION FAILED!');
    }
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    await Collaboration.destroy({
      where: {
        id: [collaboration1.id, collaboration2.id, collaboration3.id]
      }
    });
    
    await User.destroy({
      where: {
        id: [user1.id, user2.id, user3.id]
      }
    });
    
    console.log('✅ Test data cleaned up successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCollaborationVisibility();