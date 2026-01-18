const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPreferences = sequelize.define('UserPreferences', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
    // Note: Foreign key constraint is omitted for SQLite compatibility
    // references: {
    //   model: 'users',
    //   key: 'id'
    // },
    // onDelete: 'CASCADE',
    // onUpdate: 'CASCADE'
  },
  theme: {
    type: DataTypes.STRING(20),
    defaultValue: 'light'
  },
  primaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#667eea'
  },
  secondaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#f093fb'
  },
  backgroundType: {
    type: DataTypes.STRING(20),
    defaultValue: 'solid'
  },
  backgroundColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff'
  },
  gradientEndColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#f093fb'
  },
  gradientDirection: {
    type: DataTypes.STRING(20),
    defaultValue: 'to right'
  },
  backgroundImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'en'
  }
}, {
  timestamps: true,
  tableName: 'user_preferences',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = UserPreferences;