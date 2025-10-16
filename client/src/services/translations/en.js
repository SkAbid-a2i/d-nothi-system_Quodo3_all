const translations = {
  // Common labels
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    export: 'Export',
    download: 'Download',
    upload: 'Upload',
    close: 'Close',
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    details: 'Details',
    optional: 'Optional',
    value: 'Value',
    parent: 'Parent',
    manage: 'Manage',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    description: 'Description',
    reason: 'Reason',
    startDate: 'Start Date',
    endDate: 'End Date',
    appliedDate: 'Applied Date',
    employee: 'Employee',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    office: 'Office',
    welcome: 'Welcome',
    saving: 'Saving...',
    deleting: 'Deleting...',
    all: 'All',
    na: 'N/A'
  },
  
  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    taskLogger: 'Task Logger',
    myTasks: 'Task Modification & Activity',
    teamTasks: 'Team Tasks',
    leaves: 'Leave Management',
    meetings: 'Meetings',
    errorMonitoring: 'Error Monitoring',
    files: 'File Management',
    adminConsole: 'Admin Console',
    reports: 'Reports',
    settings: 'Settings',
    help: 'Help & Support',
    logout: 'Logout',
    collaboration: 'Collaboration'
  },
  
  // Login
  login: {
    title: 'Sign in to D-Nothi System',
    username: 'Username or Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account? Contact Administrator",
    signIn: 'Sign In'
  },
  
  // Dashboard
  dashboard: {
    agent: {
      title: 'Agent Dashboard',
      totalTasks: 'Total Tasks',
      pendingLeaves: 'Pending Leaves',
      reportsGenerated: 'Reports Generated',
      notifications: 'Notifications',
      taskDistribution: 'Task Distribution',
      taskHistory: 'Task History',
      leaveSummary: 'Leave Summary',
      recentActivity: 'Recent Activity'
    },
    admin: {
      title: 'Admin Dashboard',
      totalTeamTasks: 'Total Team Tasks',
      pendingLeaves: 'Pending Leaves',
      reportsGenerated: 'Reports Generated',
      teamNotifications: 'Team Notifications',
      teamPerformance: 'Team Performance',
      teamTasks: 'Team Tasks',
      pendingLeavesRequests: 'Pending Leave Requests',
      customizableWidgets: 'Customizable Widgets',
      whosOnLeave: "Who's on Leave Today"
    }
  },
  
  // Task Management
  tasks: {
    title: 'Task Management',
    taskLogger: 'Task Logger',
    createNewTask: 'Create New Task',
    date: 'Task Date',
    source: 'Source',
    category: 'Category',
    service: 'Service',
    description: 'Task Description',
    status: 'Status',
    actions: 'Actions',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    errorFetchingTasks: 'Error fetching tasks',
    taskCreated: 'Task created successfully',
    taskUpdated: 'Task updated successfully',
    taskDeleted: 'Task deleted successfully',
    taskCreationFailed: 'Failed to create task',
    taskUpdateFailed: 'Failed to update task',
    taskDeletionFailed: 'Failed to delete task'
  },
  
  // Leave Management
  leaves: {
    title: 'Leave Management',
    requestNewLeave: 'Request New Leave',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason for Leave',
    submitRequest: 'Submit Leave Request',
    leaveRequests: 'Leave Requests',
    employee: 'Employee',
    appliedDate: 'Applied Date',
    calendar: 'Leave Calendar',
    notifications: 'Notifications',
    leaveCreated: 'Leave request submitted successfully',
    leaveUpdated: 'Leave request updated successfully',
    leaveDeleted: 'Leave request deleted successfully',
    leaveApproved: 'Leave request approved successfully',
    leaveRejected: 'Leave request rejected successfully',
    leaveCreationFailed: 'Failed to submit leave request',
    leaveUpdateFailed: 'Failed to update leave request',
    leaveDeletionFailed: 'Failed to delete leave request',
    leaveApprovalFailed: 'Failed to approve leave request',
    leaveRejectionFailed: 'Failed to reject leave request'
  },
  
  // User Management
  users: {
    title: 'System Administration',
    userManagement: 'User Management',
    permissionTemplates: 'Permission Templates',
    dropdownManagement: 'Dropdown Management',
    createNewUser: 'Create New User',
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email Address',
    role: 'User Role',
    office: 'Office Location',
    status: 'Account Status',
    active: 'Active',
    inactive: 'Inactive',
    createUser: 'Create User',
    updateUser: 'Update User',
    existingTemplates: 'Existing Templates',
    addNewDropdownValue: 'Add New Dropdown Value',
    dropdownType: 'Dropdown Type',
    enterDropdownValue: 'Enter dropdown value',
    selectCategoryFirst: 'Select Category first for Service',
    manageDropdownValues: 'Manage Dropdown Values',
    userCreated: 'User created successfully',
    userUpdated: 'User updated successfully',
    userDeleted: 'User deleted successfully',
    userStatusUpdated: 'User status updated successfully',
    userCreationFailed: 'Failed to create user',
    userUpdateFailed: 'Failed to update user',
    userDeletionFailed: 'Failed to delete user',
    userStatusUpdateFailed: 'Failed to update user status',
    roleOptions: {
      agent: 'Agent',
      supervisor: 'Supervisor',
      admin: 'Administrator',
      systemAdmin: 'System Administrator'
    }
  },
  
  // Files
  files: {
    title: 'File Management',
    storageUsage: 'Storage Usage',
    uploadFile: 'Upload File',
    name: 'File Name',
    type: 'File Type',
    size: 'File Size',
    uploaded: 'Upload Date',
    owner: 'Uploaded By',
    fileUploaded: 'File uploaded successfully',
    fileUploadFailed: 'Failed to upload file',
    fileDeleted: 'File deleted successfully',
    fileDeletionFailed: 'Failed to delete file'
  },
  
  // Reports
  reports: {
    title: 'Report Management',
    taskReports: 'Task Reports',
    leaveReports: 'Leave Reports',
    activityReports: 'Activity Reports',
    startDate: 'Start Date',
    endDate: 'End Date',
    reportType: 'Report Type',
    generateReport: 'Generate Report',
    taskReport: 'Task Report',
    leaveReport: 'Leave Report',
    activityReport: 'Activity Report',
    reportGenerated: 'Report generated successfully',
    reportGenerationFailed: 'Failed to generate report'
  },
  
  // Settings
  settings: {
    title: 'System Settings',
    profile: 'Profile Settings',
    security: 'Security Settings',
    application: 'Application Settings',
    language: 'Language',
    theme: {
      light: 'Light',
      dark: 'Dark'
    },
    notifications: 'Enable Notifications',
    autoRefresh: 'Auto-refresh Dashboard',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePassword: 'Change Password',
    enable2FA: 'Enable Two-Factor Authentication',
    configure2FA: 'Configure 2FA',
    settingsSaved: 'Settings saved successfully',
    settingsSaveFailed: 'Failed to save settings'
  },
  
  // Help
  help: {
    title: 'Help & Support',
    videoTutorial: 'Video Tutorial',
    userGuide: 'User Guide',
    faq: 'Frequently Asked Questions',
    needHelp: 'Need More Help?',
    contactSupport: 'If you have any questions or need assistance, please contact our support team at support@d-nothi.com',
    faqItems: {
      createTask: {
        question: 'How do I create a new task?',
        answer: 'To create a new task, navigate to the Task Logger page and fill out the form with the required information.'
      },
      submitLeave: {
        question: 'How do I submit a leave request?',
        answer: 'Go to the Leaves page and click on the \'Request New Leave\' button. Fill in the start date, end date, and reason for your leave.'
      },
      exportReports: {
        question: 'How do I export reports?',
        answer: 'On the dashboard, use the export buttons to download reports in CSV, Excel, or PDF format.'
      }
    }
  },
  
  // Error Monitoring translations
  errors: {
    title: 'Error Monitoring',
    description: 'Track and monitor system errors and issues in real-time',
    logs: 'Logs',
    analysis: 'Analysis',
    totalLogs: 'Total Logs',
    errorMessage: 'Error Message',
    count: 'Count',
    examples: 'Examples',
    timestamp: 'Timestamp',
    level: 'Level',
    message: 'Message',
    apiActivity: 'API Activity',
    totalRequests: 'Total Requests',
    apiErrors: 'API Errors',
    methods: 'Methods',
    requestsByMethod: 'Requests by Method',
    frontendIssues: 'Frontend Issues',
    totalFrontendLogs: 'Total Frontend Logs',
    fieldIssues: 'Field Issues',
    componentErrors: 'Component Errors',
    commonErrors: 'Common Errors',
    migrationIssues: 'Migration Issues',
    totalMigrationIssues: 'Total Migration Issues',
    errors: 'Errors',
    warnings: 'Warnings',
    recentMigrationLogs: 'Recent Migration Logs',
    taskLoggerPage: 'Task Logger Page',
    taskModificationPage: 'Task Modification & Activity Page',
    leaveManagement: 'Leave Management',
    meetings: 'Meetings',
    reports: 'Reports',
    adminConsole: 'Admin Console',
    helpSupport: 'Help & Support',
    settings: 'Settings',
    unknownPage: 'Unknown Page',
    specificIssues: 'Specific Issues Identified',
    issueIn: 'Issue identified in',
    component: 'Component',
    uiIssue: 'UI Issue',
    details: 'Details',
    noLogsToExport: 'No logs to export',
    logsExported: 'Logs exported successfully',
    exportFailed: 'Failed to export logs',
    noAnalysisToExport: 'No analysis to export',
    analysisExported: 'Analysis exported successfully'
  },
  
  // Collaboration translations
  collaboration: {
    title: 'Collaboration',
    description: 'Create and manage collaboration links for team projects',
    createLink: 'Create Collaboration Link',
    editLink: 'Edit Collaboration Link',
    updateLink: 'Update Collaboration Link',
    collaborationDetails: 'Collaboration Details',
    titleLabel: 'Collaboration Title',
    descriptionLabel: 'Description',
    availability: 'Availability',
    urgency: 'Urgency',
    createdBy: 'Created By',
    created: 'Created',
    always: 'Always',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    businessHours: 'Business Hours',
    immediate: 'Immediate',
    moderate: 'Moderate',
    asap: 'As Soon As Possible',
    daily: 'Daily',
    none: 'None',
    noTitle: 'No Title',
    noDescription: 'No description provided',
    collaborationCreated: 'Collaboration link created successfully!',
    collaborationUpdated: 'Collaboration link updated successfully!',
    collaborationDeleted: 'Collaboration link deleted successfully!',
    errorSaving: 'Error saving collaboration link. Please try again.',
    errorDeleting: 'Error deleting collaboration link. Please try again.',
    confirmDelete: 'Are you sure you want to delete this collaboration link?'
  }
};

export default translations;


