# Database Connection Troubleshooting Guide

## Issue Summary

The application is unable to connect to the TiDB database with the following error:
```
Access denied for user '4VmPGSU3EFyEhLJ.root'@'202.40.185.57' (using password: YES)
```

## Environment Configuration

### Application Environment Variables
```
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=4VmPGSU3EFyEhLJ.root
DB_PASSWORD=gWe9gfuhBBE50H1u
DB_NAME=d_nothi_db
```

### Connection Details
- **Database Type**: TiDB Cloud (Serverless Tier)
- **Connection Method**: SSL Required
- **Application Server IP**: 202.40.185.57
- **Connection Port**: 4000

## Troubleshooting Steps

### 1. Verify Credentials

Confirm that the following credentials are correct:
- Username: `4VmPGSU3EFyEhLJ.root`
- Password: `gWe9gfuhBBE50H1u`
- Database Name: `d_nothi_db`

### 2. Check User Permissions

Verify that the user `4VmPGSU3EFyEhLJ.root` has the following permissions:
- CONNECT privilege from IP `202.40.185.57`
- SELECT, INSERT, UPDATE, DELETE privileges on database `d_nothi_db`
- CREATE, ALTER, DROP privileges for table management

### 3. TiDB Cloud Specific Checks

For TiDB Cloud Serverless Tier:
- Ensure the cluster is in the "Active" state
- Verify that the connection endpoint is correct
- Confirm that the cluster allows connections from the application server IP
- Check if there are any IP allowlist restrictions

### 4. Network Connectivity

Test network connectivity from the application server:
```bash
telnet gateway01.eu-central-1.prod.aws.tidbcloud.com 4000
```

### 5. SSL Configuration

TiDB Cloud requires SSL connections. The application is configured with:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

## Diagnostic Information

### Error Analysis
The error `Access denied for user '4VmPGSU3EFyEhLJ.root'@'202.40.185.57' (using password: YES)` indicates:
1. The username is recognized by the database
2. The connection is coming from IP 202.40.185.57
3. A password was provided but was rejected
4. Possible causes:
   - Incorrect password
   - User lacks permission to connect from this IP
   - User account is locked or expired

### Connection Requirements
- **SSL Required**: Yes
- **Authentication Method**: MySQL Native Password
- **Connection Timeout**: 10 seconds
- **Character Set**: utf8mb4

## Recommended Solutions

### Solution 1: Reset User Password
```sql
ALTER USER '4VmPGSU3EFyEhLJ.root' IDENTIFIED BY 'gWe9gfuhBBE50H1u';
FLUSH PRIVILEGES;
```

### Solution 2: Grant Proper Permissions
```sql
GRANT ALL PRIVILEGES ON d_nothi_db.* TO '4VmPGSU3EFyEhLJ.root'@'202.40.185.57';
FLUSH PRIVILEGES;
```

### Solution 3: Create New User (if current user is problematic)
```sql
CREATE USER '4VmPGSU3EFyEhLJ.root'@'202.40.185.57' IDENTIFIED BY 'gWe9gfuhBBE50H1u';
GRANT ALL PRIVILEGES ON d_nothi_db.* TO '4VmPGSU3EFyEhLJ.root'@'202.40.185.57';
FLUSH PRIVILEGES;
```

## Testing Connection

Once the database issue is resolved, test the connection with:

```bash
cd /path/to/quodo3
node diagnose-db-connection.js
```

## Application Readiness

The application is fully ready for production once the database connection is established:
- All frontend components are implemented and tested
- Backend APIs are properly configured
- Database models and migrations are ready
- Environment variables are correctly set
- Security configurations are in place

## Next Steps

1. Verify database credentials with TiDB Cloud console
2. Check IP allowlist settings in TiDB Cloud
3. Reset password if necessary
4. Grant appropriate permissions
5. Test connection after changes
6. Run database migrations and seed scripts

## Contact Information

For further assistance, please contact the development team with:
- TiDB Cloud cluster details
- Updated credentials (if changed)
- Any specific error messages from the TiDB logs