# Agent Role Meeting Access Enhancement

## Problem
Agent role users were previously limited in their ability to view meetings compared to Admin, System Admin, and Supervisor roles. They could only see:
- Meetings they created themselves
- Meetings they were specifically invited to

This was inconsistent with the broader office-wide visibility that Admin roles enjoyed.

## Solution
Updated the meeting fetching logic to give Agent roles the same meeting visibility as Admin/Supervisor roles, allowing them to see all meetings within their office.

## Changes Made

### File: `routes/meeting.routes.js`

**Before:**
```javascript
// Agents can only see meetings they're invited to or created
if (req.user.role === 'Agent') {
  // Build where clause to include meetings created by user OR selected user IDs OR associated through MeetingUsers
  where = {
    [require('sequelize').Op.or]: [
      { createdBy: req.user.id },
      { selectedUserIds: { [require('sequelize').Op.contains]: [req.user.id] } },
      // Also check through the association table
      {
        '$selectedUsers.id$': req.user.id
      }
    ]
  };
} 
// Admins and Supervisors can see meetings from their office
else if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
  // Get all users in the office
  const officeUsers = await User.findAll({
    where: { office: req.user.office },
    attributes: ['id']
  });
  
  const officeUserIds = officeUsers.map(user => user.id);
  
  where = {
    [require('sequelize').Op.or]: [
      { createdBy: req.user.id },
      { selectedUserIds: { [require('sequelize').Op.overlap]: officeUserIds } },
      // Also check through the association table
      {
        '$selectedUsers.id$': { [require('sequelize').Op.in]: officeUserIds }
      }
    ]
  };
}
```

**After:**
```javascript
// Agents, Admins and Supervisors can see meetings from their office
if (req.user.role === 'Agent' || req.user.role === 'Admin' || req.user.role === 'Supervisor') {
  // Get all users in the office
  const officeUsers = await User.findAll({
    where: { office: req.user.office },
    attributes: ['id']
  });
  
  const officeUserIds = officeUsers.map(user => user.id);
  
  where = {
    [require('sequelize').Op.or]: [
      { createdBy: req.user.id },
      { selectedUserIds: { [require('sequelize').Op.overlap]: officeUserIds } },
      // Also check through the association table
      {
        '$selectedUsers.id$': { [require('sequelize').Op.in]: officeUserIds }
      }
    ]
  };
}
```

## Key Differences in Logic

### Previous Agent Logic:
- Used `Op.contains` to check if the agent's ID was in the `selectedUserIds` array
- Only checked for direct associations with the agent user

### New Agent Logic (Same as Admin/Supervisor):
- Uses `Op.overlap` to check if any office user IDs overlap with the `selectedUserIds` array
- Uses `Op.in` to check if any office users are associated through the MeetingUsers table
- Fetches all users in the agent's office and includes meetings involving any of those users

## Benefits

1. **Consistency**: Agent roles now have the same meeting visibility as Admin/Supervisor roles
2. **Office-wide visibility**: Agents can see all meetings happening within their office, not just those directly involving them
3. **Better collaboration**: Agents have better context on office activities and can participate more effectively
4. **Maintains security**: Agents still only see meetings within their own office, preserving data isolation

## Testing

The implementation has been tested with:
- Agent users in different offices
- Meetings created by various users
- Meetings with different participant combinations
- Verification that cross-office meeting visibility is properly restricted

## Impact

This change enhances the Agent role's functionality while maintaining appropriate security boundaries. Agents now have the visibility they need to be effective members of their office teams.