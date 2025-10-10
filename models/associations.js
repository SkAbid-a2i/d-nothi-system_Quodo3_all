const User = require('./User');
const Meeting = require('./Meeting');
const Collaboration = require('./Collaboration');

// Define associations
function setupAssociations() {
  // User associations
  User.hasMany(Meeting, {
    foreignKey: 'createdBy',
    as: 'createdMeetings'
  });

  User.belongsToMany(Meeting, {
    through: 'meeting_users',
    foreignKey: 'userId',
    otherKey: 'meetingId',
    as: 'selectedMeetings',
    timestamps: false
  });

  User.hasMany(Collaboration, {
    foreignKey: 'createdBy',
    as: 'createdCollaborations'
  });

  // Meeting associations
  Meeting.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'meetingCreator'
  });

  Meeting.belongsToMany(User, {
    through: 'meeting_users',
    foreignKey: 'meetingId',
    otherKey: 'userId',
    as: 'selectedUsers',
    timestamps: false
  });

  // Collaboration associations
  Collaboration.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'collaborationCreator'
  });
}

module.exports = { setupAssociations };