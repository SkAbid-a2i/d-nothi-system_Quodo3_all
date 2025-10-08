# TiDB Cloud Setup Guide for Quodo3 Application

This document provides step-by-step instructions to resolve the database connection issues with TiDB Cloud.

## Current Connection Issues

1. **IP Whitelisting**: Connection attempts from `103.159.72.106` are being denied
2. **SSL Requirement**: TiDB Cloud requires SSL connections
3. **Credentials**: Need to verify user credentials are correct

## Solution Steps

### 1. IP Whitelisting Configuration

Since the connection is being made from `103.159.72.106` (not your public IP `103.159.72.120`), you need to whitelist both IPs in TiDB Cloud:

1. Log in to your [TiDB Cloud Console](https://tidbcloud.com/)
2. Navigate to your cluster
3. Go to "Access Control" or "IP Whitelist" settings
4. Add the following IP addresses:
   - `103.159.72.106` (the IP showing in the error)
   - `103.159.72.120` (your public IP)
   - Optionally add `0.0.0.0/0` for testing (but remove this in production for security)

### 2. Verify Credentials

Ensure your credentials are correct:

- **Username**: `4VmPGSU3EFyEhLJ.root` (must include the `.root` suffix)
- **Password**: `gWe9gfuhBBE50H1u`
- **Host**: `gateway01.eu-central-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Database**: `d_nothi_db`

### 3. SSL Configuration

The application is already configured to use SSL. Ensure the following environment variable is set:
```
DB_SSL=true
```

### 4. Network Configuration

If you're behind a proxy or NAT, you may need to:

1. Configure your network to use the same outbound IP for database connections
2. Set up a VPN or dedicated connection to ensure consistent IP addressing
3. Contact your network administrator to understand the routing

## Testing the Connection

After making the changes, test the connection using:

```bash
cd d:/Project/Quodo3
node test-db-connection.js
```

## Common Issues and Solutions

### Issue: "Access denied for user"
**Solution**: 
1. Verify the username includes the `.root` suffix
2. Double-check the password
3. Ensure the connecting IP is whitelisted

### Issue: "Connections using insecure transport are prohibited"
**Solution**:
1. Ensure `DB_SSL=true` is set in your environment
2. Verify SSL is enabled in the database configuration

### Issue: IP address mismatch
**Solution**:
1. Whitelist all possible outbound IPs from your network
2. Use a static IP or VPN for consistent outbound connections
3. Check if your hosting provider uses NAT or proxy services

## Security Recommendations

1. **Remove `0.0.0.0/0`** from IP whitelist after testing
2. **Use specific IP addresses** for production environments
3. **Regularly rotate credentials** and monitor access logs
4. **Enable database user restrictions** to limit access to specific databases

## Contact Support

If issues persist:
1. Check the [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)
2. Contact TiDB Cloud Support through the console
3. Provide the exact error message and connection details

## Verification Steps

After implementing the above changes:

1. Run the test script: `node test-db-connection.js`
2. Start the application: `npm start`
3. Verify database operations work in the application
4. Check logs for any remaining connection issues