const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

const router = express.Router();

// @route   GET /api/meetings
// @desc    Get all meetings
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    
    // Agents can only see meetings they're invited to or created
    if (req.user.role === 'Agent') {
      where = {
        [require('sequelize').Op.or]: [
          { createdBy: req.user.id },
          { selectedUserIds: { [require('sequelize').Op.contains]: [req.user.id] } }
        ]
      };
      
      // Also include meetings where the user is associated through the MeetingUsers table
      const userMeetings = await Meeting.findAll({
        include: [{
          model: User,
          as: 'selectedUsers',
          where: { id: req.user.id },
          attributes: []
        }],
        attributes: ['id']
      });
      
      const userMeetingIds = userMeetings.map(m => m.id);
      if (userMeetingIds.length > 0) {
        where = {
          [require('sequelize').Op.or]: [
            { createdBy: req.user.id },
            { selectedUserIds: { [require('sequelize').Op.contains]: [req.user.id] } },
            { id: { [require('sequelize').Op.in]: userMeetingIds } }
          ]
        };
      }
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
          { selectedUserIds: { [require('sequelize').Op.overlap]: officeUserIds } }
        ]
      };
    }
    // SystemAdmin can see all meetings
    
    const meetings = await Meeting.findAll({ 
      where, 
      order: [['date', 'DESC'], ['time', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }, {
        model: User,
        as: 'selectedUsers',
        attributes: ['id', 'username', 'fullName'],
        through: { attributes: [] }
      }]
    });
    
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/meetings
// @desc    Create new meeting
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { subject, platform, location, date, time, duration, selectedUserIds } = req.body;

    // Validate input
    if (!subject || !date || !time) {
      return res.status(400).json({ message: 'Subject, date, and time are required' });
    }

    // Create new meeting
    const meeting = await Meeting.create({
      subject,
      platform: platform || 'zoom',
      location,
      date,
      time,
      duration: duration || 30,
      createdBy: req.user.id,
      selectedUserIds: selectedUserIds || []
    });

    // Associate selected users with the meeting
    if (selectedUserIds && selectedUserIds.length > 0) {
      await meeting.addSelectedUsers(selectedUserIds);
    }

    // Send notifications to selected users
    if (selectedUserIds && selectedUserIds.length > 0) {
      const selectedUsers = await User.findAll({
        where: { id: selectedUserIds },
        attributes: ['id', 'username', 'fullName', 'email']
      });
      
      selectedUsers.forEach(user => {
        // In a real implementation, you would send actual notifications
        console.log(`Notification sent to ${user.username} for meeting: ${subject}`);
      });
    }

    // Send notification about meeting creation
    notificationService.notifyMeetingCreated(meeting);

    // Reload meeting with associations
    const fullMeeting = await Meeting.findByPk(meeting.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }, {
        model: User,
        as: 'selectedUsers',
        attributes: ['id', 'username', 'fullName'],
        through: { attributes: [] }
      }]
    });

    res.status(201).json(fullMeeting);
  } catch (err) {
    console.error('Error creating meeting:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/meetings/:id
// @desc    Update meeting
// @access  Private (Owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, platform, location, date, time, duration, selectedUserIds } = req.body;

    // Check if meeting exists
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check permissions - only creator can update
    if (meeting.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only update your own meetings' });
    }

    // Update meeting
    meeting.subject = subject || meeting.subject;
    meeting.platform = platform || meeting.platform;
    meeting.location = location || meeting.location;
    meeting.date = date || meeting.date;
    meeting.time = time || meeting.time;
    meeting.duration = duration || meeting.duration;
    meeting.selectedUserIds = selectedUserIds || meeting.selectedUserIds;

    await meeting.save();

    // Update user associations
    if (selectedUserIds) {
      await meeting.setSelectedUsers(selectedUserIds);
    }

    // Send notification about meeting update
    notificationService.notifyMeetingUpdated(meeting);

    // Reload meeting with associations
    const fullMeeting = await Meeting.findByPk(meeting.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }, {
        model: User,
        as: 'selectedUsers',
        attributes: ['id', 'username', 'fullName'],
        through: { attributes: [] }
      }]
    });

    res.json(fullMeeting);
  } catch (err) {
    console.error('Error updating meeting:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/meetings/:id
// @desc    Delete meeting
// @access  Private (Owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if meeting exists
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check permissions - only creator can delete
    if (meeting.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only delete your own meetings' });
    }

    // Delete meeting
    await meeting.destroy();

    // Send notification about meeting deletion
    notificationService.notifyMeetingDeleted(meeting);

    res.json({ message: 'Meeting removed' });
  } catch (err) {
    console.error('Error deleting meeting:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;