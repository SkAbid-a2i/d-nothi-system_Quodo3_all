// Test date filtering with various date formats
console.log('Testing date filtering with various formats...');

// Test different date formats that might be used in the application
const testDates = [
  '2023-01-01',           // ISO format
  '2023-01-01T00:00:00Z', // ISO with time
  '2023-01-01T00:00:00.000Z', // ISO with milliseconds
  '01/01/2023',           // US format
  '2023/01/01',           // Alternative format
  'Invalid Date'          // Invalid date
];

testDates.forEach(dateStr => {
  const dateObj = new Date(dateStr);
  console.log(`Date string: "${dateStr}" -> Valid: ${!isNaN(dateObj.getTime())}, Parsed: ${dateObj}`);
});

// Test the actual filtering logic with real task data
const sampleTasks = [
  { id: 1, description: 'Task 1', date: '2023-01-01' },
  { id: 2, description: 'Task 2', date: '2023-01-02' },
  { id: 3, description: 'Task 3', date: '2023-01-03' }
];

const filters = {
  startDate: '2023-01-02',
  endDate: '2023-01-02'
};

console.log('\nTesting date filtering with sample tasks:');
console.log('Tasks:', sampleTasks);
console.log('Filters:', filters);

const filteredTasks = sampleTasks.filter(task => {
  const taskDate = new Date(task.date);
  
  // Check if taskDate is valid
  if (isNaN(taskDate.getTime())) {
    console.warn('Invalid task date:', task.date);
    return false;
  } else {
    // Normalize the task date to remove time component for comparison
    taskDate.setHours(0, 0, 0, 0);
    
    let matchesDateRange = true;
    
    if (filters.startDate) {
      const startDateFilter = new Date(filters.startDate);
      startDateFilter.setHours(0, 0, 0, 0);
      // Check if startDateFilter is valid
      if (isNaN(startDateFilter.getTime())) {
        console.warn('Invalid start date filter:', filters.startDate);
      } else if (taskDate < startDateFilter) {
        matchesDateRange = false;
        console.log(`Task ${task.id} filtered out: taskDate (${taskDate}) < startDateFilter (${startDateFilter})`);
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
        console.log(`Task ${task.id} filtered out: taskDate (${taskDate}) > endDateFilter (${endDateFilter})`);
      }
    }
    
    console.log(`Task ${task.id} matches date range: ${matchesDateRange}`);
    return matchesDateRange;
  }
});

console.log('Filtered tasks:', filteredTasks);