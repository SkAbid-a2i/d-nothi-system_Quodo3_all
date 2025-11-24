// Script to test Kanban API endpoints directly
const sequelize = require('../config/database');
const Kanban = require('../models/Kanban');

async function testKanbanAPI() {
  try {
    console.log('=== Kanban API Test ===\n');
    
    // Test database connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Test model sync
    console.log('2. Testing model sync...');
    await Kanban.sync({ alter: true });
    console.log('✅ Model sync successful\n');
    
    // Test fetching all cards
    console.log('3. Testing GET /api/kanban (fetch all cards)...');
    try {
      const cards = await Kanban.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5 // Limit for testing
      });
      console.log(`✅ Found ${cards.length} cards`);
      if (cards.length > 0) {
        console.log('   Sample card:', {
          id: cards[0].id,
          title: cards[0].title,
          status: cards[0].status,
          createdAt: cards[0].createdAt
        });
      }
    } catch (fetchError) {
      console.log('❌ Error fetching cards:', fetchError.message);
      if (fetchError.parent) {
        console.log('   Parent error:', fetchError.parent.message);
      }
    }
    
    // Test creating a card
    console.log('\n4. Testing POST /api/kanban (create card)...');
    try {
      const newCard = await Kanban.create({
        title: 'API Test Card',
        description: 'This card was created via API test',
        status: 'testing'
      });
      console.log('✅ Card created successfully:', {
        id: newCard.id,
        title: newCard.title,
        status: newCard.status,
        createdAt: newCard.createdAt
      });
      
      // Test updating the card
      console.log('\n5. Testing PUT /api/kanban/:id (update card)...');
      try {
        newCard.status = 'done';
        await newCard.save();
        console.log('✅ Card updated successfully');
      } catch (updateError) {
        console.log('❌ Error updating card:', updateError.message);
        if (updateError.parent) {
          console.log('   Parent error:', updateError.parent.message);
        }
      }
      
      // Test deleting the card
      console.log('\n6. Testing DELETE /api/kanban/:id (delete card)...');
      try {
        await newCard.destroy();
        console.log('✅ Card deleted successfully');
      } catch (deleteError) {
        console.log('❌ Error deleting card:', deleteError.message);
        if (deleteError.parent) {
          console.log('   Parent error:', deleteError.parent.message);
        }
      }
    } catch (createError) {
      console.log('❌ Error creating card:', createError.message);
      if (createError.parent) {
        console.log('   Parent error:', createError.parent.message);
      }
    }
    
    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.parent) {
      console.error('   Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testKanbanAPI();