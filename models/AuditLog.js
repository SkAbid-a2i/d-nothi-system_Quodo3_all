const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER
  },
  userName: {
    type: DataTypes.STRING
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'audit_logs'
});

module.exports = AuditLog;