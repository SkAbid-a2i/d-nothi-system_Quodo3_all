const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');

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
    // SystemAdmin can see all leaves (no filter needed)
    
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
router.post('/', authenticate, authorize('Agent', 'Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
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
      office: req.user.office, // Add office field
      startDate,
      endDate,
      reason,
    });

    // Notify about leave request
    notificationService.notifyLeaveRequested(leave);

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
    console.error('Error creating leave request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private (Admin, Supervisor, SystemAdmin)
router.put('/:id/approve', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions - SystemAdmin can approve any leave
    // For Admins, they can approve leaves from their office
    // For Supervisors, they can approve leaves from their office
    if (req.user.role !== 'SystemAdmin') {
      if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
        if (leave.office !== req.user.office) {
          return res.status(403).json({ 
            message: 'Access denied - You can only approve leaves from your office',
            userRole: req.user.role,
            leaveOffice: leave.office,
            userOffice: req.user.office
          });
        }
      } else {
        // Agents cannot approve leaves
        return res.status(403).json({ 
          message: 'Access denied - You do not have permission to approve leaves',
          userRole: req.user.role
        });
      }
    }

    // Update leave status
    leave.status = 'Approved';
    leave.approvedBy = req.user.id;
    leave.approvedByName = req.user.fullName;
    leave.approvedAt = new Date();

    await leave.save();

    // Notify about leave approval
    notificationService.notifyLeaveApproved(leave);

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
    console.error('Error approving leave:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private (Admin, Supervisor, SystemAdmin)
router.put('/:id/reject', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions - SystemAdmin can reject any leave
    // For Admins, they can reject leaves from their office
    // For Supervisors, they can reject leaves from their office
    if (req.user.role !== 'SystemAdmin') {
      if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
        if (leave.office !== req.user.office) {
          return res.status(403).json({ 
            message: 'Access denied - You can only reject leaves from your office',
            userRole: req.user.role,
            leaveOffice: leave.office,
            userOffice: req.user.office
          });
        }
      } else {
        // Agents cannot reject leaves
        return res.status(403).json({ 
          message: 'Access denied - You do not have permission to reject leaves',
          userRole: req.user.role
        });
      }
    }

    // Update leave status
    leave.status = 'Rejected';
    leave.rejectionReason = rejectionReason;
    leave.approvedBy = req.user.id;
    leave.approvedByName = req.user.fullName;
    leave.approvedAt = new Date();

    await leave.save();

    // Notify about leave rejection
    notificationService.notifyLeaveRejected(leave);

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
    console.error('Error rejecting leave:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;