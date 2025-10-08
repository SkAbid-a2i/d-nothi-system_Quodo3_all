const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY, // Changed to DATEONLY for better handling
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  service: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  office: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  userInformation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  collate: 'utf8mb4_unicode_ci',
  // Add indexes for better query performance
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['office']
    },
    {
      fields: ['status']
    },
    {
      fields: ['date']
    }
  ]
});

module.exports = Task;