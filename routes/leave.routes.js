const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');
const cors = require('cors');

// CORS configuration for leaves
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 
    process.env.FRONTEND_URL_2 || 'http://localhost:3000',
    process.env.FRONTEND_URL_3 || 'https://d-nothi-zenith.vercel.app',
    'https://quodo3-frontend.onrender.com',
    'https://quodo3-backend.onrender.com',
    'https://d-nothi-system-quodo3-all.vercel.app',
    'https://d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-cn53p2hxd-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-bp6mein7b-skabid-5302s-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const router = express.Router();

// @route   GET /api/leaves
// @desc    Get leaves (Agent: own leaves, Admin/Supervisor: team leaves)
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
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
router.post('/', cors(corsOptions), authenticate, authorize('Agent', 'Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { startDate, endDate, reason, userId, userName, office, requestedBy, requestedByName } = req.body;

    // Validate dates - allow same start and end date for single-day leave
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be same as or after start date' });
    }

    // Determine which user the leave is for
    let leaveUserId = req.user.id;
    let leaveUserName = req.user.fullName;
    let leaveOffice = req.user.office;
    
    // If System Admin is assigning leave to another user
    if (req.user.role === 'SystemAdmin' && userId && userName) {
      leaveUserId = userId;
      leaveUserName = userName;
      leaveOffice = office || req.user.office;
    }

    // Determine requester information
    let leaveRequestedBy = req.user.id;
    let leaveRequestedByName = req.user.fullName;
    
    // If explicit requester information is provided
    if (requestedBy && requestedByName) {
      leaveRequestedBy = requestedBy;
      leaveRequestedByName = requestedByName;
    }

    // Create new leave request
    const leave = await Leave.create({
      userId: leaveUserId,
      userName: leaveUserName,
      office: leaveOffice,
      requestedBy: leaveRequestedBy,
      requestedByName: leaveRequestedByName,
      startDate,
      endDate,
      reason,
    });

    // Create audit log for leave request
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'CREATE',
        resourceType: 'LEAVE',
        resourceId: leave.id,
        description: `Leave request for ${leaveUserName} from ${startDate} to ${endDate} requested by ${leaveRequestedByName}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for leave request:', auditError);
    }

    // Notify about leave request
    notificationService.notifyLeaveRequested(leave);

    // Send email notification to admin/supervisor
    try {
      // Get admin/supervisor for the office
      const admins = await User.findAll({
        where: {
          office: leaveOffice,
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
            employeeName: leaveUserName,
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
router.put('/:id/approve', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
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

    // Create audit log for leave approval
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'APPROVE',
        resourceType: 'LEAVE',
        resourceId: leave.id,
        description: `Leave request for ${leave.userName} approved by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for leave approval:', auditError);
    }

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
router.put('/:id/reject', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
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

    // Create audit log for leave rejection
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'REJECT',
        resourceType: 'LEAVE',
        resourceId: leave.id,
        description: `Leave request for ${leave.userName} rejected by ${req.user.username}. Reason: ${rejectionReason || 'Not specified'}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for leave rejection:', auditError);
    }

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

// @route   PUT /api/leaves/:id
// @desc    Update leave request
// @access  Private (Owner, Admin, Supervisor)
router.put('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role !== 'Admin' && 
        req.user.role !== 'Supervisor' &&
        leave.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate dates if provided - allow same start and end date for single-day leave
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be same as or after start date' });
    }

    // Update leave
    leave.startDate = startDate || leave.startDate;
    leave.endDate = endDate || leave.endDate;
    leave.reason = reason || leave.reason;

    await leave.save();

    res.json(leave);
  } catch (err) {
    console.error('Error updating leave:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Delete leave request
// @access  Private (Owner, Admin, Supervisor)
router.delete('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check permissions
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role !== 'Admin' && 
        req.user.role !== 'Supervisor' &&
        leave.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete leave
    await leave.destroy();

    res.json({ message: 'Leave request removed' });
  } catch (err) {
    console.error('Error deleting leave:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;