const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dropdown = sequelize.define('Dropdown', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Source', 'Category', 'Service', 'Office'),
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentType: {
    type: DataTypes.STRING
  },
  parentValue: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
  tableName: 'dropdowns'
});

module.exports = Dropdown;