// Test script to verify filter functionality
console.log('Testing filter functionality...');

// Simulate task data
const tasks = [
  { id: 1, description: 'Task 1', status: 'Pending', userName: 'user1' },
  { id: 2, description: 'Task 2', status: 'Completed', userName: 'user1' },
  { id: 3, description: 'Task 3', status: 'In Progress', userName: 'user2' },
  { id: 4, description: 'Task 4', status: 'Pending', userName: 'user2' },
  { id: 5, description: 'Task 5', status: 'Completed', userName: 'user3' }
];

// Simulate applied filters
const appliedFilters = {
  searchTerm: '',
  statusFilter: 'Pending',
  userFilter: 'user1'
};

// Test filtering logic
const filteredTasks = tasks.filter(task => {
  const matchesSearch = !appliedFilters.searchTerm || 
    (task.description && task.description.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
    (task.userName && task.userName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()));
  
  const matchesStatus = !appliedFilters.statusFilter || task.status === appliedFilters.statusFilter;
  
  // For SystemAdmin:
  // - When no user is selected in filter (userFilter is empty), show all tasks
  // - When a user is selected in filter, show only that user's tasks
  let matchesUser = true;
  const user = { role: 'SystemAdmin' }; // Simulate SystemAdmin
  if (user && user.role === 'SystemAdmin') {
    // SystemAdmin can filter by user
    if (appliedFilters.userFilter) {
      matchesUser = task.userName === appliedFilters.userFilter;
    }
    // If no userFilter, matchesUser remains true (show all tasks)
  } else {
    // Other users only see their own tasks regardless of userFilter
    matchesUser = task.userName === 'user1'; // Simulate current user
  }
  
  return matchesSearch && matchesStatus && matchesUser;
});

console.log('Filtered tasks:', filteredTasks);
console.log('Expected: Task 1 only (Pending status and user1)');