# TiDB Database Summary

This document provides a summary of the database configuration and schema for the Quodo3 application, which is designed to work with TiDB in production while using SQLite for development.

## Database Configuration

### Production (TiDB)
- **Database Type**: TiDB (MySQL-compatible distributed database)
- **Connection Protocol**: MySQL
- **Default Port**: 4000
- **Default User**: root
- **Default Database**: quodo3
- **SSL Support**: Configurable via environment variables

### Development (SQLite)
- **Database Type**: SQLite (file-based database)
- **Storage File**: database.sqlite
- **No Network Connection Required**

## Database Schema Overview

The application uses the following tables:

### Core Tables

1. **users** - Stores user information and authentication details
2. **meetings** - Stores meeting scheduling information
3. **meeting_users** - Junction table for many-to-many relationship between users and meetings
4. **tasks** - Stores task tracking information
5. **leaves** - Stores leave request information
6. **audit_logs** - Stores audit trail for user actions

### Additional Tables

7. **dropdowns** - Stores configurable dropdown values
8. **permission_templates** - Stores user permission templates
9. **files** - Stores file metadata and tracking information

## Key Table Structures

### users
```
- id (INTEGER, PRIMARY KEY)
- username (VARCHAR(255), UNIQUE, NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password (VARCHAR(255), NOT NULL)
- fullName (VARCHAR(255), NOT NULL)
- role (ENUM: SystemAdmin, Admin, Supervisor, Agent)
- office (VARCHAR(255))
- isActive (BOOLEAN)
```

### meetings
```
- id (INTEGER, PRIMARY KEY)
- subject (VARCHAR(255), NOT NULL)
- platform (VARCHAR(50), NOT NULL)
- date (DATE, NOT NULL)
- time (TIME, NOT NULL)
- duration (INTEGER)
- createdBy (INTEGER, NOT NULL)
- selectedUserIds (JSON, array of user IDs)
```

### meeting_users
```
- meetingId (INTEGER, PRIMARY KEY)
- userId (INTEGER, PRIMARY KEY)
```

## Key Features

### Cross-Database Compatibility
The application is designed to work with both:
- **TiDB/MySQL** in production environments
- **SQLite** in development environments

This is achieved through:
1. Using Sequelize ORM for database abstraction
2. Conditional logic for database-specific features
3. Manual filtering for SQLite where advanced operators aren't supported

### Dual Association Approach
For meetings and users, the application uses two methods to track associations:
1. **JSON Field** (`selectedUserIds` in meetings table) - Works with both databases
2. **Junction Table** (`meeting_users` table) - Proper relational approach

### Role-Based Access Control
The application implements role-based filtering:
- **Agents**: Can only see meetings they created or were invited to
- **Admin/Supervisor**: Can see all meetings in their office
- **SystemAdmin**: Can see all meetings

## Verification Results

Database verification confirmed:
✅ All required tables exist
✅ Correct column types and constraints
✅ Proper primary keys and relationships
✅ Accessible through application queries
✅ Compatible with both SQLite and TiDB

## Production Deployment

For production deployment with TiDB:
1. Set `DB_HOST` environment variable to TiDB server address
2. Set `DB_PORT` if different from default (4000)
3. Set `DB_USER` and `DB_PASSWORD` for authentication
4. Set `DB_NAME` for database name
5. Optionally enable SSL with `DB_SSL=true`

The application will automatically switch from SQLite to TiDB when these environment variables are set.