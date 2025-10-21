const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE, // Changed back to DATE to match database
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Date is required'
      },
      isDate: {
        msg: 'Date must be a valid date'
      }
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
      notEmpty: {
        msg: 'User ID is required'
      }
    }
  },
  userName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'User name is required'
      }
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
      notEmpty: {
        msg: 'Description is required'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  // Add obligation field
  obligation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  // Removed flag field as requested
  comments: {
    type: DataTypes.JSON, // Store comments as JSON array
    defaultValue: [],
    validate: {
      isValidJSON(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Comments must be an array');
        }
      }
    }
  },
  attachments: {
    type: DataTypes.JSON, // Store attachments as JSON array
    defaultValue: [],
    validate: {
      isValidJSON(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Attachments must be an array');
        }
      }
    }
  },
  // File upload field
  files: {
    type: DataTypes.JSON, // Store file information as JSON array
    defaultValue: [],
    validate: {
      isValidJSON(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Files must be an array');
        }
      }
    }
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