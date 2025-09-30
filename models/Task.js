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
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  office: {
    type: DataTypes.STRING,
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
  }
}, {
  timestamps: true,
  tableName: 'tasks'
});

module.exports = Task;