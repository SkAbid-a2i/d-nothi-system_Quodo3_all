const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeetingUsers = sequelize.define('MeetingUsers', {
  meetingId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'meetings',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: false,
  tableName: 'meeting_users'
});

module.exports = MeetingUsers;