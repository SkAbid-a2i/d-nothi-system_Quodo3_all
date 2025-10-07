const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  platform: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'zoom'
  },
  location: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  selectedUserIds: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'meetings',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

// Define associations
Meeting.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Association for selected users
Meeting.belongsToMany(User, {
  through: 'MeetingUsers',
  foreignKey: 'meetingId',
  otherKey: 'userId',
  as: 'selectedUsers'
});

module.exports = Meeting;