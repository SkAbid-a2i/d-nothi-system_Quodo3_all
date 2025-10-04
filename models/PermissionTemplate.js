const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PermissionTemplate = sequelize.define('PermissionTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
  tableName: 'permission_templates',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = PermissionTemplate;