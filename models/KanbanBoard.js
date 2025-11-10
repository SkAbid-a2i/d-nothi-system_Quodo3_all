const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KanbanBoard = sequelize.define('KanbanBoard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  column: {
    type: DataTypes.ENUM('backlog', 'next', 'inProgress', 'testing', 'validate', 'done'),
    defaultValue: 'backlog'
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
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
    allowNull: true
  }
}, {
  tableName: 'kanban_boards',
  timestamps: true,
  indexes: [
    {
      fields: ['column']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['position']
    }
  ]
});

module.exports = KanbanBoard;