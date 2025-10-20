// Test script to verify task filtering behavior
console.log('Testing task filtering logic...');

// Simulate user data
const agentUser = {
  id: 1,
  username: 'agent1',
  fullName: 'Agent One',
  role: 'Agent',
  office: 'Office A'
};

const adminUser = {
  id: 2,
  username: 'admin1',
  fullName: 'Admin One',
  role: 'Admin',
  office: 'Office A'
};

const systemAdminUser = {
  id: 3,
  username: 'systemadmin1',
  fullName: 'System Admin One',
  role: 'SystemAdmin',
  office: 'Headquarters'
};

// Simulate task data
const tasks = [
  { id: 1, description: 'Task 1', userId: 1, userName: 'agent1', office: 'Office A', status: 'Pending', date: '2023-01-01' },
  { id: 2, description: 'Task 2', userId: 1, userName: 'agent1', office: 'Office A', status: 'Completed', date: '2023-01-02' },
  { id: 3, description: 'Task 3', userId: 2, userName: 'admin1', office: 'Office A', status: 'In Progress', date: '2023-01-03' },
  { id: 4, description: 'Task 4', userId: 3, userName: 'systemadmin1', office: 'Headquarters', status: 'Pending', date: '2023-01-04' },
  { id: 5, description: 'Task 5', userId: 4, userName: 'agent2', office: 'Office B', status: 'Completed', date: '2023-01-05' }
];

console.log('All tasks:', tasks);

// Test backend filtering logic
function filterTasksForUser(user, allTasks) {
  let filteredTasks = [];
  
  if (user.role === 'Agent') {
    // Agents can only see their own tasks
    filteredTasks = allTasks.filter(task => task.userId === user.id);
  } else if (user.role === 'Admin' || user.role === 'Supervisor') {
    // Admins and Supervisors can see their team's tasks
    if (user.office) {
      filteredTasks = allTasks.filter(task => task.office === user.office);
    } else {
      filteredTasks = [];
    }
  } else {
    // SystemAdmin can see all tasks
    filteredTasks = [...allTasks];
  }
  
  return filteredTasks;
}

console.log('\n--- Backend Filtering Results ---');
console.log('Agent tasks:', filterTasksForUser(agentUser, tasks));
console.log('Admin tasks:', filterTasksForUser(adminUser, tasks));
console.log('SystemAdmin tasks:', filterTasksForUser(systemAdminUser, tasks));

// Test frontend filtering logic
function applyFrontendFilters(tasks, filters, user) {
  return tasks.filter(task => {
    // Since the backend already filters tasks appropriately for each role,
    // we don't need to filter by user role here anymore
    
    const matchesSearch = !filters.searchTerm || 
      (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    const matchesStatus = !filters.statusFilter || task.status === filters.statusFilter;
    
    // Add date range filtering
    let matchesDateRange = true;
    if (filters.startDate || filters.endDate) {
      const taskDate = new Date(task.date);
      
      // Check if taskDate is valid
      if (isNaN(taskDate.getTime())) {
        console.warn('Invalid task date:', task.date);
        matchesDateRange = false;
      } else {
        // Normalize the task date to remove time component for comparison
        taskDate.setHours(0, 0, 0, 0);
        
        if (filters.startDate) {
          const startDateFilter = new Date(filters.startDate);
          startDateFilter.setHours(0, 0, 0, 0);
          if (taskDate < startDateFilter) {
            matchesDateRange = false;
          }
        }
        
        if (filters.endDate) {
          const endDateFilter = new Date(filters.endDate);
          endDateFilter.setHours(23, 59, 59, 999); // End of day
          if (taskDate > endDateFilter) {
            matchesDateRange = false;
          }
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });
}

console.log('\n--- Frontend Filtering Results ---');
const agentFilteredTasks = filterTasksForUser(agentUser, tasks);
console.log('Agent filtered tasks (no filters):', applyFrontendFilters(agentFilteredTasks, {}, agentUser));

const adminFilteredTasks = filterTasksForUser(adminUser, tasks);
console.log('Admin filtered tasks (no filters):', applyFrontendFilters(adminFilteredTasks, {}, adminUser));

const systemAdminFilteredTasks = filterTasksForUser(systemAdminUser, tasks);
console.log('SystemAdmin filtered tasks (no filters):', applyFrontendFilters(systemAdminFilteredTasks, {}, systemAdminUser));

// Test with date filters
const dateFilters = {
  startDate: '2023-01-02',
  endDate: '2023-01-04'
};

console.log('\n--- Date Filtering Results ---');
console.log('Agent tasks with date filter:', applyFrontendFilters(agentFilteredTasks, dateFilters, agentUser));
console.log('Admin tasks with date filter:', applyFrontendFilters(adminFilteredTasks, dateFilters, adminUser));
console.log('SystemAdmin tasks with date filter:', applyFrontendFilters(systemAdminFilteredTasks, dateFilters, systemAdminUser));