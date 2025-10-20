// Simulate the exact scenario described in the issue
console.log('Simulating the agent task visibility issue...');

// Simulate an agent user
const agentUser = {
  id: 2,
  username: 'agent1',
  fullName: 'Agent User',
  role: 'Agent',
  office: null
};

// Simulate tasks returned from the backend for this agent
// (Backend already filters to only show tasks with userId = 2)
const backendTasks = [
  {
    id: 1,
    date: '2025-10-19T00:00:00.000Z',
    source: 'Test Source',
    category: 'Test Category',
    service: 'Test Service',
    userId: 2,
    userName: 'Agent User',
    office: null,
    userInformation: 'Test user info',
    description: 'Test task created via API',
    status: 'Pending',
    comments: [],
    attachments: [],
    files: [],
    createdAt: '2025-10-19T13:05:06.781Z',
    updatedAt: '2025-10-19T13:05:06.781Z'
  }
];

console.log('Backend returned tasks for agent:', backendTasks);

// Simulate the initial state of the component
const initialState = {
  tasks: [], // Initially empty
  appliedFilters: {
    searchTerm: '',
    statusFilter: '',
    userFilter: '',
    startDate: '',
    endDate: ''
  }
};

console.log('Initial component state:', initialState);

// Simulate the fetchTasks function
function simulateFetchTasks(currentUser, currentTasksState) {
  console.log('Simulating fetchTasks for user:', currentUser);
  
  // This is what the backend returns - already filtered
  const tasksData = backendTasks;
  
  console.log('Tasks data from backend:', tasksData);
  
  // Additional debugging to check if tasks have the expected userId
  if (currentUser.role === 'Agent') {
    const userTasks = tasksData.filter(task => task.userId === currentUser.id);
    console.log('Agent tasks check:', { 
      totalTasks: tasksData.length, 
      userTasks: userTasks.length,
      otherTasks: tasksData.filter(task => task.userId !== currentUser.id).map(t => ({ id: t.id, userId: t.userId, description: t.description }))
    });
  }
  
  return tasksData;
}

// Simulate applying the tasks to the component state
const fetchedTasks = simulateFetchTasks(agentUser, initialState.tasks);
console.log('Fetched tasks:', fetchedTasks);

// Simulate the filtering logic
function simulateFiltering(tasks, filters, user) {
  console.log('Applying filters to tasks:', { taskCount: tasks.length, filters, userRole: user.role });
  
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
  
  console.log('Filtering result:', { 
    originalCount: tasks.length, 
    filteredCount: filteredTasks.length,
    filteredTasks: filteredTasks.map(t => ({ id: t.id, description: t.description }))
  });
  
  return filteredTasks;
}

// Test with initial (empty) filters
const initialFilteredTasks = simulateFiltering(fetchedTasks, initialState.appliedFilters, agentUser);
console.log('\n--- Initial Filtering Result ---');
console.log('Agent should see', initialFilteredTasks.length, 'tasks initially');
console.log('Tasks:', initialFilteredTasks);

// Test with some date filters that might be causing issues
console.log('\n--- Testing with Date Filters ---');
const dateFilters = {
  searchTerm: '',
  statusFilter: '',
  userFilter: '',
  startDate: '2025-10-20', // Future date - should filter out all tasks
  endDate: ''
};

const dateFilteredTasks = simulateFiltering(fetchedTasks, dateFilters, agentUser);
console.log('With future date filter, agent should see', dateFilteredTasks.length, 'tasks');
console.log('Tasks:', dateFilteredTasks);

// Test with a date filter that should include the task
console.log('\n--- Testing with Inclusive Date Filter ---');
const inclusiveDateFilters = {
  searchTerm: '',
  statusFilter: '',
  userFilter: '',
  startDate: '2025-10-18', // Before task date
  endDate: '2025-10-20'    // After task date
};

const inclusiveFilteredTasks = simulateFiltering(fetchedTasks, inclusiveDateFilters, agentUser);
console.log('With inclusive date filter, agent should see', inclusiveFilteredTasks.length, 'tasks');
console.log('Tasks:', inclusiveFilteredTasks);