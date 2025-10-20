import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Autocomplete,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { dropdownAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';
import useUserFilter from '../hooks/useUserFilter';
import UserFilterDropdown from './UserFilterDropdown';

const TaskManagement = () => {
  const { user } = useAuth();
  
  // Add debugging to ensure we can see the user context
  console.log('TaskManagement component rendered with user:', user);
  
  const [tasks, setTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [offices, setOffices] = useState([]); // Add offices state
  const [selectedOffice, setSelectedOffice] = useState(null); // Add selected office state
  const [userInformation, setUserInformation] = useState(''); // Add user information state
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [files, setFiles] = useState([]); // File upload state
  // Removed assignedTo state as requested
  // Removed flag state as requested
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSelectedSource, setEditSelectedSource] = useState(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState(null);
  const [editSelectedService, setEditSelectedService] = useState(null);
  const [editSelectedOffice, setEditSelectedOffice] = useState(null); // Add edit selected office state
  const [editUserInformation, setEditUserInformation] = useState(''); // Add edit user information state
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editFiles, setEditFiles] = useState([]); // Edit file upload state
  // Removed editAssignedTo state as requested
  // Removed editFlag state as requested
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState(''); // Add start date filter
  const [endDate, setEndDate] = useState(''); // Add end date filter
  
  // Use the new user filter hook
  const { users, loading: userLoading, error: userError, fetchUsers } = useUserFilter(user);

  // State for applied filters - Initialize with default values that don't filter out agent tasks
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    statusFilter: '',
    userFilter: '', // This should always be empty for non-SystemAdmin users
    startDate: '',
    endDate: ''
  });

  // Apply filters when Apply button is clicked
  const applyFilters = () => {
    const newAppliedFilters = {
      searchTerm,
      statusFilter,
      userFilter: '', // Always empty since we removed user filter
      startDate,
      endDate
    };
    
    console.log('Applying filters:', {
      searchTerm,
      statusFilter,
      startDate,
      endDate,
      newAppliedFilters
    });
    
    setAppliedFilters(newAppliedFilters);
    showSnackbar('Filters applied', 'info');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      searchTerm: '',
      statusFilter: '',
      userFilter: '',
      startDate: '',
      endDate: ''
    });
    showSnackbar('Filters cleared', 'info');
  };

  // Add a function to reset to default view (show all user's tasks)
  const resetToDefaultView = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedFilters({
      searchTerm: '',
      statusFilter: '',
      userFilter: '',
      startDate: '',
      endDate: ''
    });
    showSnackbar('View reset to default', 'info');
  };

  // Remove the automatic filter application to make Apply button work as intended
  // The useEffect that was automatically applying filters has been removed

  // Add a useEffect to ensure proper initialization
  useEffect(() => {
    console.log('TaskManagement component initialized');
    // Ensure we start with a clean state
    resetToDefaultView();
  }, []);

  // Filter services when category changes (for create form)
  useEffect(() => {
    if (selectedCategory) {
      fetchServicesForCategory(selectedCategory.value);
    } else {
      setServices([]);
      setSelectedService(null);
    }
  }, [selectedCategory]);

  // Filter services when category changes (for edit form)
  useEffect(() => {
    if (editSelectedCategory) {
      fetchServicesForCategory(editSelectedCategory.value, true);
    } else {
      setServices([]);
      setEditSelectedService(null);
    }
  }, [editSelectedCategory]);

  const fetchTasks = useCallback(async () => {
    // Don't fetch tasks if user is not available yet
    if (!user) {
      console.log('User not available yet, skipping task fetch');
      return;
    }
    
    setDataLoading(true);
    try {
      console.log('Fetching tasks for user:', user);
      const response = await taskAPI.getAllTasks();
      console.log('Tasks response:', response);
      
      // Filter tasks based on user role
      let tasksData = Array.isArray(response.data) ? response.data : 
                       response.data?.data || response.data || [];
      
      console.log('Raw tasks data:', tasksData);
      console.log('User info for filtering:', {
        role: user.role,
        username: user.username,
        fullName: user.fullName
      });
      
      // For SystemAdmin, show all tasks
      // For other roles (Admin, Supervisor, Agent), show only their own tasks
      if (user.role === 'SystemAdmin') {
        // SystemAdmin sees all tasks - no filtering needed
        console.log('SystemAdmin: showing all tasks');
      } else {
        // Other users only see their own tasks
        // Use both username and fullName for matching to ensure compatibility
        const currentUserIdentifier = user.fullName || user.username;
        console.log('Filtering tasks for user:', currentUserIdentifier);
        
        tasksData = tasksData.filter(task => {
          const taskUserIdentifier = task.userName;
          const isMatch = taskUserIdentifier === currentUserIdentifier;
          console.log('Task user matching:', {
            taskUser: taskUserIdentifier,
            currentUser: currentUserIdentifier,
            isMatch: isMatch
          });
          return isMatch;
        });
        
        console.log(`${user.role}: filtered to user tasks`, tasksData.length);
        // Log the filtered tasks for debugging
        console.log('Filtered tasks:', tasksData.map(t => ({
          id: t.id,
          description: t.description,
          userName: t.userName
        })));
        
        // Additional check for agents
        if (user.role === 'Agent' && tasksData.length === 0) {
          console.warn('Agent has no tasks. This might be expected or could indicate an issue.');
          console.log('All tasks from API:', Array.isArray(response.data) ? response.data : 
                       response.data?.data || response.data || []);
        }
      }
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch tasks';
      setError('Failed to fetch tasks: ' + errorMessage);
      showSnackbar('Failed to fetch tasks: ' + errorMessage, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [user]); // Add user to dependencies

  // Add function to directly update status in database
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Update status directly in database
      const response = await taskAPI.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      showSnackbar('Task status updated successfully!', 'success');
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task status';
      showSnackbar('Failed to update task status: ' + errorMessage, 'error');
      throw error;
    }
  };

  // Fetch tasks on component mount - Simplified version
  useEffect(() => {
    // Only fetch data if user is available
    if (user) {
      console.log('User available, fetching tasks and dropdown values');
      console.log('User info:', {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      });
      
      fetchTasks();
      fetchDropdownValues();
      
      // Subscribe to auto-refresh service
      autoRefreshService.subscribe('TaskManagement', 'tasks', fetchTasks, 30000);
      
      // Clean up subscription on component unmount
      return () => {
        console.log('Cleaning up auto-refresh subscription');
        autoRefreshService.unsubscribe('TaskManagement');
      };
    } else {
      console.log('User not available yet');
    }
  }, [user, fetchTasks, fetchDropdownValues]); // Include fetchDropdownValues in dependencies

  // Add a useEffect to monitor when tasks change
  useEffect(() => {
    console.log('Tasks state updated:', {
      totalTasks: tasks.length,
      firstFewTasks: tasks.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName
      }))
    });
  }, [tasks]);

  // Move filteredTasks definition before any useEffect that uses it
  // Filter tasks based on applied filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Log the task and user info for debugging
      console.log('Filtering task:', {
        taskId: task.id,
        taskDescription: task.description,
        taskUser: task.userName,
        currentUser: user?.username,
        currentUserFullName: user?.fullName,
        userRole: user?.role
      });
      
      // Ensure agents and other non-SystemAdmin users only see their own tasks
      // This is a critical fix for the agent task visibility issue
      if (user && user.role !== 'SystemAdmin') {
        // Double-check that we're properly filtering for the current user
        // Use both username and fullName for matching to ensure compatibility
        const currentUserIdentifier = user.fullName || user.username;
        const taskUserIdentifier = task.userName;
        
        // Add more flexible matching to handle potential formatting differences
        const isUserMatch = taskUserIdentifier === currentUserIdentifier ||
                           (taskUserIdentifier && currentUserIdentifier && 
                            (taskUserIdentifier.includes(currentUserIdentifier) || 
                             currentUserIdentifier.includes(taskUserIdentifier))) ||
                           // Fallback for cases where we might have partial matches
                           (taskUserIdentifier && currentUserIdentifier && 
                            (taskUserIdentifier.toLowerCase().includes(currentUserIdentifier.toLowerCase()) || 
                             currentUserIdentifier.toLowerCase().includes(taskUserIdentifier.toLowerCase())));
        
        console.log('User matching check:', {
          taskUser: taskUserIdentifier,
          currentUser: currentUserIdentifier,
          exactMatch: taskUserIdentifier === currentUserIdentifier,
          flexibleMatch: (taskUserIdentifier && currentUserIdentifier && 
                         (taskUserIdentifier.includes(currentUserIdentifier) || 
                          currentUserIdentifier.includes(taskUserIdentifier))),
          caseInsensitiveMatch: (taskUserIdentifier && currentUserIdentifier && 
                                (taskUserIdentifier.toLowerCase().includes(currentUserIdentifier.toLowerCase()) || 
                                 currentUserIdentifier.toLowerCase().includes(taskUserIdentifier.toLowerCase()))),
          isMatch: isUserMatch
        });
        
        if (!isUserMatch) {
          console.log('Task filtered out due to user mismatch');
          return false;
        }
      }
      
      // Apply search filter
      const matchesSearch = !appliedFilters.searchTerm || 
        (task.description && task.description.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.service && task.service.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.userName && task.userName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = !appliedFilters.statusFilter || task.status === appliedFilters.statusFilter;
      
      // For SystemAdmin:
      // - When no user is selected in filter (userFilter is empty), show all tasks
      // - When a user is selected in filter, show only that user's tasks
      let matchesUser = true;
      if (user && user.role === 'SystemAdmin' && appliedFilters.userFilter) {
        matchesUser = task.userName === appliedFilters.userFilter;
      }
      
      // Apply date range filtering
      let matchesDateRange = true;
      if (appliedFilters.startDate || appliedFilters.endDate) {
        // Handle case where task.date might be null or undefined
        if (!task.date) {
          matchesDateRange = false;
        } else {
          const taskDate = new Date(task.date);
          // Check if taskDate is valid
          if (isNaN(taskDate.getTime())) {
            console.log('Invalid task date:', task.date);
            matchesDateRange = false;
          } else {
            // Normalize the task date to remove time component for comparison
            taskDate.setHours(0, 0, 0, 0);
            
            if (appliedFilters.startDate) {
              const startDateFilter = new Date(appliedFilters.startDate);
              // Check if startDateFilter is valid
              if (isNaN(startDateFilter.getTime())) {
                console.log('Invalid start date filter:', appliedFilters.startDate);
              } else {
                startDateFilter.setHours(0, 0, 0, 0);
                if (taskDate < startDateFilter) {
                  matchesDateRange = false;
                  console.log('Task date is before start date filter:', {
                    taskDate,
                    startDateFilter
                  });
                }
              }
            }
            if (appliedFilters.endDate) {
              const endDateFilter = new Date(appliedFilters.endDate);
              // Check if endDateFilter is valid
              if (isNaN(endDateFilter.getTime())) {
                console.log('Invalid end date filter:', appliedFilters.endDate);
              } else {
                endDateFilter.setHours(23, 59, 59, 999); // End of day
                if (taskDate > endDateFilter) {
                  matchesDateRange = false;
                  console.log('Task date is after end date filter:', {
                    taskDate,
                    endDateFilter
                  });
                }
              }
            }
          }
        }
      } else {
        // No date filters applied, so all tasks should match
        matchesDateRange = true;
        console.log('No date filters applied, task passes date filter');
      }
      
      // Log filter results for debugging - but only in development
      if (process.env.NODE_ENV === 'development') {
        const result = matchesSearch && matchesStatus && matchesUser && matchesDateRange;
        if (!result) {
          console.log('Task filtered out:', {
            task: task.description,
            taskDate: task.date,
            taskUser: task.userName,
            currentUser: user?.username,
            userRole: user?.role,
            matchesSearch,
            matchesStatus,
            matchesUser,
            matchesDateRange,
            appliedFilters
          });
        }
      }
      
      const finalResult = matchesSearch && matchesStatus && matchesUser && matchesDateRange;
      console.log('Task filtering result:', {
        taskId: task.id,
        taskDescription: task.description,
        finalResult,
        matchesSearch,
        matchesStatus,
        matchesUser,
        matchesDateRange
      });
      
      return finalResult;
    });
  }, [tasks, user, appliedFilters]);

  // Add a useEffect to monitor when filteredTasks change
  useEffect(() => {
    console.log('Filtered tasks updated:', {
      filteredTasksCount: filteredTasks.length,
      firstFewFilteredTasks: filteredTasks.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName
      }))
    });
  }, [filteredTasks]);

  // Listen for real-time notifications
  useEffect(() => {
    // Only set up notifications if user is available
    if (!user) {
      console.log('Notification useEffect: User not available yet');
      return;
    }
    
    console.log('Setting up notifications for user:', user.username);
    
    const handleTaskCreated = (data) => {
      console.log('Task created notification received:', data);
      showSnackbar('New task created: ' + data.task.description, 'info');
      fetchTasks(); // Refresh data
    };

    const handleTaskUpdated = (data) => {
      console.log('Task updated notification received:', data);
      if (data.deleted) {
        showSnackbar('Task deleted: ' + data.description, 'warning');
      } else {
        showSnackbar('Task updated: ' + data.task.description, 'info');
      }
      fetchTasks(); // Refresh data
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up notifications');
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
    };
  }, [user, fetchTasks]); // Add fetchTasks to dependencies

    // Additional debug for user role
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    // Additional check to ensure we're handling user roles correctly
    if (user) {
      console.log('User authentication status:', {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        isAuthenticated: !!user.id
      });
      
      // Check if this is the first time we're seeing this user
      if (!user.id) {
        console.warn('User object exists but ID is missing - this might indicate an auth issue');
      }
    }
  }, [user]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

  // Fetch dropdown values on component mount
  const fetchDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dropdown values...');
      // Fetch all dropdown values in parallel
      const fetchPromises = [
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Office')
      ];
      
      const responses = await Promise.all(fetchPromises);
    
      console.log('All responses:', responses);
    
      // Extract responses
      const [sourcesRes, categoriesRes, officesRes] = responses;
    
      console.log('Sources response:', sourcesRes);
      console.log('Categories response:', categoriesRes);
      console.log('Offices response:', officesRes);
    
      setSources(sourcesRes?.data || []);
      setCategories(categoriesRes?.data || []);
      setOffices(officesRes?.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      console.error('Error response:', error.response);
      showSnackbar('Failed to load dropdown values. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchServicesForCategory = async (categoryValue, isEdit = false) => {
    try {
      const response = await dropdownAPI.getDropdownValues('Service', categoryValue);
      if (isEdit) {
        setEditSelectedService(response.data);
      } else {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Log audit entry
      // Removed auditLog call that was causing issues
      
      setSuccess('Task deleted successfully!');
      showSnackbar('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task';
      setError('Failed to delete task: ' + errorMessage);
      showSnackbar('Failed to delete task: ' + errorMessage, 'error');
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };
  
  // Handle edit file selection
  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setEditFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };
  
  // Remove file from create form
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Remove file from edit form
  const removeEditFile = (index) => {
    setEditFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!date || !description) {
      setError('Date and description are required');
      showSnackbar('Date and description are required', 'error');
      return;
    }
    
    try {
      // Prepare task data
      const taskData = {
        date,
        source: selectedSource?.value || '',
        category: selectedCategory?.value || '',
        service: selectedService?.value || '',
        office: selectedOffice?.value || user?.office || '', // Use selected office or user's office
        userInformation, // Add user information
        description,
        status,
        userId: user?.id, // Automatically add user ID
        userName: user?.fullName || user?.username // Automatically add user name
      };
    
      console.log('Creating task with data:', taskData);
    
      // For now, we'll store file names in the files array
      // In a real implementation, you would upload files to a storage service
      const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
    
      taskData.files = fileData;
    
      const response = await taskAPI.createTask(taskData);
    
      console.log('Task creation response:', response);
    
      // Add new task to list
      const newTask = {
        id: response.data.id,
        ...taskData,
        userId: user?.id,
        userName: user?.fullName || user?.username
      };
      setTasks([...tasks, newTask]);
    
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedService(null);
      setSelectedOffice(null); // Reset selected office
      setUserInformation(''); // Reset user information
      setDescription('');
      setStatus('Pending');
      setFiles([]); // Reset files
      
      setOpenCreateDialog(false);
      setSuccess('Task created successfully!');
      showSnackbar('Task created successfully!', 'success');
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to create task';
      setError('Failed to create task: ' + errorMessage);
      showSnackbar('Failed to create task: ' + errorMessage, 'error');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditDate(task.date || '');
    setEditSelectedSource(sources.find(s => s.value === task.source) || null);
    setEditSelectedCategory(categories.find(c => c.value === task.category) || null);
    setEditSelectedService(services.find(s => s.value === task.service) || null);
    setEditSelectedOffice(offices.find(o => o.value === task.office) || null); // Set edit selected office
    setEditUserInformation(task.userInformation || ''); // Set edit user information
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    setEditFiles(task.files || []); // Set existing files
    // Removed editAssignedTo assignment
    // Removed editFlag assignment
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    try {
      const taskData = {
        date: editDate,
        source: editSelectedSource?.value || '',
        category: editSelectedCategory?.value || '',
        service: editSelectedService?.value || '',
        office: editSelectedOffice?.value || user?.office || '', // Use selected office or user's office
        userInformation: editUserInformation, // Add user information
        description: editDescription,
        status: editStatus,
        userId: user?.id, // Automatically add user ID
        userName: user?.fullName || user?.username // Automatically add user name
      };
    
      // For now, we'll store file names in the files array
      // In a real implementation, you would upload files to a storage service
      const fileData = editFiles.map(file => 
        typeof file === 'string' ? file : {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      );
    
      taskData.files = fileData;
    
      const response = await taskAPI.updateTask(editingTask.id, taskData);
    
      // Update task in list
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...response.data } : task
      ));
    
      setOpenEditDialog(false);
      setEditingTask(null);
      setSuccess('Task updated successfully!');
      showSnackbar('Task updated successfully!', 'success');
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to update task';
      setError('Failed to update task: ' + errorMessage);
      showSnackbar('Failed to update task: ' + errorMessage, 'error');
    }
  };
  
  // Add additional logging to help debug agent task visibility
  if (process.env.NODE_ENV === 'development') {
    console.log('Task filtering debug info:', {
      userRole: user?.role,
      currentUser: user?.username,
      currentUserFullName: user?.fullName,
      totalTasks: tasks.length,
      filteredTasksCount: filteredTasks.length,
      appliedFilters,
      tasksSample: tasks.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName
      })),
      filteredTasksSample: filteredTasks.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName
      }))
    });
  }
  
  // Add a check to ensure we're not filtering out all tasks incorrectly - but only in development
  if (process.env.NODE_ENV === 'development' && tasks.length > 0 && filteredTasks.length === 0 && user && user.role !== 'SystemAdmin') {
    console.warn('Warning: All tasks filtered out for non-SystemAdmin user. This might indicate a filtering issue.');
    console.log('Debug info:', {
      user: user.username,
      userFullName: user.fullName,
      totalTasks: tasks.length,
      tasksUsernames: [...new Set(tasks.map(t => t.userName))],
      currentUserIdentifier: user.fullName || user.username,
      appliedFilters
    });
    
    // Additional check for agents with no tasks
    if (user.role === 'Agent') {
      console.log('Agent has no visible tasks. Checking if this is due to filtering or actual lack of tasks.');
      
      // Check if there are tasks that belong to this user but are being filtered out
      const currentUserIdentifier = user.fullName || user.username;
      const userTasks = tasks.filter(task => task.userName === currentUserIdentifier);
      
      if (userTasks.length > 0) {
        console.log('Agent has tasks but they are being filtered out. Current filters:', appliedFilters);
        
        // Check each filter individually
        console.log('Checking individual filters:');
        tasks.forEach(task => {
          if (task.userName === currentUserIdentifier) {
            console.log('Task that should be visible:', {
              id: task.id,
              description: task.description,
              userName: task.userName,
              date: task.date,
              status: task.status
            });
          }
        });
      } else {
        console.log('Agent truly has no tasks assigned.');
      }
    }
  }

  // Get task statistics based on filtered tasks
  const getTaskStats = () => {
    const stats = {
      total: filteredTasks.length,
      pending: filteredTasks.filter(t => t.status === 'Pending').length,
      inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
      completed: filteredTasks.filter(t => t.status === 'Completed').length
    };
    return stats;
  };

  const taskStats = getTaskStats();

  // Handle View Details for task statistics
  const handleViewDetails = (filterType) => {
    // Set the active tab to "All Tasks" (tab 0)
    setActiveTab(0);
    
    // Apply the appropriate filter
    switch (filterType) {
      case 'pending':
        setStatusFilter('Pending');
        setAppliedFilters(prev => ({...prev, statusFilter: 'Pending'}));
        break;
      case 'inProgress':
        setStatusFilter('In Progress');
        setAppliedFilters(prev => ({...prev, statusFilter: 'In Progress'}));
        break;
      case 'completed':
        setStatusFilter('Completed');
        setAppliedFilters(prev => ({...prev, statusFilter: 'Completed'}));
        break;
      default:
        // For total tasks, clear filters to show all
        setStatusFilter('');
        setSearchTerm('');
        setSelectedUser(null);
        setStartDate('');
        setEndDate('');
        setAppliedFilters({
          searchTerm: '',
          statusFilter: '',
          userFilter: '',
          startDate: '',
          endDate: ''
        });
        break;
    }
    
    // Scroll to the task list
    setTimeout(() => {
      const taskListElement = document.getElementById('task-list');
      if (taskListElement) {
        taskListElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExport = async (format) => {
    try {
      // Show loading state
      showSnackbar('Exporting as ' + format.toUpperCase() + '...', 'info');
      
      // Prepare data for export
      const exportData = {
        tasks: filteredTasks,
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown'
      };
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'CSV') {
        // Convert to CSV format
        const csvContent = convertTasksToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.csv';
      } else if (format === 'PDF') {
        // For PDF, we'll create a simple text representation
        const pdfContent = convertTasksToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.pdf';
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.json';
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSnackbar('Exported as ' + format.toUpperCase() + ' successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export as ' + format.toUpperCase(), 'error');
    }
  };

  // Helper function to convert tasks to CSV
  const convertTasksToCSV = (data) => {
    let csv = 'Tasks Export\n';
    csv += 'Generated: ' + new Date(data.generatedAt).toLocaleString() + '\n';
    csv += 'User: ' + data.user + '\n\n';
    
    // Tasks section
    csv += 'Date,Source,Category,Service,User Info,Description,User,Status,Files\n';
    
    data.tasks.forEach(task => {
      const filesCount = task.files ? task.files.length : 0;
      csv += '"' + (task.date || '') + '","' + (task.source || '') + '","' + (task.category || '') + '","' + (task.service || '') + '","' + (task.userInformation || '') + '","' + (task.description || '') + '","' + (task.userName || '') + '","' + (task.status || '') + '","' + filesCount + '"\n';
    });
    
    return csv;
  };

  // Helper function to convert tasks to PDF-like text
  const convertTasksToPDF = (data) => {
    let pdf = 'Tasks Export Report\n';
    pdf += '==================================================\n';
    pdf += 'Generated: ' + new Date(data.generatedAt).toLocaleString() + '\n';
    pdf += 'User: ' + data.user + '\n\n';
    
    // Tasks section
    if (data.tasks.length === 0) {
      pdf += 'No tasks found.\n\n';
    } else {
      data.tasks.forEach((task, index) => {
        pdf += (index + 1) + '. ' + (task.description || 'No description') + '\n';
        pdf += '   Date: ' + (task.date || 'N/A') + '\n';
        pdf += '   Category: ' + (task.category || 'N/A') + '\n';
        pdf += '   Service: ' + (task.service || 'N/A') + '\n';
        pdf += '   User Info: ' + (task.userInformation || 'N/A') + '\n';
        pdf += '   Status: ' + (task.status || 'N/A') + '\n';
        pdf += '   User: ' + (task.userName || 'N/A') + '\n';
        pdf += '   Files: ' + (task.files ? task.files.length : 0) + '\n\n';
      });
    }
    
    return pdf;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {!user ? (
        // Show loading state while user context is loading
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading user context...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Task Modification & Activity
          </Typography>
          
          {/* Task Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" component="div">
                      {taskStats.total}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Total Tasks
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails('total')}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <HourglassEmptyIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <Typography variant="h5" component="div">
                      {taskStats.pending}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails('pending')}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <HourglassEmptyIcon sx={{ mr: 2, color: 'info.main' }} />
                    <Typography variant="h5" component="div">
                      {taskStats.inProgress}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    In Progress
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails('inProgress')}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Typography variant="h5" component="div">
                      {taskStats.completed}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails('completed')}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          {/* Task Tabs */}
          <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minHeight: 48
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)'
                }
              }}
            >
              <Tab label="All Tasks" icon={<AssignmentIcon />} />
              <Tab label="Create Task" icon={<AddIcon />} />
            </Tabs>
          </Paper>
          
          {/* All Tasks Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Task Filters - Redesigned for all user roles - REMOVED USER FILTER FOR ALL ROLES */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Task Filters
                </Typography>
                <Grid container spacing={3}>
                  {/* Search Field - Full width on mobile, responsive on larger screens */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Search Tasks"
                      placeholder="Search by description, category, service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        endAdornment: <SearchIcon color="action" />
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  
                  {/* Status Filter - Full width on mobile, responsive on larger screens */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Status</InputLabel>
                      <Select 
                        label="Status" 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value=""><em>All Statuses</em></MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Start Date Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  
                  {/* End Date Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  
                  {/* Action Buttons - Responsive layout */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      gap: 2,
                      mt: 1
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2 
                      }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<FilterIcon />}
                          onClick={applyFilters}
                          sx={{ minWidth: 140, py: 1 }}
                        >
                          Apply Filters
                        </Button>
                        <Button 
                          variant="outlined"
                          onClick={clearFilters}
                          sx={{ minWidth: 140, py: 1 }}
                        >
                          Clear All
                        </Button>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2 
                      }}>
                        <Button 
                          variant="outlined" 
                          startIcon={<DownloadIcon />} 
                          onClick={() => handleExport('CSV')}
                          sx={{ minWidth: 140, py: 1 }}
                        >
                          Export CSV
                        </Button>
                        <Button 
                          variant="outlined" 
                          startIcon={<DownloadIcon />} 
                          onClick={() => handleExport('PDF')}
                          sx={{ minWidth: 140, py: 1 }}
                        >
                          Export PDF
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Task List */}
              {dataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} id="task-list" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>User Info</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Files</TableCell>
                        {/* Removed Flag column */}
                        {/* Removed Assigned To column */}
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow 
                          key={task.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{task.source || 'N/A'}</TableCell>
                          <TableCell>{task.category || 'N/A'}</TableCell>
                          <TableCell>{task.service || 'N/A'}</TableCell>
                          <TableCell>{task.description || 'N/A'}</TableCell>
                          <TableCell>{task.userName || 'N/A'}</TableCell>
                          <TableCell>{task.userInformation || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status || 'Pending'}
                              size="small"
                              sx={{
                                backgroundColor: 
                                  task.status === 'Pending' ? 'warning.light' :
                                  task.status === 'In Progress' ? 'info.light' :
                                  task.status === 'Completed' ? 'success.light' :
                                  task.status === 'Cancelled' ? 'error.light' : 'default.light',
                                color: 
                                  task.status === 'Pending' ? 'warning.dark' :
                                  task.status === 'In Progress' ? 'info.dark' :
                                  task.status === 'Completed' ? 'success.dark' :
                                  task.status === 'Cancelled' ? 'error.dark' : 'default.dark',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {task.files && task.files.length > 0 ? (
                              <Tooltip title={task.files.length + ' file(s)'}>
                                <Chip 
                                  icon={<DescriptionIcon />} 
                                  label={task.files.length} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              </Tooltip>
                            ) : (
                              <Chip label="No Files" size="small" variant="outlined" />
                            )}
                          </TableCell>
                          {/* Removed Flag cell with dropdown */}
                          {/* Removed Assigned To cell */}
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditTask(task)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          
          {/* Create Task Tab */}
          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create New Task
              </Typography>
              <Grid container spacing={2} component="form" onSubmit={handleSubmitTask}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={sources}
                      getOptionLabel={(option) => option.value}
                      value={selectedSource}
                      onChange={(event, newValue) => setSelectedSource(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Source" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={categories}
                      getOptionLabel={(option) => option.value}
                      value={selectedCategory}
                      onChange={(event, newValue) => setSelectedCategory(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Category" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={services}
                      getOptionLabel={(option) => option.value}
                      value={selectedService}
                      onChange={(event, newValue) => setSelectedService(newValue)}
                      disabled={!selectedCategory}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Service" 
                          fullWidth 
                          disabled={!selectedCategory}
                        />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={offices}
                      getOptionLabel={(option) => option.value}
                      value={selectedOffice}
                      onChange={(event, newValue) => setSelectedOffice(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Office" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                {/* User Information Text Field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User Information"
                    value={userInformation}
                    onChange={(e) => setUserInformation(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status" 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Remove Flag Dropdown */}
                {/* 
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Flag</InputLabel>
                    <Select 
                      label="Flag" 
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                    >
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                */}
                
                {/* File Upload Field */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload Files
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      multiple
                    />
                  </Button>
                  
                  {/* Display selected files */}
                  {files.length > 0 && (
                    <Paper sx={{ mt: 2, p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Files:
                      </Typography>
                      <List dense>
                        {files.map((file, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={file.name}
                              secondary={(file.size / 1024).toFixed(2) + ' KB - ' + file.type}
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => removeFile(index)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    type="submit"
                    sx={{ mr: 2 }}
                  >
                    Create Task
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => setActiveTab(0)}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Create Task Dialog */}
          <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
              {/* Dialog content would go here if needed */}
            </DialogContent>
            <DialogActions>
              {/* Dialog actions would go here if needed */}
            </DialogActions>
          </Dialog>
          
          {/* Edit Task Dialog */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={sources}
                      getOptionLabel={(option) => option.value}
                      value={editSelectedSource}
                      onChange={(event, newValue) => setEditSelectedSource(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Source" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={categories}
                      getOptionLabel={(option) => option.value}
                      value={editSelectedCategory}
                      onChange={(event, newValue) => setEditSelectedCategory(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Category" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={services}
                      getOptionLabel={(option) => option.value}
                      value={editSelectedService}
                      onChange={(event, newValue) => setEditSelectedService(newValue)}
                      disabled={!editSelectedCategory}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Service" 
                          fullWidth 
                          disabled={!editSelectedCategory}
                        />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={offices}
                      getOptionLabel={(option) => option.value}
                      value={editSelectedOffice}
                      onChange={(event, newValue) => setEditSelectedOffice(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Office" fullWidth />
                      )}
                    />
                  )}
                </Grid>
                
                {/* Add User Information field in Edit form */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User Information"
                    value={editUserInformation}
                    onChange={(e) => setEditUserInformation(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status" 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* File Upload Field for Edit */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Add More Files
                    <input
                      type="file"
                      hidden
                      onChange={handleEditFileChange}
                      multiple
                    />
                  </Button>
                  
                  {/* Display existing and selected files */}
                  {(editFiles.length > 0 || files.length > 0) && (
                    <Paper sx={{ mt: 2, p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Files:
                      </Typography>
                      <List dense>
                        {editFiles.map((file, index) => (
                          <ListItem key={'edit-' + index}>
                            <ListItemText
                              primary={typeof file === 'string' ? file : file.name}
                              secondary={typeof file === 'string' ? 'Existing file' : (file.size / 1024).toFixed(2) + ' KB - ' + file.type}
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => removeEditFile(index)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateTask} variant="contained" color="primary">
                Update Task
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Messages */}
          {dataLoading && (
            <Typography>Loading tasks...</Typography>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {/* Snackbar for notifications */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default TaskManagement;
