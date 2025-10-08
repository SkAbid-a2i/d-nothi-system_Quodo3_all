# TiDB Cloud IP Whitelisting Instructions

## Issue
Database connection is failing with "Access denied" error because your IP address is not whitelisted in TiDB Cloud.

## Solution
You need to whitelist your IP address in the TiDB Cloud dashboard.

## Steps to Whitelist Your IP

1. **Log in to TiDB Cloud**
   - Go to https://tidbcloud.com/
   - Log in with your credentials

2. **Navigate to Your Cluster**
   - Click on "Clusters" in the left sidebar
   - Select your cluster (likely the one with "d_nothi_db")

3. **Access Security Settings**
   - Click on your cluster name to open cluster details
   - Look for "Security" or "Access Control" section
   - Click on "IP Access List" or "IP Whitelist"

4. **Add Your IP Address**
   - Click "Add IP" or "Add Access"
   - Enter your public IP address: `103.159.72.25`
   - Optionally add a description like "Development Machine"
   - Click "Add" or "Save"

5. **Alternative Options**
   - For testing: Add `0.0.0.0/0` to allow all IPs (NOT recommended for production)
   - For dynamic IPs: Add a broader range like `103.159.72.0/24`

6. **Wait for Changes to Apply**
   - It may take a few minutes for the changes to take effect
   - TiDB Cloud will show a notification when ready

## Verification

After whitelisting your IP:

1. **Test Connection**
   ```bash
   cd D:\Project\Quodo3
   node test-db-connection.js
   ```

2. **Apply Database Fixes**
   ```bash
   node apply-database-fixes.js
   ```

## Common Issues

1. **Still Getting Access Denied**
   - Double-check the IP address is correct
   - Wait a few more minutes for changes to propagate
   - Check if there are multiple IP addresses to whitelist

2. **IP Changes Frequently**
   - Contact your ISP about getting a static IP
   - Use a broader IP range in the whitelist
   - Consider using a VPN with a static IP for development

3. **Production Security**
   - Never use `0.0.0.0/0` in production
   - Only whitelist specific IP addresses
   - Regularly review and update the IP whitelist

## Support

If you continue to have issues:
1. Check TiDB Cloud documentation: https://docs.pingcap.com/tidbcloud/
2. Contact TiDB support through the dashboard
3. Verify your cluster status is "Active"