# TiDB Database Schema Documentation

This document provides a comprehensive overview of the database schema used in the Quodo3 application, which is designed to work with TiDB (TiDB is a distributed SQL database that supports MySQL protocol).

## Database Configuration

The application uses the following configuration for TiDB:
- **Host**: Configurable via `DB_HOST` environment variable (default: localhost)
- **Port**: Configurable via `DB_PORT` environment variable (default: 4000)
- **User**: Configurable via `DB_USER` environment variable (default: root)
- **Database**: Configurable via `DB_NAME` environment variable (default: quodo3)
- **SSL**: Configurable via `DB_SSL` environment variable (default: false)

## Tables

### 1. users
Stores user information including authentication details and roles.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT) - Unique user identifier
- `username` (STRING(255), UNIQUE, NOT NULL) - Unique username
- `email` (STRING(255), UNIQUE, NOT NULL) - User's email address
- `password` (STRING(255), NOT NULL) - Hashed password
- `fullName` (STRING(255), NOT NULL) - User's full name
- `role` (ENUM('SystemAdmin', 'Admin', 'Supervisor', 'Agent'), DEFAULT: 'Agent') - User's role
- `isActive` (BOOLEAN, DEFAULT: true) - Whether the user account is active
- `storageQuota` (INTEGER, DEFAULT: 100) - Storage quota in MB
- `usedStorage` (INTEGER, DEFAULT: 0) - Used storage in MB
- `office` (STRING(255)) - Office location
- `createdAt` (TIMESTAMP) - Record creation timestamp
- `updatedAt` (TIMESTAMP) - Record last update timestamp

### 2. meetings
Stores meeting information and scheduling details.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT) - Unique meeting identifier
- `subject` (STRING(255), NOT NULL) - Meeting subject/title
- `platform` (STRING(50), NOT NULL, DEFAULT: 'zoom') - Meeting platform (zoom, meet, teams, etc.)
- `location` (TEXT) - Meeting location or link
- `date` (DATE, NOT NULL) - Meeting date
- `time` (TIME, NOT NULL) - Meeting time
- `duration` (INTEGER, DEFAULT: 30) - Meeting duration in minutes
- `createdBy` (INTEGER, NOT NULL) - ID of the user who created the meeting
- `selectedUserIds` (JSON, DEFAULT: []) - Array of user IDs invited to the meeting
- `createdAt` (TIMESTAMP) - Record creation timestamp
- `updatedAt` (TIMESTAMP) - Record last update timestamp

### 3. meeting_users
Junction table for the many-to-many relationship between meetings and users.

**Columns:**
- `meetingId` (INTEGER, PRIMARY KEY) - Foreign key to meetings.id
- `userId` (INTEGER, PRIMARY KEY) - Foreign key to users.id

### 4. tasks
Stores task information and tracking details.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT) - Unique task identifier
- `date` (DATE, NOT NULL) - Task date
- `source` (STRING(255), DEFAULT: '') - Task source
- `category` (STRING(255), DEFAULT: '') - Task category
- `service` (STRING(255), DEFAULT: '') - Service related to the task
- `userId` (INTEGER, NOT NULL) - ID of the user assigned to the task
- `userName` (STRING(255), NOT NULL) - Name of the user assigned to the task
- `office` (STRING(255)) - Office location
- `userInformation` (TEXT) - Additional user information
- `description` (TEXT, NOT NULL) - Task description
- `status` (ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'), DEFAULT: 'Pending') - Task status
- `comments` (JSON, DEFAULT: []) - Array of comments on the task
- `attachments` (JSON, DEFAULT: []) - Array of attachments
- `files` (JSON, DEFAULT: []) - Array of file information
- `createdAt` (TIMESTAMP) - Record creation timestamp
- `updatedAt` (TIMESTAMP) - Record last update timestamp

### 5. leaves
Stores leave request information.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT) - Unique leave identifier
- `userId` (INTEGER, NOT NULL) - ID of the user requesting leave
- `userName` (STRING(255), NOT NULL) - Name of the user requesting leave
- `office` (STRING(255)) - Office location
- `startDate` (DATE, NOT NULL) - Leave start date
- `endDate` (DATE, NOT NULL) - Leave end date
- `reason` (TEXT, NOT NULL) - Reason for leave
- `status` (ENUM('Pending', 'Approved', 'Rejected'), DEFAULT: 'Pending') - Leave status
- `approvedBy` (INTEGER) - ID of the user who approved the leave
- `approvedByName` (STRING(255)) - Name of the user who approved the leave
- `approvedAt` (DATE) - Date when the leave was approved
- `rejectionReason` (TEXT) - Reason for rejection (if rejected)
- `createdAt` (TIMESTAMP) - Record creation timestamp
- `updatedAt` (TIMESTAMP) - Record last update timestamp

### 6. audit_logs
Stores audit trail information for tracking user actions.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT) - Unique audit log identifier
- `userId` (INTEGER) - ID of the user performing the action
- `userName` (STRING(255)) - Name of the user performing the action
- `action` (STRING(255), NOT NULL) - Type of action performed
- `resourceType` (STRING(255), NOT NULL) - Type of resource affected
- `resourceId` (INTEGER) - ID of the resource affected
- `description` (TEXT) - Description of the action
- `ipAddress` (STRING(255)) - IP address of the user
- `userAgent` (STRING(255)) - User agent string
- `createdAt` (TIMESTAMP) - Record creation timestamp
- `updatedAt` (TIMESTAMP) - Record last update timestamp

## Relationships

### User-Meeting Relationships
1. **One-to-Many**: Users create meetings (via `createdBy` foreign key in meetings table)
2. **Many-to-Many**: Users can be invited to meetings (via `meeting_users` junction table and `selectedUserIds` JSON field)

### Other Relationships
1. **One-to-Many**: Users create tasks (via `userId` foreign key in tasks table)
2. **One-to-Many**: Users request leaves (via `userId` foreign key in leaves table)
3. **One-to-Many**: Users generate audit logs (via `userId` foreign key in audit_logs table)

## Indexes

### tasks Table
- Index on `userId` for faster user-based queries
- Index on `office` for office-based filtering
- Index on `status` for status-based filtering
- Index on `date` for date-based queries

## Notes

1. The application supports both TiDB (in production) and SQLite (in development)
2. JSON fields are used for storing arrays of data (comments, attachments, files, selected users)
3. The `meeting_users` junction table provides an alternative to the `selectedUserIds` JSON field for better relational database practices
4. ENUM fields are used for status and role fields to ensure data consistency
5. All tables use UTF8MB4 character set for full Unicode support