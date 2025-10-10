const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Collaboration = sequelize.define('Collaboration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  availability: {
    type: DataTypes.ENUM('Always', 'None', 'Week', 'Month', 'Year', 'Day', 'Half Day'),
    defaultValue: 'Always'
  },
  urgency: {
    type: DataTypes.ENUM('Immediate', 'Moderate', 'Asap', 'Daily', 'None'),
    defaultValue: 'None'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'collaborations',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

// Define associations
Collaboration.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

module.exports = Collaboration;