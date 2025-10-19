const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for broadcast notifications
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  recipientRole: {
    type: DataTypes.STRING,
    allowNull: true, // For role-based notifications (Admin, SystemAdmin, Supervisor)
    validate: {
      isIn: [['Admin', 'SystemAdmin', 'Supervisor', null]]
    }
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['recipientRole']
    },
    {
      fields: ['isRead']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Notification;