const translations = {
  // Common labels
  common: {
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা করুন',
    add: 'যোগ করুন',
    search: 'অনুসন্ধান করুন',
    filter: 'ফিল্টার',
    clear: 'পরিষ্কার করুন',
    export: 'রপ্তানি করুন',
    download: 'ডাউনলোড করুন',
    upload: 'আপলোড করুন',
    close: 'বন্ধ করুন',
    submit: 'জমা দিন',
    approve: 'অনুমোদন করুন',
    reject: 'প্রত্যাখ্যান করুন',
    view: 'দেখুন',
    details: 'বিস্তারিত',
    optional: 'ঐচ্ছিক',
    value: 'মান',
    parent: 'পিতা মাতা',
    manage: 'পরিচালনা করুন',
    actions: 'ক্রিয়াকলাপ',
    status: 'অবস্থা',
    date: 'তারিখ',
    description: 'বিবরণ',
    reason: 'কারণ',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষ তারিখ',
    appliedDate: 'আবেদনের তারিখ',
    employee: 'কর্মচারী',
    name: 'নাম',
    email: 'ইমেইল',
    role: 'ভূমিকা',
    office: 'অফিস',
    welcome: 'স্বাগতম',
    saving: 'সংরক্ষণ হচ্ছে...',
    deleting: 'মুছে ফেলা হচ্ছে...',
    all: 'সব',
    na: 'প্রযোজ্য নয়'
  },
  
  // Navigation
  navigation: {
    dashboard: 'ড্যাশবোর্ড',
    taskLogger: 'টাস্ক লগার',
    myTasks: 'টাস্ক মডিফিকেশন এবং অ্যাক্টিভিটি',
    teamTasks: 'দলের টাস্কগুলি',
    leaves: 'ছুটি ম্যানেজমেন্ট',
    meetings: 'সভা',
    errorMonitoring: 'ত্রুটি পর্যবেক্ষণ',
    files: 'ফাইল ম্যানেজমেন্ট',
    adminConsole: 'অ্যাডমিন কনসোল',
    reports: 'প্রতিবেদন',
    settings: 'সেটিংস',
    help: 'সাহায্য এবং সমর্থন',
    logout: 'লগআউট',
    collaboration: 'সহযোগিতা',
    kanban: 'কানবান বোর্ড'
  },
  
  // Login
  login: {
    title: 'Zenith⚡Your Teamwork',
    username: 'ব্যবহারকারীর নাম বা ইমেল',
    password: 'পাসওয়ার্ড',
    rememberMe: 'আমাকে মনে রাখুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    noAccount: 'অ্যাকাউন্ট নেই? প্রশাসকের সাথে যোগাযোগ করুন',
    signIn: 'সাইন ইন করুন'
  },
  
  // Dashboard
  dashboard: {
    agent: {
      title: 'এজেন্ট ড্যাশবোর্ড',
      totalTasks: 'মোট টাস্ক',
      pendingLeaves: 'মুলতুবি ছুটি',
      reportsGenerated: 'প্রতিবেদন তৈরি হয়েছে',
      notifications: 'বিজ্ঞপ্তি',
      taskDistribution: 'টাস্ক শ্রেণিবিভাগ',
      taskHistory: 'টাস্ক ইতিহাস',
      leaveSummary: 'ছুটি সারসংক্ষেপ',
      recentActivity: 'সাম্প্রতিক কার্যকলাপ'
    },
    admin: {
      title: 'অ্যাডমিন ড্যাশবোর্ড',
      totalTeamTasks: 'মোট দলের টাস্ক',
      pendingLeaves: 'মুলতুবি ছুটি',
      reportsGenerated: 'প্রতিবেদন তৈরি হয়েছে',
      teamNotifications: 'দলের বিজ্ঞপ্তি',
      teamPerformance: 'দলের কর্মক্ষমতা',
      teamTasks: 'দলের টাস্ক',
      pendingLeavesRequests: 'মুলতুবি ছুটি অনুরোধ',
      customizableWidgets: 'কাস্টমাইজযোগ্য উইজেট',
      whosOnLeave: 'আজ কে ছুটিতে আছে'
    }
  },
  
  // Task Management
  tasks: {
    title: 'টাস্ক ম্যানেজমেন্ট',
    taskLogger: 'টাস্ক লগার',
    createNewTask: 'নতুন টাস্ক তৈরি করুন',
    date: 'টাস্ক তারিখ',
    source: 'উৎস',
    category: 'বিভাগ',
    service: 'সেবা',
    description: 'টাস্ক বর্ণনা',
    status: 'অবস্থা',
    actions: 'ক্রিয়াকলাপ',
    pending: 'মুলতুবি',
    inProgress: 'চলমান',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল',
    errorFetchingTasks: 'টাস্কগুলি আনতে ত্রুটি',
    taskCreated: 'টাস্ক সফলভাবে তৈরি হয়েছে',
    taskUpdated: 'টাস্ক সফলভাবে আপডেট হয়েছে',
    taskDeleted: 'টাস্ক সফলভাবে মুছে ফেলা হয়েছে',
    taskCreationFailed: 'টাস্ক তৈরি করতে ব্যর্থ',
    taskUpdateFailed: 'টাস্ক আপডেট করতে ব্যর্থ',
    taskDeletionFailed: 'টাস্ক মুছে ফেলতে ব্যর্থ'
  },
  
  // Leave Management
  leaves: {
    title: 'ছুটি ম্যানেজমেন্ট',
    requestNewLeave: 'নতুন ছুটির অনুরোধ করুন',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষ তারিখ',
    reason: 'ছুটির কারণ',
    submitRequest: 'ছুটির অনুরোধ জমা দিন',
    leaveRequests: 'ছুটির অনুরোধ',
    employee: 'কর্মচারী',
    appliedDate: 'আবেদনের তারিখ',
    calendar: 'ছুটি ক্যালেন্ডার',
    notifications: 'বিজ্ঞপ্তি',
    leaveCreated: 'ছুটির অনুরোধ সফলভাবে জমা হয়েছে',
    leaveUpdated: 'ছুটির অনুরোধ সফলভাবে আপডেট হয়েছে',
    leaveDeleted: 'ছুটির অনুরোধ সফলভাবে মুছে ফেলা হয়েছে',
    leaveApproved: 'ছুটির অনুরোধ সফলভাবে অনুমোদন হয়েছে',
    leaveRejected: 'ছুটির অনুরোধ সফলভাবে প্রত্যাখ্যান হয়েছে',
    leaveCreationFailed: 'ছুটির অনুরোধ জমা দিতে ব্যর্থ',
    leaveUpdateFailed: 'ছুটির অনুরোধ আপডেট করতে ব্যর্থ',
    leaveDeletionFailed: 'ছুটির অনুরোধ মুছে ফেলতে ব্যর্থ',
    leaveApprovalFailed: 'ছুটির অনুরোধ অনুমোদন করতে ব্যর্থ',
    leaveRejectionFailed: 'ছুটির অনুরোধ প্রত্যাখ্যান করতে ব্যর্থ'
  },
  
  // User Management
  users: {
    title: 'সিস্টেম প্রশাসন',
    userManagement: 'ব্যবহারকারী ম্যানেজমেন্ট',
    permissionTemplates: 'অনুমতি টেমপ্লেট',
    dropdownManagement: 'ড্রপডাউন ম্যানেজমেন্ট',
    createNewUser: 'নতুন ব্যবহারকারী তৈরি করুন',
    fullName: 'পূর্ণ নাম',
    username: 'ব্যবহারকারীর নাম',
    email: 'ইমেইল ঠিকানা',
    role: 'ব্যবহারকারী ভূমিকা',
    office: 'অফিস অবস্থান',
    status: 'অ্যাকাউন্ট অবস্থা',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    createUser: 'ব্যবহারকারী তৈরি করুন',
    updateUser: 'ব্যবহারকারী আপডেট করুন',
    existingTemplates: 'বিদ্যমান টেমপ্লেটগুলি',
    addNewDropdownValue: 'নতুন ড্রপডাউন মান যোগ করুন',
    dropdownType: 'ড্রপডাউন ধরন',
    enterDropdownValue: 'ড্রপডাউন মান লিখুন',
    selectCategoryFirst: 'পরিষেবার জন্য প্রথমে বিভাগ নির্বাচন করুন',
    manageDropdownValues: 'ড্রপডাউন মানগুলি পরিচালনা করুন',
    userCreated: 'ব্যবহারকারী সফলভাবে তৈরি হয়েছে',
    userUpdated: 'ব্যবহারকারী সফলভাবে আপডেট হয়েছে',
    userDeleted: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে',
    userStatusUpdated: 'ব্যবহারকারীর অবস্থা সফলভাবে আপডেট হয়েছে',
    userCreationFailed: 'ব্যবহারকারী তৈরি করতে ব্যর্থ',
    userUpdateFailed: 'ব্যবহারকারী আপডেট করতে ব্যর্থ',
    userDeletionFailed: 'ব্যবহারকারী মুছে ফেলতে ব্যর্থ',
    userStatusUpdateFailed: 'ব্যবহারকারীর অবস্থা আপডেট করতে ব্যর্থ',
    roleOptions: {
      agent: 'এজেন্ট',
      supervisor: 'সুপারভাইজার',
      admin: 'প্রশাসক',
      systemAdmin: 'সিস্টেম প্রশাসক'
    }
  },
  
  // Files
  files: {
    title: 'ফাইল ম্যানেজমেন্ট',
    storageUsage: 'স্টোরেজ ব্যবহার',
    uploadFile: 'ফাইল আপলোড করুন',
    name: 'ফাইলের নাম',
    type: 'ফাইলের ধরন',
    size: 'ফাইলের আকার',
    uploaded: 'আপলোডের তারিখ',
    owner: 'আপলোড করেছেন',
    fileUploaded: 'ফাইল সফলভাবে আপলোড হয়েছে',
    fileUploadFailed: 'ফাইল আপলোড করতে ব্যর্থ',
    fileDeleted: 'ফাইল সফলভাবে মুছে ফেলা হয়েছে',
    fileDeletionFailed: 'ফাইল মুছে ফেলতে ব্যর্থ'
  },
  
  // Reports
  reports: {
    title: 'প্রতিবেদন ম্যানেজমেন্ট',
    taskReports: 'টাস্ক প্রতিবেদন',
    leaveReports: 'ছুটি প্রতিবেদন',
    activityReports: 'কার্যকলাপ প্রতিবেদন',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষ তারিখ',
    reportType: 'প্রতিবেদনের ধরন',
    generateReport: 'প্রতিবেদন তৈরি করুন',
    taskReport: 'টাস্ক প্রতিবেদন',
    leaveReport: 'ছুটি প্রতিবেদন',
    activityReport: 'কার্যকলাপ প্রতিবেদন',
    reportGenerated: 'প্রতিবেদন সফলভাবে তৈরি হয়েছে',
    reportGenerationFailed: 'প্রতিবেদন তৈরি করতে ব্যর্থ'
  },
  
  // Settings
  settings: {
    title: 'সিস্টেম সেটিংস',
    profile: 'প্রোফাইল সেটিংস',
    security: 'নিরাপত্তা সেটিংস',
    application: 'অ্যাপ্লিকেশন সেটিংস',
    language: 'ভাষা',
    theme: {
      light: 'আলো',
      dark: 'অন্ধকার'
    },
    notifications: 'বিজ্ঞপ্তি সক্ষম করুন',
    autoRefresh: 'ড্যাশবোর্ড স্বয়ংক্রিয়-রিফ্রেশ করুন',
    currentPassword: 'বর্তমান পাসওয়ার্ড',
    newPassword: 'নতুন পাসওয়ার্ড',
    confirmNewPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
    changePassword: 'পাসওয়ার্ড পরিবর্তন করুন',
    enable2FA: 'দুই-ফ্যাক্টর প্রমাণীকরণ সক্ষম করুন',
    configure2FA: '2FA কনফিগার করুন',
    settingsSaved: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
    settingsSaveFailed: 'সেটিংস সংরক্ষণ করতে ব্যর্থ'
  },
  
  // Help
  help: {
    title: 'সাহায্য এবং সমর্থন',
    videoTutorial: 'ভিডিও টিউটোরিয়াল',
    userGuide: 'ব্যবহারকারী গাইড',
    faq: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    needHelp: 'আরও সাহায্য প্রয়োজন?',
    contactSupport: 'আপনার যদি কোনও প্রশ্ন থাকে বা সহায়তা প্রয়োজন হয়, তবে অনুগ্রহ করে আমাদের সমর্থন দলের সাথে যোগাযোগ করুন support@d-nothi.com-এ',
    faqItems: {
      createTask: {
        question: 'আমি কীভাবে একটি নতুন টাস্ক তৈরি করতে পারি?',
        answer: 'একটি নতুন টাস্ক তৈরি করতে, টাস্ক লগার পৃষ্ঠায় নেভিগেট করুন এবং প্রয়োজনীয় তথ্য দিয়ে ফর্মটি পূরণ করুন।'
      },
      submitLeave: {
        question: 'আমি কীভাবে ছুটির অনুরোধ জমা দিতে পারি?',
        answer: 'ছুটি পৃষ্ঠায় যান এবং \'নতুন ছুটির অনুরোধ করুন\' বোতামে ক্লিক করুন। শুরুর তারিখ, শেষ তারিখ এবং আপনার ছুটির জন্য কারণ পূরণ করুন।'
      },
      exportReports: {
        question: 'আমি কীভাবে প্রতিবেদন রপ্তানি করতে পারি?',
        answer: 'ড্যাশবোর্ডে, সিএসভি, এক্সেল বা পিডিএফ ফর্ম্যাটে প্রতিবেদন ডাউনলোড করতে রপ্তানি বোতামগুলি ব্যবহার করুন।'
      }
    }
  },
  
  // Error Monitoring translations
  errors: {
    title: 'ত্রুটি পর্যবেক্ষণ',
    description: 'সিস্টেম ত্রুটি এবং সমস্যাগুলি ট্র্যাক এবং মনিটর করুন',
    logs: 'লগ',
    analysis: 'বিশ্লেষণ',
    totalLogs: 'মোট লগ',
    errorMessage: 'ত্রুটি বার্তা',
    count: 'গণনা',
    examples: 'উদাহরণ',
    timestamp: 'টাইমস্ট্যাম্প',
    level: 'স্তর',
    message: 'বার্তা',
    apiActivity: 'API কার্যকলাপ',
    totalRequests: 'মোট অনুরোধ',
    apiErrors: 'API ত্রুটি',
    methods: 'পদ্ধতি',
    requestsByMethod: 'পদ্ধতি অনুযায়ী অনুরোধ',
    frontendIssues: 'ফ্রন্টএন্ড সমস্যা',
    totalFrontendLogs: 'মোট ফ্রন্টএন্ড লগ',
    fieldIssues: 'ক্ষেত্র সমস্যা',
    componentErrors: 'উপাদান ত্রুটি',
    commonErrors: 'সাধারণ ত্রুটি',
    migrationIssues: 'মাইগ্রেশন সমস্যা',
    totalMigrationIssues: 'মোট মাইগ্রেশন সমস্যা',
    errors: 'ত্রুটি',
    warnings: 'সতর্কতা',
    recentMigrationLogs: 'সাম্প্রতিক মাইগ্রেশন লগ',
    taskLoggerPage: 'টাস্ক লগার পৃষ্ঠা',
    taskModificationPage: 'টাস্ক পরিবর্তন ও কার্যকলাপ পৃষ্ঠা',
    leaveManagement: 'ছুটি ম্যানেজমেন্ট',
    meetings: 'সভা',
    reports: 'প্রতিবেদন',
    adminConsole: 'অ্যাডমিন কনসোল',
    helpSupport: 'সাহায্য ও সমর্থন',
    settings: 'সেটিংস',
    unknownPage: 'অজানা পৃষ্ঠা',
    specificIssues: 'নির্দিষ্ট সমস্যা চিহ্নিত',
    issueIn: 'সমস্যা চিহ্নিত',
    component: 'উপাদান',
    uiIssue: 'UI সমস্যা',
    details: 'বিস্তারিত',
    noLogsToExport: 'রপ্তানি করার জন্য কোন লগ নেই',
    logsExported: 'লগ সফলভাবে রপ্তানি করা হয়েছে',
    exportFailed: 'লগ রপ্তানি করতে ব্যর্থ',
    noAnalysisToExport: 'রপ্তানি করার জন্য কোন বিশ্লেষণ নেই',
    analysisExported: 'বিশ্লেষণ সফলভাবে রপ্তানি করা হয়েছে'
  },
  
  // Collaboration translations
  collaboration: {
    title: 'সহযোগিতা',
    description: 'দলের প্রকল্পের জন্য সহযোগিতার লিঙ্ক তৈরি এবং পরিচালনা করুন',
    createLink: 'সহযোগিতার লিঙ্ক তৈরি করুন',
    editLink: 'সহযোগিতার লিঙ্ক সম্পাদনা করুন',
    updateLink: 'সহযোগিতার লিঙ্ক আপডেট করুন',
    collaborationDetails: 'সহযোগিতার বিস্তারিত',
    titleLabel: 'সহযোগিতার শিরোনাম',
    descriptionLabel: 'বিবরণ',
    availability: 'উপলব্ধতা',
    urgency: 'জরুরি',
    createdBy: 'তৈরি করেছেন',
    created: 'তৈরি হয়েছে',
    always: 'সবসময়',
    weekdays: 'কর্মদিবস',
    weekends: 'সপ্তাহান্ত',
    businessHours: 'অফিস সময়',
    immediate: 'অতি ত্বরিত',
    moderate: 'মাঝারি',
    asap: 'যত তাড়াতাড়ি সম্ভব',
    daily: 'প্রতিদিন',
    none: 'কিছু না',
    noTitle: 'শিরোনাম নেই',
    noDescription: 'কোন বিবরণ দেওয়া হয়নি',
    collaborationCreated: 'সহযোগিতার লিঙ্ক সফলভাবে তৈরি হয়েছে!',
    collaborationUpdated: 'সহযোগিতার লিঙ্ক সফলভাবে আপডেট হয়েছে!',
    collaborationDeleted: 'সহযোগিতার লিঙ্ক সফলভাবে মুছে ফেলা হয়েছে!',
    errorSaving: 'সহযোগিতার লিঙ্ক সংরক্ষণ করতে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    errorDeleting: 'সহযোগিতার লিঙ্ক মুছে ফেলতে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    confirmDelete: 'আপনি কি নিশ্চিত যে এই সহযোগিতার লিঙ্কটি মুছে ফেলতে চান?'
  }
};

export default translations;


