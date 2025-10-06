// Compatible Task model that handles schema mismatch
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
  // Handle the case where files column might not exist
  files: {
    type: DataTypes.JSON, // Store file information as JSON array
    defaultValue: [],
    // Allow null for backward compatibility
    allowNull: true
  }
  // Note: assignedTo field is not defined here as it should be removed
}, {
  timestamps: true,
  tableName: 'tasks',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  // Handle schema mismatch gracefully
  validate: {
    // Custom validation if needed
  }
});

// Add methods to handle schema compatibility
Task.prototype.getFiles = function() {
  // Handle case where files field might be undefined
  return this.files || [];
};

Task.prototype.setFiles = function(files) {
  // Handle case where files field might not exist in database
  this.files = files || [];
};

module.exports = Task;