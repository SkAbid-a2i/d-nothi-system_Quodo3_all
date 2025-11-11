// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const leaveRoutes = require('./routes/leave.routes');
const dropdownRoutes = require('./routes/dropdown.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');
const logRoutes = require('./routes/log.routes');
const frontendLogRoutes = require('./routes/frontendLog.routes');
const permissionRoutes = require('./routes/permission.routes');
const fileRoutes = require('./routes/file.routes');
const meetingRoutes = require('./routes/meeting.routes');
const healthRoutes = require('./routes/health.routes');
const collaborationRoutes = require('./routes/collaboration.routes');
const notificationRoutes = require('./routes/notification.routes');
const kanbanRoutes = require('./routes/kanban.routes');

// Add debugging to check if routes are loaded
console.log('Collaboration routes loaded:', !!collaborationRoutes);

// Apply global CORS middleware to all routes
app.use(cors({
  origin: parseCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false
}));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/kanban', kanbanRoutes);