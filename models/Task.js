const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  service: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  office: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  comments: {
    type: DataTypes.JSON, // Store comments as JSON array
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON, // Store attachments as JSON array
    defaultValue: []
  },
  // File upload field
  files: {
    type: DataTypes.JSON, // Store file information as JSON array
    defaultValue: []
  }
  // Removed assignedTo field as requested
}, {
  timestamps: true,
  tableName: 'tasks',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Task;