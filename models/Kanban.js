const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  }
}, {
  timestamps: true,
  tableName: 'kanban',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Kanban;