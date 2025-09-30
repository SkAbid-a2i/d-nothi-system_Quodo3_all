const en = {
  // Common
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
    optional: 'optional',
    value: 'Value',
    parent: 'Parent',
    manage: 'Manage'
  },
  
  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    taskLogger: 'Task Logger',
    myTasks: 'My Tasks',
    teamTasks: 'Team Tasks',
    leaves: 'Leaves',
    files: 'Files',
    adminConsole: 'Admin Console',
    reports: 'Reports',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout'
  },
  
  // Login
  login: {
    title: 'Sign in to D-Nothi',
    username: 'Username or Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account? Sign Up",
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
    date: 'Date',
    source: 'Source',
    category: 'Category',
    service: 'Service',
    description: 'Description',
    status: 'Status',
    assignedTo: 'Assigned To',
    actions: 'Actions',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed'
  },
  
  // Leave Management
  leaves: {
    title: 'Leave Management',
    requestNewLeave: 'Request New Leave',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason',
    submitRequest: 'Submit Leave Request',
    leaveRequests: 'Leave Requests',
    employee: 'Employee',
    appliedDate: 'Applied Date',
    calendar: 'Calendar',
    notifications: 'Notifications'
  },
  
  // User Management
  users: {
    title: 'System Admin Console',
    userManagement: 'User Management',
    permissionTemplates: 'Permission Templates',
    dropdownManagement: 'Dropdown Management',
    createNewUser: 'Create New User',
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email',
    role: 'Role',
    office: 'Office',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    createUser: 'Create User',
    updateUser: 'Update User',
    existingTemplates: 'Existing Templates',
    addNewDropdownValue: 'Add New Dropdown Value',
    dropdownType: 'Dropdown Type',
    enterDropdownValue: 'Enter dropdown value',
    selectCategoryFirst: 'Select Category first for Service',
    manageDropdownValues: 'Manage Dropdown Values'
  },
  
  // Files
  files: {
    title: 'File Management',
    storageUsage: 'Storage Usage',
    uploadFile: 'Upload File',
    name: 'Name',
    type: 'Type',
    size: 'Size',
    uploaded: 'Uploaded',
    owner: 'Owner'
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
    activityReport: 'Activity Report'
  },
  
  // Settings
  settings: {
    title: 'Settings',
    profile: 'Profile',
    security: 'Security',
    application: 'Application',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Enable Notifications',
    autoRefresh: 'Auto-refresh Dashboard',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePassword: 'Change Password',
    enable2FA: 'Enable Two-Factor Authentication',
    configure2FA: 'Configure 2FA'
  },
  
  // Help
  help: {
    title: 'Help & Tutorial',
    videoTutorial: 'Video Tutorial',
    userGuide: 'User Guide',
    faq: 'FAQ',
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
  }
};

export default en;