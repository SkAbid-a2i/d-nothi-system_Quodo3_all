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
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Always'
  },
  urgency: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'None'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  as: 'creator',
  onDelete: 'CASCADE'
});

// Make sure the association is set up in User model as well
User.hasMany(Collaboration, {
  foreignKey: 'createdBy',
  as: 'collaborations',
  onDelete: 'CASCADE'
});

module.exports = Collaboration;