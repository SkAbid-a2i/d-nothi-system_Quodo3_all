// Debug script to understand task filtering issues
console.log('Debugging task filtering issues...');

// Simulate the exact scenario described in the issue
const agentUser = {
  id: 1,
  username: 'agent1',
  fullName: 'Agent One',
  role: 'Agent',
  office: 'Office A'
};

// Simulate tasks that would be returned from the backend for an agent
// (Backend already filters to only show tasks with userId = 1)
const backendFilteredTasks = [
  { 
    id: 1, 
    description: 'Task 1 for Agent 1', 
    userId: 1, 
    userName: 'agent1', 
    office: 'Office A', 
    status: 'Pending', 
    date: '2023-01-01' 
  },
  { 
    id: 2, 
    description: 'Task 2 for Agent 1', 
    userId: 1, 
    userName: 'agent1', 
    office: 'Office A', 
    status: 'Completed', 
    date: '2023-01-02' 
  }
];

console.log('Backend filtered tasks for agent:', backendFilteredTasks);

// Simulate the initial applied filters state (no filters applied)
const initialAppliedFilters = {
  searchTerm: '',
  statusFilter: '',
  userFilter: '',
  startDate: '',
  endDate: ''
};

console.log('Initial applied filters:', initialAppliedFilters);

// Simulate the frontend filtering logic
function applyFrontendFilters(tasks, filters, user) {
  console.log('Applying frontend filters:', { tasks: tasks.length, filters, userRole: user.role });
  
  const filteredTasks = tasks.filter(task => {
    // Since the backend already filters tasks appropriately for each role,
    // we don't need to filter by user role here anymore
    
    const matchesSearch = !filters.searchTerm || 
      (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (task.service && task.service.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    const matchesStatus = !filters.statusFilter || task.status === filters.statusFilter;
    
    // Add date range filtering
    let matchesDateRange = true;
    if (filters.startDate || filters.endDate) {
      // Ensure task.date is a valid date string
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
          // Check if startDateFilter is valid
          if (isNaN(startDateFilter.getTime())) {
            console.warn('Invalid start date filter:', filters.startDate);
          } else if (taskDate < startDateFilter) {
            matchesDateRange = false;
          }
        }
        
        if (filters.endDate) {
          const endDateFilter = new Date(filters.endDate);
          endDateFilter.setHours(23, 59, 59, 999); // End of day
          // Check if endDateFilter is valid
          if (isNaN(endDateFilter.getTime())) {
            console.warn('Invalid end date filter:', filters.endDate);
          } else if (taskDate > endDateFilter) {
            matchesDateRange = false;
          }
        }
      }
    }
    
    // Log filter results for debugging
    const result = matchesSearch && matchesStatus && matchesDateRange;
    if (!result) {
      console.log('Task filtered out:', {
        task: task.description,
        taskDate: task.date,
        taskUser: task.userName,
        currentUser: user.username,
        userRole: user.role,
        matchesSearch,
        matchesStatus,
        matchesDateRange,
        filters
      });
    }
    
    return result;
  });
  
  console.log('Frontend filtering result:', { 
    originalCount: tasks.length, 
    filteredCount: filteredTasks.length,
    filteredTasks: filteredTasks.map(t => ({ id: t.id, description: t.description }))
  });
  
  return filteredTasks;
}

// Test the filtering
const result = applyFrontendFilters(backendFilteredTasks, initialAppliedFilters, agentUser);
console.log('\n--- Final Result ---');
console.log('Agent should see', result.length, 'tasks');
console.log('Tasks:', result);

// Test with date filters that might be causing issues
console.log('\n--- Testing with Date Filters ---');
const dateFilters = {
  searchTerm: '',
  statusFilter: '',
  userFilter: '',
  startDate: '2023-01-02', // Only tasks from this date onwards
  endDate: ''
};

const dateFilteredResult = applyFrontendFilters(backendFilteredTasks, dateFilters, agentUser);
console.log('With date filter, agent should see', dateFilteredResult.length, 'tasks');
console.log('Tasks:', dateFilteredResult);