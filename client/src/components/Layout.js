  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.taskLogger'), icon: <TaskIcon />, path: '/tasks' },
    { text: t('navigation.myTasks'), icon: <TaskIcon />, path: '/my-tasks' },
    { text: t('navigation.leaves'), icon: <LeaveIcon />, path: '/leaves' },
    { text: t('navigation.meetings'), icon: <VideoCallIcon />, path: '/meetings' },
    { text: t('navigation.collaboration'), icon: <CollaborationIcon />, path: '/collaboration' },
    { text: t('navigation.kanbanBoard'), icon: <ViewKanbanIcon />, path: '/kanban' },
    { text: t('navigation.errorMonitoring'), icon: <ErrorIcon />, path: '/error-monitoring', allowedRoles: ['SystemAdmin', 'Admin', 'Supervisor'] },
    { text: t('navigation.adminConsole'), icon: <UserIcon />, path: '/admin', allowedRoles: ['SystemAdmin'] },
    { text: t('navigation.reports'), icon: <ReportIcon />, path: '/reports', allowedRoles: ['SystemAdmin', 'Admin', 'Supervisor'] },
    { text: t('navigation.help'), icon: <HelpIcon />, path: '/help' },
  ];