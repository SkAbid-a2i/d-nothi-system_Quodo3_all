const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dropdown = sequelize.define('Dropdown', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation'),
    allowNull: false
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  parentType: {
    type: DataTypes.STRING(255)
  },
  parentValue: {
    type: DataTypes.STRING(255)
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
  tableName: 'dropdowns',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Dropdown;