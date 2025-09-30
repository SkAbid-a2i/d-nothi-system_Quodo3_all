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
    type: DataTypes.STRING(255)
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  ipAddress: {
    type: DataTypes.STRING(255)
  },
  userAgent: {
    type: DataTypes.STRING(255)
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = AuditLog;