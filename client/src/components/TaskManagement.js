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
  TableFooter,
  TablePagination,
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
import usePagination from '../hooks/usePagination';
import UserFilterDropdown from './UserFilterDropdown';
import FilterSection from './FilterSection';

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
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [offices, setOffices] = useState([]); // Add offices state
  const [selectedOffice, setSelectedOffice] = useState(null); // Add selected office state
  const [userInformation, setUserInformation] = useState(''); // Add user information state
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [files, setFiles] = useState([]); // File upload state
  // Add obligation state
  const [obligations, setObligations] = useState([]);
  const [selectedObligation, setSelectedObligation] = useState(null);
  // Removed assignedTo state as requested
  // Removed flag state as requested
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSelectedSource, setEditSelectedSource] = useState(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState(null);
  const [editSelectedSubCategory, setEditSelectedSubCategory] = useState(null);
  const [editSelectedIncident, setEditSelectedIncident] = useState(null);
  const [editSelectedOffice, setEditSelectedOffice] = useState(null); // Add edit selected office state
  const [editUserInformation, setEditUserInformation] = useState(''); // Add edit user information state
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editFiles, setEditFiles] = useState([]); // Edit file upload state
  // Add edit obligation state
  const [editSelectedObligation, setEditSelectedObligation] = useState(null);
  // Removed editAssignedTo state as requested
  // Removed editFlag state as requested
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState(''); // Add start date filter
  const [endDate, setEndDate] = useState(''); // Add end date filter
  
  // Add state for filtered tasks
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Pagination hooks
  const { paginatedData: paginatedTasks, currentPage: tasksCurrentPage, totalPages: tasksTotalPages, rowsPerPage: tasksRowsPerPage, handleChangePage: handleTasksPageChange, handleChangeRowsPerPage: handleTasksRowsPerPageChange } = usePagination(filteredTasks, 100);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Use the new user filter hook
  const { users, loading: userLoading, error: userError, fetchUsers } = useUserFilter(user);

  // State for applied filters - Initialize with default values that don't filter out agent tasks
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    statusFilter: '',
    userFilter: '', // This should always be empty for non-SystemAdmin users
    startDate: '',
    endDate: '',
    sourceFilter: '',
    categoryFilter: '',
    subCategoryFilter: '',
    incidentFilter: '',
    officeFilter: '',
    userInformationFilter: '',
    obligationFilter: ''
  });

  // Fetch dropdown values on component mount
  const fetchDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dropdown values...');
      
      // Fetch all dropdown values individually to better handle errors
      const sourcesPromise = dropdownAPI.getDropdownValues('Source').catch(error => {
        console.error('Error fetching sources:', error);
        return { data: [], error };
      });
      
      const categoriesPromise = dropdownAPI.getDropdownValues('Category').catch(error => {
        console.error('Error fetching categories:', error);
        return { data: [], error };
      });
      
      const officesPromise = dropdownAPI.getDropdownValues('Office').catch(error => {
        console.error('Error fetching offices:', error);
        return { data: [], error };
      });
      
      const obligationsPromise = dropdownAPI.getDropdownValues('Obligation').catch(error => {
        console.error('Error fetching obligations:', error);
        return { data: [], error };
      });
      
      // Wait for all promises
      const [sourcesRes, categoriesRes, officesRes, obligationsRes] = await Promise.all([
        sourcesPromise,
        categoriesPromise,
        officesPromise,
        obligationsPromise
      ]);
    
      console.log('Sources response:', sourcesRes);
      console.log('Categories response:', categoriesRes);
      console.log('Offices response:', officesRes);
      console.log('Obligations response:', obligationsRes);
      console.log('Obligations data:', obligationsRes?.data);
    
      // Check if any responses have errors
      if (sourcesRes?.error) {
        console.error('Error fetching sources:', sourcesRes.error);
      }
      if (categoriesRes?.error) {
        console.error('Error fetching categories:', categoriesRes.error);
      }
      if (officesRes?.error) {
        console.error('Error fetching offices:', officesRes.error);
      }
      if (obligationsRes?.error) {
        console.error('Error fetching obligations:', obligationsRes.error);
      }
    
      setSources(sourcesRes?.data || []);
      setCategories(categoriesRes?.data || []);
      setOffices(officesRes?.data || []);
      setObligations(obligationsRes?.data || []); // Set obligations
      console.log('Obligations state set to:', obligationsRes?.data || []);
      
      // Additional debugging to check obligation data structure
      if (obligationsRes?.data) {
        console.log('Obligation data structure:', obligationsRes.data.map(o => ({
          id: o.id,
          value: o.value,
          type: o.type,
          isActive: o.isActive
        })));
      }
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      showSnackbar('Failed to load dropdown values. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // Apply filters when Apply button is clicked
  const applyFilters = () => {
    const newAppliedFilters = {
      searchTerm,
      statusFilter,
      userFilter: '', // No user filter for tasks page
      startDate,
      endDate,
      sourceFilter: selectedSource?.value || '',
      categoryFilter: selectedCategory?.value || '',
      subCategoryFilter: selectedSubCategory?.value || '',
      incidentFilter: selectedIncident?.value || '',
      officeFilter: selectedOffice?.value || '',
      userInformationFilter: userInformation || '',
      obligationFilter: selectedObligation?.value || ''
    };
    
    console.log('Applying filters:', newAppliedFilters);
    
    setAppliedFilters(newAppliedFilters);
    showSnackbar('Filters applied', 'info');
  };





  // Check if any filters are active
  const hasActiveFilters = Boolean(searchTerm || statusFilter || userFilter || startDate || endDate);
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setUserFilter('');
    setStartDate('');
    setEndDate('');
    setSelectedUser(null);
    // Reset applied filters to default values
    setAppliedFilters({
      searchTerm: '',
      statusFilter: '',
      userFilter: '',
      startDate: '',
      endDate: '',
      sourceFilter: '',
      categoryFilter: '',
      subCategoryFilter: '',
      incidentFilter: '',
      officeFilter: '',
      userInformationFilter: '',
      obligationFilter: ''
    });
  };
  
  // Add a function to reset to default view (show all user's tasks)

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
      endDate: '',
      sourceFilter: '',
      categoryFilter: '',
      subCategoryFilter: '',
      incidentFilter: '',
      officeFilter: '',
      userInformationFilter: '',
      obligationFilter: ''
    });
    showSnackbar('View reset to default', 'info');
  };

  // Add a useEffect to ensure proper initialization
  useEffect(() => {
    console.log('TaskManagement component initialized');
    // Ensure we start with a clean state
    resetToDefaultView();
  }, []);

  // Filter sub-categories when category changes (for create form)
  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategoriesForCategory(selectedCategory.value);
    } else {
      setSubCategories([]);
      setSelectedSubCategory(null);
      // Also clear incidents when sub-category is cleared
      setIncidents([]);
      setSelectedIncident(null);
    }
  }, [selectedCategory]);
  
  // Filter incidents when sub-category changes (for create form)
  useEffect(() => {
    if (selectedSubCategory) {
      fetchIncidentsForSubCategory(selectedSubCategory.value);
    } else {
      setIncidents([]);
      setSelectedIncident(null);
    }
  }, [selectedSubCategory]);

  // Filter sub-categories when category changes (for edit form)
  useEffect(() => {
    if (editSelectedCategory) {
      fetchSubCategoriesForCategory(editSelectedCategory.value, true);
    } else {
      setSubCategories([]);
      setEditSelectedSubCategory(null);
      // Also clear incidents when sub-category is cleared
      setIncidents([]);
      setEditSelectedIncident(null);
    }
  }, [editSelectedCategory]);
  
  // Filter incidents when sub-category changes (for edit form)
  useEffect(() => {
    if (editSelectedSubCategory) {
      fetchIncidentsForSubCategory(editSelectedSubCategory.value, true);
    } else {
      setIncidents([]);
      setEditSelectedIncident(null);
    }
  }, [editSelectedSubCategory]);

  const fetchTasks = useCallback(async () => {
    // Don't fetch tasks if user is not available yet
    if (!user) {
      console.log('User not available yet, skipping task fetch');
      return;
    }
    
    setDataLoading(true);
    try {
      console.log('Fetching tasks for user:', user);
      // Fetch all tasks with pagination parameters to get unlimited data
      const response = await taskAPI.getAllTasks({ page: 1, limit: -1 });
      console.log('Tasks response:', response);
      
      // Handle both paginated and non-paginated response formats
      let tasksData;
      if (response.data && response.data.tasks !== undefined) {
        // Paginated response format
        tasksData = response.data.tasks || [];
      } else {
        // Non-paginated response format
        tasksData = Array.isArray(response.data) ? response.data : 
                         response.data?.data || response.data || [];
      }
      
      console.log('Raw tasks data:', tasksData);
      console.log('User info for filtering:', {
        role: user.role,
        username: user.username,
        fullName: user.fullName,
        office: user.office
      });
      
      // On the Task Logger page, SystemAdmin and Admin roles should see all tasks
      // Other roles (Supervisor, Agent) should only see their own tasks
      const isAdminOrSystemAdmin = ['SystemAdmin', 'Admin'].includes(user.role);
      
      if (!isAdminOrSystemAdmin) {
        // For non-Admin/SystemAdmin users, only show their own tasks
        tasksData = tasksData.filter(task => {
          // Match either by userId or userName to be comprehensive
          return task.userId === user.id || task.userName === user.username;
        });
      }
      // For Admin/SystemAdmin users, keep all tasks (no filtering needed)
      
      console.log('Filtered tasks for current user:', tasksData);
      console.log('Task filtering debug - user role:', user.role);
      
      // Log the tasks for debugging
      console.log('Received tasks:', tasksData.map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName,
        office: t.office
      })));
      
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

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

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
      autoRefreshService.subscribe('TaskManagement', 'tasks', fetchTasks, 300000);
      
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
      userRole: user?.role,
      userOffice: user?.office,
      firstFewTasks: tasks.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName,
        office: t.office
      }))
    });
  }, [tasks, user]);

  // Update filteredTasks when tasks or appliedFilters change
  useEffect(() => {
    const filtered = tasks.filter(task => {
      // Log the task and user info for debugging
      console.log('Filtering task:', {
        taskId: task.id,
        taskDescription: task.description,
        taskUser: task.userName,
        currentUser: user?.username,
        currentUserFullName: user?.fullName,
        userRole: user?.role
      });
      
      // Apply search filter
      const matchesSearch = !appliedFilters.searchTerm || 
        (task.description && task.description.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.subCategory && task.subCategory.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) ||
        (task.userName && task.userName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = !appliedFilters.statusFilter || task.status === appliedFilters.statusFilter;
      
      // Apply user filter - on Task Logger page, non-Admin/SystemAdmin users only see their own tasks
      const isAdminOrSystemAdmin = ['SystemAdmin', 'Admin'].includes(user?.role);
      const matchesUser = isAdminOrSystemAdmin || task.userId === user?.id || task.userName === user?.username;
      
      // Debug logging for user matching
      console.log('User filter check:', {
        taskId: task.id,
        taskUserId: task.userId,
        taskUserName: task.userName,
        currentUserId: user?.id,
        currentUserName: user?.username,
        matchesUser
      });
      
      // Apply source filter
      const matchesSource = !appliedFilters.sourceFilter || task.source === appliedFilters.sourceFilter;
      
      // Apply category filter
      const matchesCategory = !appliedFilters.categoryFilter || task.category === appliedFilters.categoryFilter;
      
      // Apply sub-category filter
      const matchesSubCategory = !appliedFilters.subCategoryFilter || task.subCategory === appliedFilters.subCategoryFilter;
      
      // Apply incident filter
      const matchesIncident = !appliedFilters.incidentFilter || task.incident === appliedFilters.incidentFilter;
      
      // Apply office filter
      const matchesOffice = !appliedFilters.officeFilter || task.office === appliedFilters.officeFilter;
      
      // Apply user information filter
      const matchesUserInformation = !appliedFilters.userInformationFilter || 
        (task.userInformation && task.userInformation.toLowerCase().includes(appliedFilters.userInformationFilter.toLowerCase()));
      
      // Apply obligation filter
      const matchesObligation = !appliedFilters.obligationFilter || task.obligation === appliedFilters.obligationFilter;
      
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
        const result = matchesSearch && matchesStatus && matchesDateRange;
        if (!result) {
          console.log('Task filtered out:', {
            task: task.description,
            taskDate: task.date,
            taskUser: task.userName,
            currentUser: user?.username,
            userRole: user?.role,
            matchesSearch,
            matchesStatus,
            matchesDateRange,
            appliedFilters
          });
        }
      }
      
      const finalResult = matchesSearch && matchesStatus && matchesUser && matchesDateRange && matchesSource && matchesCategory && matchesSubCategory && matchesIncident && matchesOffice && matchesUserInformation && matchesObligation;
      console.log('Task filtering result:', {
        taskId: task.id,
        taskDescription: task.description,
        finalResult,
        matchesSearch,
        matchesStatus,
        matchesDateRange
      });
      
      return finalResult;
    });
    
    setFilteredTasks(filtered);
    console.log('Filtered tasks updated:', {
      filteredTasksCount: filtered.length,
      firstFewFilteredTasks: filtered.slice(0, 3).map(t => ({
        id: t.id,
        description: t.description,
        userName: t.userName
      }))
    });
  }, [tasks, user, appliedFilters.searchTerm, appliedFilters.statusFilter, appliedFilters.userFilter, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.sourceFilter, appliedFilters.categoryFilter, appliedFilters.subCategoryFilter, appliedFilters.incidentFilter, appliedFilters.officeFilter, appliedFilters.userInformationFilter, appliedFilters.obligationFilter]);

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

  // Handle file change for create form
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  // Remove file from create form
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Handle file change for edit form
  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setEditFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  // Remove file from edit form
  const removeEditFile = (index) => {
    setEditFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Fetch sub-categories for a specific category
  const fetchSubCategoriesForCategory = async (categoryValue, isEdit = false) => {
    try {
      const response = await dropdownAPI.getDropdownValues('Sub-Category', categoryValue);
      if (isEdit) {
        setEditSelectedSubCategory(null);
      } else {
        setSelectedSubCategory(null);
      }
      setSubCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      showSnackbar('Failed to load sub-categories', 'error');
      setSubCategories([]);
    }
  };
  
  // Fetch incidents for a specific sub-category
  const fetchIncidentsForSubCategory = async (subCategoryValue, isEdit = false) => {
    try {
      const response = await dropdownAPI.getDropdownValues('Incident', subCategoryValue);
      if (isEdit) {
        setEditSelectedIncident(null);
      } else {
        setSelectedIncident(null);
      }
      setIncidents(response.data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      showSnackbar('Failed to load incidents', 'error');
      setIncidents([]);
    }
  };

  // Create new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!date || !description.trim()) {
        throw new Error('Date and description are required');
      }

      // Prepare task data
      const taskData = {
        date,
        source: selectedSource?.value || '',
        category: selectedCategory?.value || '',
        subCategory: selectedSubCategory?.value || '', // Renamed from service to sub-category
        incident: selectedIncident?.value || '', // Add incident field
        office: selectedOffice?.value || '',
        userInformation,
        description: description.trim(),
        status,
        obligation: selectedObligation?.value || '', // Add obligation field
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      console.log('Creating task with data:', taskData);

      const response = await taskAPI.createTask(taskData);
      console.log('Task created:', response.data);

      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSelectedIncident(null);
      setSelectedOffice(null);
      setUserInformation('');
      setDescription('');
      setStatus('Pending');
      setSelectedObligation(null); // Reset obligation
      setFiles([]);

      // Close dialog and refresh tasks
      setActiveTab(0);
      await fetchTasks();
      showSnackbar('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to create task';
      setError('Failed to create task: ' + errorMessage);
      showSnackbar('Failed to create task: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setEditDate(task.date ? task.date.split('T')[0] : '');
    setEditSelectedSource(sources.find(s => s.value === task.source) || null);
    setEditSelectedCategory(categories.find(c => c.value === task.category) || null);
    setEditSelectedSubCategory(subCategories.find(s => s.value === task.subCategory) || null); // Renamed from service to sub-category
    setEditSelectedIncident(incidents.find(i => i.value === task.incident) || null); // Add incident field
    setEditSelectedOffice(offices.find(o => o.value === task.office) || null);
    setEditUserInformation(task.userInformation || '');
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    setEditSelectedObligation(obligations.find(o => o.value === task.obligation) || null); // Set obligation
    setEditFiles(task.files || []);
    setOpenEditDialog(true);
  };

  // Update task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    setLoading(true);
    setError('');

    try {
      // Prepare update data
      const updateData = {
        date: editDate,
        source: editSelectedSource?.value || '',
        category: editSelectedCategory?.value || '',
        subCategory: editSelectedSubCategory?.value || '', // Renamed from service to sub-category
        incident: editSelectedIncident?.value || '', // Add incident field
        office: editSelectedOffice?.value || '',
        userInformation: editUserInformation,
        description: editDescription.trim(),
        status: editStatus,
        obligation: editSelectedObligation?.value || '', // Add obligation field
        files: editFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      console.log('Updating task with data:', updateData);

      const response = await taskAPI.updateTask(editingTask.id, updateData);
      console.log('Task updated:', response.data);

      // Close dialog and refresh tasks
      setOpenEditDialog(false);
      setEditingTask(null);
      await fetchTasks();
      showSnackbar('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to update task';
      setError('Failed to update task: ' + errorMessage);
      showSnackbar('Failed to update task: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      await taskAPI.deleteTask(taskId);
      await fetchTasks();
      showSnackbar('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task';
      showSnackbar('Failed to delete task: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle status change for a task
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      // Update task status through API
      const response = await taskAPI.updateTask(taskId, { status: newStatus });
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, ...response.data } 
            : task
        )
      );
      
      showSnackbar(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showSnackbar('Failed to update task status: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
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
      setLoading(true);
      showSnackbar(`Exporting data as ${format.toUpperCase()}...`, 'info');
      
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
      
      // Create and download file with UTF-8 encoding
      const blob = new Blob(['\uFEFF' + content], { type: mimeType });
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
    csv += 'Date,Source,Category,Sub-Category,Incident,User Info,Description,User,Status,Files\n';
    
    data.tasks.forEach(task => {
      const filesCount = task.files ? task.files.length : 0;
      csv += '"' + (task.date || '') + '","' + (task.source || '') + '","' + (task.category || '') + '","' + (task.subCategory || '') + '","' + (task.incident || '') + '","' + (task.userInformation || '') + '","' + (task.description || '') + '","' + (task.userName || '') + '","' + (task.status || '') + '","' + filesCount + '"\n';
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
        pdf += '   Sub-Category: ' + (task.subCategory || 'N/A') + '\n';
        pdf += '   Incident: ' + (task.incident || 'N/A') + '\n';
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
            <Box sx={{ mt: 2 }}>
              {/* Modern Expandable Filter Section */}
              <FilterSection
                title="Advanced Task Filters"
                defaultExpanded={false}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearAllFilters}
              >
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Search Tasks"
                    placeholder="Search by description, category, sub-category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: <SearchIcon color="action" />
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
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
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Source</InputLabel>
                    <Select 
                      label="Source" 
                      value={appliedFilters.sourceFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, sourceFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Sources</em></MenuItem>
                      {sources.map(source => (
                        <MenuItem key={source.id} value={source.value}>{source.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Category</InputLabel>
                    <Select 
                      label="Category" 
                      value={appliedFilters.categoryFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, categoryFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Categories</em></MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category.id} value={category.value}>{category.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Sub-Category</InputLabel>
                    <Select 
                      label="Sub-Category" 
                      value={appliedFilters.subCategoryFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, subCategoryFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Sub-Categories</em></MenuItem>
                      {subCategories.map(subCategory => (
                        <MenuItem key={subCategory.id} value={subCategory.value}>{subCategory.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Incident</InputLabel>
                    <Select 
                      label="Incident" 
                      value={appliedFilters.incidentFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, incidentFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Incidents</em></MenuItem>
                      {incidents.map(incident => (
                        <MenuItem key={incident.id} value={incident.value}>{incident.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Office</InputLabel>
                    <Select 
                      label="Office" 
                      value={appliedFilters.officeFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, officeFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Offices</em></MenuItem>
                      {offices.map(office => (
                        <MenuItem key={office.id} value={office.value}>{office.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="User Information"
                    value={appliedFilters.userInformationFilter || ''}
                    onChange={(e) => {
                      setAppliedFilters(prev => ({ ...prev, userInformationFilter: e.target.value }));
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Obligation</InputLabel>
                    <Select 
                      label="Obligation" 
                      value={appliedFilters.obligationFilter || ''}
                      onChange={(e) => {
                        setAppliedFilters(prev => ({ ...prev, obligationFilter: e.target.value }));
                      }}
                    >
                      <MenuItem value=""><em>All Obligations</em></MenuItem>
                      {obligations.map(obligation => (
                        <MenuItem key={obligation.id} value={obligation.value}>{obligation.value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                

                
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
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: { xs: 2, sm: 0 } }}>
                    <Button 
                      variant="contained"
                      onClick={() => {
                        // Apply all filters when Apply button is clicked
                        setAppliedFilters({
                          searchTerm,
                          statusFilter,
                          userFilter: '', // No user filter for tasks page
                          startDate,
                          endDate,
                          sourceFilter: selectedSource?.value || '',
                          categoryFilter: selectedCategory?.value || '',
                          subCategoryFilter: selectedSubCategory?.value || '',
                          incidentFilter: selectedIncident?.value || '',
                          officeFilter: selectedOffice?.value || '',
                          userInformationFilter: userInformation || '',
                          obligationFilter: selectedObligation?.value || ''
                        });
                        showSnackbar('Filters applied', 'info');
                      }}
                      size="small"
                    >
                      Apply
                    </Button>
                    <Button 
                      startIcon={<DownloadIcon />} 
                      onClick={() => handleExport('CSV')}
                      variant="outlined"
                      size="small"
                    >
                      Export CSV
                    </Button>
                    <Button 
                      startIcon={<DownloadIcon />} 
                      onClick={() => handleExport('PDF')}
                      variant="outlined"
                      size="small"
                    >
                      Export PDF
                    </Button>
                  </Box>
                </Grid>
              </FilterSection>
              
              {/* Task List */}
              {dataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <TableContainer component={Paper} id="task-list" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Sub-Category</TableCell>
                          <TableCell>Incident</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>User Information</TableCell>
                          <TableCell>Obligation</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Files</TableCell>
                          {/* Removed Flag column */}
                          {/* Removed Assigned To column */}
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedTasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} align="center">
                              <Typography variant="body1" color="textSecondary">
                                No tasks found matching the current filters
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedTasks.map((task) => (
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
                              <TableCell>{task.subCategory || 'N/A'}</TableCell>
                              <TableCell>{task.incident || 'N/A'}</TableCell>
                              <TableCell>{task.office || 'N/A'}</TableCell>
                              <TableCell>{task.userInformation || 'N/A'}</TableCell>
                              <TableCell>{task.obligation || 'N/A'}</TableCell>
                              <TableCell>{task.description || 'N/A'}</TableCell>
                              <TableCell>{task.userName || 'N/A'}</TableCell>
                              <TableCell>
                                <Select
                                  value={task.status || 'Pending'}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  size="small"
                                  sx={{
                                    minWidth: 120,
                                    '& .MuiSelect-select': {
                                      padding: '4px 8px',
                                      backgroundColor: task.status === 'Completed' ? 'success.light' : 
                                                      task.status === 'In Progress' ? 'info.light' : 
                                                      task.status === 'Cancelled' ? 'error.light' : 'warning.light',
                                      color: task.status === 'Completed' ? 'success.dark' : 
                                             task.status === 'In Progress' ? 'info.dark' : 
                                             task.status === 'Cancelled' ? 'error.dark' : 'warning.dark',
                                      fontWeight: 'bold',
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: task.status === 'Completed' ? 'success.main' : 
                                                     task.status === 'In Progress' ? 'info.main' : 
                                                     task.status === 'Cancelled' ? 'error.main' : 'warning.main',
                                      textTransform: 'uppercase',
                                      fontSize: '0.8rem'
                                    }
                                  }}
                                >
                                  <MenuItem value="Pending">Pending</MenuItem>
                                  <MenuItem value="In Progress">In Progress</MenuItem>
                                  <MenuItem value="Completed">Completed</MenuItem>
                                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                                </Select>
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
                          ))
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            rowsPerPageOptions={[
                              { label: '5', value: 5 },
                              { label: '10', value: 10 },
                              { label: '25', value: 25 },
                              { label: '50', value: 50 },
                              { label: '100', value: 100 },
                              { label: 'All', value: -1 }
                            ]}
                            colSpan={12}
                            count={filteredTasks.length}
                            rowsPerPage={tasksRowsPerPage === -1 ? filteredTasks.length : tasksRowsPerPage}
                            page={tasksCurrentPage}
                            onPageChange={handleTasksPageChange}
                            onRowsPerPageChange={handleTasksRowsPerPageChange}
                            labelRowsPerPage="Rows per page:"
                            labelDisplayedRows={({ from, to, count }) => {
                              if (tasksRowsPerPage === -1) {
                                return `${count} of ${count} entries (All)`;
                              }
                              return `${from}-${to} of ${count} entries`;
                            }}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
          
          {/* Create Task Form - Improved layout with better visibility */}
          {activeTab === 1 && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                Create New Task
              </Typography>
              <Box component="form" onSubmit={handleCreateTask}>
                <Grid container spacing={3}>
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
                        options={subCategories}
                        getOptionLabel={(option) => option.value}
                        value={selectedSubCategory}
                        onChange={(event, newValue) => setSelectedSubCategory(newValue)}
                        disabled={!selectedCategory}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Sub-Category" 
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
                        options={incidents}
                        getOptionLabel={(option) => option.value}
                        value={selectedIncident}
                        onChange={(event, newValue) => setSelectedIncident(newValue)}
                        disabled={!selectedSubCategory}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Incident" 
                            fullWidth 
                            disabled={!selectedSubCategory}
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
                  
                  {/* Obligation Dropdown */}
                  <Grid item xs={12} sm={6}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Autocomplete
                        options={obligations}
                        getOptionLabel={(option) => {
                          // Handle both string and object options
                          if (typeof option === 'string') {
                            return option;
                          }
                          return option?.value || '';
                        }}
                        value={selectedObligation || null}
                        onChange={(event, newValue) => {
                          console.log('Obligation selected:', newValue);
                          setSelectedObligation(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Obligation" fullWidth />
                        )}
                        isOptionEqualToValue={(option, value) => {
                          // Handle comparison for both string and object values
                          if (!option && !value) return true;
                          if (!option || !value) return false;
                          
                          const optionValue = typeof option === 'string' ? option : option?.value;
                          const valueValue = typeof value === 'string' ? value : value?.value;
                          
                          const result = optionValue === valueValue;
                          console.log('Comparing obligation options:', option, value, result);
                          return result;
                        }}
                        noOptionsText="No obligation options available"
                      />
                    )}
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
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
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
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Create Task'}
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setActiveTab(0)}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Box>
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
          
          {/* Edit Task Dialog - Improved layout */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
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
                        options={subCategories}
                        getOptionLabel={(option) => option.value}
                        value={editSelectedSubCategory}
                        onChange={(event, newValue) => setEditSelectedSubCategory(newValue)}
                        disabled={!editSelectedCategory}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Sub-Category" 
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
                        options={incidents}
                        getOptionLabel={(option) => option.value}
                        value={editSelectedIncident}
                        onChange={(event, newValue) => setEditSelectedIncident(newValue)}
                        disabled={!editSelectedSubCategory}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Incident" 
                            fullWidth 
                            disabled={!editSelectedSubCategory}
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
                  
                  {/* Obligation Dropdown */}
                  <Grid item xs={12} sm={6}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Autocomplete
                        options={obligations}
                        getOptionLabel={(option) => {
                          // Handle both string and object options
                          if (typeof option === 'string') {
                            return option;
                          }
                          return option?.value || '';
                        }}
                        value={editSelectedObligation || null}
                        onChange={(event, newValue) => {
                          console.log('Edit Obligation selected:', newValue);
                          setEditSelectedObligation(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Obligation" fullWidth />
                        )}
                        isOptionEqualToValue={(option, value) => {
                          // More robust comparison
                          if (!option && !value) return true;
                          if (!option || !value) return false;
                          
                          const optionValue = typeof option === 'string' ? option : option?.value;
                          const valueValue = typeof value === 'string' ? value : value?.value;
                          
                          return optionValue === valueValue;
                        }}
                        noOptionsText="No obligation options available"
                      />
                    )}
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
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateTask} 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Update Task'}
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