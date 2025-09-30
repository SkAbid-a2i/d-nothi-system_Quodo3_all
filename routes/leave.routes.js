const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const emailService = require('../services/email.service');

const router = express.Router();

// @route   GET /api/leaves
// @desc    Get leaves (Agent: own leaves, Admin/Supervisor: team leaves)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    
    // Agents can only see their own leaves
    if (req.user.role === 'Agent') {
      where.userId = req.user.id;
    } 
    // Admins and Supervisors can see their team's leaves
    else if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where = {
        [require('sequelize').Op.or]: [
          { office: req.user.office },
          { userId: req.user.id }
        ]
      };
    }
    // SystemAdmin can see all leaves
    
    const leaves = await Leave.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leaves
// @desc    Request new leave
// @access  Private (Agent, Admin, Supervisor)
router.post('/', authenticate, authorize('Agent', 'Admin', 'Supervisor'), async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Create new leave request
    const leave = await Leave.create({
      userId: req.user.id,
      userName: req.user.fullName,
      startDate,
      endDate,
      reason,
    });

    // Send email notification to admin/supervisor
    try {
      // Get admin/supervisor for the office
      const admins = await User.findAll({
        where: {
          office: req.user.office,
          role: {
            [require('sequelize').Op.or]: ['Admin', 'Supervisor']
          },
          isActive: true
        }
      });

      // Send notification to each admin/supervisor
      for (const admin of admins) {
        if (admin.email) {
          await emailService.sendLeaveRequestNotification({
            employeeName: req.user.fullName,
            startDate,
            endDate,
            reason
          }, admin.email);
        }
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email sending fails
    }

    res.status(201).json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private (Admin, Supervisor)
router.put('/:id/approve', authenticate, authorize('Admin', 'Supervisor'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (leave.office !== req.user.office && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update leave status
    leave.status = 'Approved';
    leave.approvedBy = req.user.id;
    leave.approvedByName = req.user.fullName;
    leave.approvedAt = new Date();

    await leave.save();

    // Send email notification to employee
    try {
      const employee = await User.findByPk(leave.userId);
      if (employee && employee.email) {
        await emailService.sendLeaveApprovalNotification({
          startDate: leave.startDate,
          endDate: leave.endDate,
          approverName: req.user.fullName
        }, employee.email);
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email sending fails
    }

    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private (Admin, Supervisor)
router.put('/:id/reject', authenticate, authorize('Admin', 'Supervisor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (leave.office !== req.user.office && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update leave status
    leave.status = 'Rejected';
    leave.rejectionReason = rejectionReason;
    leave.approvedBy = req.user.id;
    leave.approvedByName = req.user.fullName;
    leave.approvedAt = new Date();

    await leave.save();

    // Send email notification to employee
    try {
      const employee = await User.findByPk(leave.userId);
      if (employee && employee.email) {
        await emailService.sendLeaveRejectionNotification({
          startDate: leave.startDate,
          endDate: leave.endDate,
          rejecterName: req.user.fullName,
          rejectionReason
        }, employee.email);
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email sending fails
    }

    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;