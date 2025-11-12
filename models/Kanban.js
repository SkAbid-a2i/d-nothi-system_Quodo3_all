const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Kanban = sequelize.define('Kanban', {
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
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Backlog'
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
  tableName: 'kanban',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

// Define associations
Kanban.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'CASCADE'
});

// Make sure the association is set up in User model as well
User.hasMany(Kanban, {
  foreignKey: 'createdBy',
  as: 'kanbanItems',
  onDelete: 'CASCADE'
});

module.exports = Kanban;