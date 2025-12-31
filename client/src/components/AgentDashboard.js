import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box,
  TextField,
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
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications,
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  VideoCall as VideoCallIcon,
  Link as LinkIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  RadialBarChart,
  RadialBar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { taskAPI, leaveAPI, dropdownAPI, meetingAPI, collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';
import useUserFilter from '../hooks/useUserFilter'; // Add this import
import UserFilterDropdown from './UserFilterDropdown'; // Add this import
import FilterSection from './FilterSection'; // Add this import

const AgentDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [incidentChartType, setIncidentChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]); // Store all leaves for filtering
  const [meetings, setMeetings] = useState([]); // Add meetings state
  const [collaborations, setCollaborations] = useState([]); // Add collaborations state
  const [users, setUsers] = useState([]); // Add users state for filtering
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [userFilter, setUserFilter] = useState(''); // Add user filter state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Check if user has admin privileges (SystemAdmin, Admin, or Supervisor)
  const isAdmin = user && (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor');
  
  // Use the user filter hook
  const { users: filteredUsers, loading: userLoading, error: userError, fetchUsers } = useUserFilter(user);
  
  // View Details dialog state
  const [viewDetailsDialog, setViewDetailsDialog] = useState({ open: false, type: '', data: null });
  
  // Edit task dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editIncident, setEditIncident] = useState('');
  const [editOffice, setEditOffice] = useState(''); // Add office state
  const [editObligation, setEditObligation] = useState(''); // Add obligation state
  const [editUserInformation, setEditUserInformation] = useState(''); // Add user information state
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editFiles, setEditFiles] = useState([]); // Add files state
  
  // Dropdown options for edit dialog
  const [editSources, setEditSources] = useState([]);
  const [editCategories, setEditCategories] = useState([]);
  const [editSubCategories, setEditSubCategories] = useState([]);
  const [editIncidents, setEditIncidents] = useState([]);
  const [editOffices, setEditOffices] = useState([]); // Add offices dropdown options
  const [editObligations, setEditObligations] = useState([]); // Add obligations dropdown options
  
  // SubCategory filtering based on category for edit dialog
  const [filteredEditSubCategories, setFilteredEditSubCategories] = useState([]);
  // Incident filtering based on subCategory for edit dialog
  const [filteredEditIncidents, setFilteredEditIncidents] = useState([]);

  // Fetch tasks and leaves - useCallback to prevent recreation on every render
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch all data in parallel
      const [tasksResponse, leavesResponse, meetingsResponse, collaborationsResponse] = await Promise.all([
        taskAPI.getAllTasks(),
        leaveAPI.getAllLeaves(),
        meetingAPI.getAllMeetings(),
        collaborationAPI.getAllCollaborations()
      ]);
      
      // Filter tasks based on user role
      let tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : 
                       tasksResponse.data?.data || tasksResponse.data || [];
      
      // If user is admin, show all tasks initially, but apply user filter if set
      if (isAdmin) {
        // For admin users, we still want to show all tasks initially
        // The user filter will be applied in the finalFilteredTasks calculation
      } else {
        // For non-admin users, show only their own tasks
        tasksData = tasksData.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
      }
      
      setTasks(tasksData);
      
      // Filter leaves based on user role
      let leavesData = Array.isArray(leavesResponse.data) ? leavesResponse.data : 
                        leavesResponse.data?.data || leavesResponse.data || [];
      
      // If user is admin, show all leaves initially, but apply user filter if set
      if (isAdmin) {
        // For admin users, we still want to show all leaves initially
        // The user filter will be applied in the finalFilteredLeaves calculation
      } else {
        // For non-admin users, show only their own leaves
        leavesData = leavesData.filter(leave => 
          leave.userId === user.id || leave.userName === user.username
        );
      }
      
      setLeaves(leavesData);
      
      // Filter meetings based on user role
      let meetingsData = Array.isArray(meetingsResponse.data) ? meetingsResponse.data : 
                         meetingsResponse.data?.data || meetingsResponse.data || [];
      
      // Filter meetings for the current user
      if (isAdmin) {
        // Admins see all meetings
      } else {
        // Regular users see meetings they're invited to or created
        meetingsData = meetingsData.filter(meeting => 
          meeting.createdBy === user.id || 
          (meeting.selectedUserIds && meeting.selectedUserIds.includes(user.id)) ||
          (meeting.selectedUsers && meeting.selectedUsers.some(u => u.id === user.id))
        );
      }
      
      setMeetings(meetingsData);
      
      // Filter collaborations based on user role
      let collaborationsData = Array.isArray(collaborationsResponse.data) ? collaborationsResponse.data : 
                               collaborationsResponse.data?.data || collaborationsResponse.data || [];
      
      // Filter collaborations for the current user
      if (isAdmin) {
        // Admins see all collaborations
      } else {
        // Regular users see collaborations they created or are in the same office
        collaborationsData = collaborationsData.filter(collab => 
          collab.createdBy === user.id || 
          collab.office === user.office
        );
      }
      
      setCollaborations(collaborationsData);
      
      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error fetching dashboard data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]); // Add user and isAdmin to dependencies

  // Fetch tasks and leaves on component mount
  useEffect(() => {
    console.log('AgentDashboard component mounted, fetching data...');
    fetchDashboardData();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('AgentDashboard', 'dashboard', fetchDashboardData, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('AgentDashboard');
    };
  }, [fetchDashboardData]);

  // Filter subCategories when category changes in edit dialog
  useEffect(() => {
    if (editCategory && editSubCategories.length > 0) {
      const filtered = editSubCategories.filter(subCat => 
        subCat.parentValue === editCategory || !subCat.parentValue
      );
      setFilteredEditSubCategories(filtered);
    } else {
      setFilteredEditSubCategories(editSubCategories);
    }
  }, [editCategory, editSubCategories]);
  
  // Filter incidents when subCategory changes in edit dialog
  useEffect(() => {
    if (editSubCategory && editIncidents.length > 0) {
      const filtered = editIncidents.filter(inc => 
        inc.parentValue === editSubCategory || !inc.parentValue
      );
      setFilteredEditIncidents(filtered);
    } else {
      setFilteredEditIncidents(editIncidents);
    }
  }, [editSubCategory, editIncidents]);

  // Listen for real-time notifications - with proper dependency array
  useEffect(() => {
    const handleTaskCreated = (data) => {
      console.log('Task created notification received:', data);
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      fetchDashboardData(); // Refresh data
    };

    const handleTaskUpdated = (data) => {
      console.log('Task updated notification received:', data);
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveRequested = (data) => {
      console.log('Leave requested notification received:', data);
      showSnackbar(`New leave request from ${data.leave.userName}`, 'info');
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveApproved = (data) => {
      console.log('Leave approved notification received:', data);
      showSnackbar(`Leave request approved`, 'success');
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveRejected = (data) => {
      console.log('Leave rejected notification received:', data);
      showSnackbar(`Leave request rejected`, 'warning');
      fetchDashboardData(); // Refresh data
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);
    notificationService.onLeaveRequested(handleLeaveRequested);
    notificationService.onLeaveApproved(handleLeaveApproved);
    notificationService.onLeaveRejected(handleLeaveRejected);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
      notificationService.off('leaveRequested', handleLeaveRequested);
      notificationService.off('leaveApproved', handleLeaveApproved);
      notificationService.off('leaveRejected', handleLeaveRejected);
    };
  }, [fetchDashboardData]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExport = async (format) => {
    try {
      // Show loading state
      showSnackbar(`Exporting as ${format.toUpperCase()}...`, 'info');
      
      // Prepare data for export
      const exportData = {
        tasks: finalFilteredTasks,
        leaves: finalFilteredLeaves,
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown'
      };
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'CSV') {
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (format === 'PDF') {
        // For PDF, we'll create a simple text representation
        const pdfContent = convertToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
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
      
      showSnackbar(`Exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar(`Failed to export as ${format.toUpperCase()}`, 'error');
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data) => {
    let csv = 'Dashboard Export\n';
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `User: ${data.user}\n\n`;
    
    // Tasks section
    csv += 'Tasks:\n';
    csv += 'Date,Source,Category,Sub-Category,Incident,Description,User,Status\n';
    
    data.tasks.forEach(task => {
      csv += `"${task.date || ''}","${task.source || ''}","${task.category || ''}","${task.subCategory || ''}","${task.incident || ''}","${task.description || ''}","${task.userName || ''}","${task.status || ''}"\n`;
    });
    
    csv += '\nLeaves:\n';
    csv += 'Start Date,End Date,Reason,User,Status\n';
    
    data.leaves.forEach(leave => {
      csv += `"${leave.startDate || ''}","${leave.endDate || ''}","${leave.reason || ''}","${leave.userName || ''}","${leave.status || ''}"\n`;
    });
    
    return csv;
  };

  // Helper function to convert data to PDF-like text
  const convertToPDF = (data) => {
    let pdf = 'Dashboard Export Report\n';
    pdf += '='.repeat(50) + '\n';
    pdf += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    pdf += `User: ${data.user}\n\n`;
    
    // Tasks section
    pdf += 'TASKS\n';
    pdf += '-'.repeat(20) + '\n';
    
    if (data.tasks.length === 0) {
      pdf += 'No tasks found.\n\n';
    } else {
      data.tasks.forEach((task, index) => {
        pdf += `${index + 1}. ${task.description || 'No description'}\n`;
        pdf += `   Date: ${task.date || 'N/A'}\n`;
        pdf += `   Category: ${task.category || 'N/A'}\n`;
        pdf += `   Sub-Category: ${task.subCategory || 'N/A'}\n`;
        pdf += `   Incident: ${task.incident || 'N/A'}\n`;
        pdf += `   Status: ${task.status || 'N/A'}\n`;
        pdf += `   User: ${task.userName || 'N/A'}\n\n`;
      });
    }
    
    // Leaves section
    pdf += 'LEAVES\n';
    pdf += '-'.repeat(20) + '\n';
    
    if (data.leaves.length === 0) {
      pdf += 'No leaves found.\n\n';
    } else {
      data.leaves.forEach((leave, index) => {
        pdf += `${index + 1}. ${leave.reason || 'No reason'}\n`;
        pdf += `   Dates: ${leave.startDate || 'N/A'} to ${leave.endDate || 'N/A'}\n`;
        pdf += `   Status: ${leave.status || 'N/A'}\n`;
        pdf += `   User: ${leave.userName || 'N/A'}\n\n`;
      });
    }
    
    return pdf;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle View Details button click
  const handleViewDetails = (type, data = null) => {
    setViewDetailsDialog({ open: true, type, data });
  };

  // Close View Details dialog
  const handleCloseViewDetails = () => {
    setViewDetailsDialog({ open: false, type: '', data: null });
  };

  // Filter tasks based on search term and user
  const filteredTasks = tasks.filter(task => 
    (searchTerm === '' || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.subCategory && task.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.incident && task.incident.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  ));
  
  // Apply user filter for all users including admins
  const finalFilteredTasks = userFilter === '' ? filteredTasks : 
    filteredTasks.filter(task => 
      task.userName && userFilter && 
      (task.userName.toLowerCase() === userFilter.toLowerCase() ||
       task.userName.toLowerCase().includes(userFilter.toLowerCase()))
    );

  // Filter leaves based on search term and user
  const filteredLeaves = leaves.filter(leave => 
    (searchTerm === '' || 
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  // Apply user filter for all users including admins
  const finalFilteredLeaves = userFilter === '' ? filteredLeaves : 
    filteredLeaves.filter(leave => 
      leave.userName && userFilter && 
      (leave.userName.toLowerCase() === userFilter.toLowerCase() ||
       leave.userName.toLowerCase().includes(userFilter.toLowerCase()))
    );

  // Handle task edit
  const handleEditTask = async (task) => {
    // Fetch dropdown values for edit dialog
    try {
      // Fetch all dropdown values individually to better handle errors
      const sourcesPromise = dropdownAPI.getDropdownValues('Source').catch(error => {
        console.error('Agent Dashboard - Error fetching sources:', error);
        return { data: [], error };
      });
      
      const categoriesPromise = dropdownAPI.getDropdownValues('Category').catch(error => {
        console.error('Agent Dashboard - Error fetching categories:', error);
        return { data: [], error };
      });
      
      const subCategoriesPromise = dropdownAPI.getDropdownValues('Sub-Category').catch(error => {
        console.error('Agent Dashboard - Error fetching sub-categories:', error);
        return { data: [], error };
      });
      
      const incidentsPromise = dropdownAPI.getDropdownValues('Incident').catch(error => {
        console.error('Agent Dashboard - Error fetching incidents:', error);
        return { data: [], error };
      });
      
      const officesPromise = dropdownAPI.getDropdownValues('Office').catch(error => {
        console.error('Agent Dashboard - Error fetching offices:', error);
        return { data: [], error };
      });
      
      const obligationsPromise = dropdownAPI.getDropdownValues('Obligation').catch(error => {
        console.error('Agent Dashboard - Error fetching obligations:', error);
        return { data: [], error };
      });
      
      const [sourcesRes, categoriesRes, subCategoriesRes, incidentsRes, officesRes, obligationsRes] = await Promise.all([
        sourcesPromise,
        categoriesPromise,
        subCategoriesPromise,
        incidentsPromise,
        officesPromise,
        obligationsPromise
      ]);
      
      console.log('Agent Dashboard - Sources response:', sourcesRes);
      console.log('Agent Dashboard - Categories response:', categoriesRes);
      console.log('Agent Dashboard - Sub-Categories response:', subCategoriesRes);
      console.log('Agent Dashboard - Incidents response:', incidentsRes);
      console.log('Agent Dashboard - Offices response:', officesRes);
      console.log('Agent Dashboard - Obligations response:', obligationsRes);
      
      // Check if any responses have errors
      if (sourcesRes?.error) {
        console.error('Agent Dashboard - Error fetching sources:', sourcesRes.error);
      }
      if (categoriesRes?.error) {
        console.error('Agent Dashboard - Error fetching categories:', categoriesRes.error);
      }
      if (subCategoriesRes?.error) {
        console.error('Agent Dashboard - Error fetching sub-categories:', subCategoriesRes.error);
      }
      if (incidentsRes?.error) {
        console.error('Agent Dashboard - Error fetching incidents:', incidentsRes.error);
      }
      if (officesRes?.error) {
        console.error('Agent Dashboard - Error fetching offices:', officesRes.error);
      }
      if (obligationsRes?.error) {
        console.error('Agent Dashboard - Error fetching obligations:', obligationsRes.error);
      }
      
      setEditSources(sourcesRes.data || []);
      setEditCategories(categoriesRes.data || []);
      setEditSubCategories(subCategoriesRes.data || []);
      setEditIncidents(incidentsRes.data || []);
      setEditOffices(officesRes.data || []); // Set offices dropdown options
      setEditObligations(obligationsRes.data || []); // Set obligations dropdown options
      console.log('Agent Dashboard - Edit Obligations set to:', obligationsRes.data || []);
      
      // Additional debugging to check obligation data structure
      if (obligationsRes?.data) {
        console.log('Agent Dashboard - Obligation data structure:', obligationsRes.data.map(o => ({
          id: o.id,
          value: o.value,
          type: o.type,
          isActive: o.isActive
        })));
      }
    } catch (error) {
      console.error('Error fetching dropdown values for edit:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      showSnackbar('Error fetching dropdown values: ' + (error.response?.data?.message || error.message), 'error');
      // Set default values if API fails
      setEditSources(['Email', 'Phone', 'Walk-in', 'Online Form', 'Other']);
      setEditCategories(['IT Support', 'HR', 'Finance', 'Administration', 'Other']);
      setEditSubCategories(['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other']);
      setEditIncidents(['Bug Report', 'Feature Request', 'System Error', 'User Issue', 'Security Concern', 'Other']);
      setEditOffices(['Head Office', 'Branch Office', 'Remote']); // Default offices
      setEditObligations(['Compliance', 'Legal', 'Financial', 'Operational']); // Default obligations
    }
    
    // Set editing task data
    setEditingTask(task);
    setEditDate(task.date || '');
    setEditSource(task.source || '');
    setEditCategory(task.category || '');
    setEditSubCategory(task.subCategory || '');
    setEditIncident(task.incident || '');
    setEditOffice(task.office || ''); // Set office
    setEditObligation(task.obligation || ''); // Set obligation
    setEditUserInformation(task.userInformation || ''); // Set user information
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    setEditFiles(task.files || []); // Set files
    
    setOpenEditDialog(true);
  };

  // Handle task update
  const handleUpdateTask = async () => {
    try {
      const updatedTaskData = {
        date: editDate,
        source: editSource,
        category: editCategory,
        subCategory: editSubCategory,
        incident: editIncident,
        office: editOffice,
        obligation: editObligation,
        userInformation: editUserInformation,
        description: editDescription,
        status: editStatus,
        files: editFiles
        // Don't include userId or userName to preserve original owner
      };
      
      await taskAPI.updateTask(editingTask.id, updatedTaskData);
      
      showSnackbar('Task updated successfully!', 'success');
      setOpenEditDialog(false);
      setEditingTask(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      showSnackbar('Task deleted successfully!', 'success');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task: ' + (error.response?.data?.message || error.message), 'error');
    }
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

  // Get task distribution data for charts - use filtered tasks instead of all tasks
  const getTaskDistributionData = () => {
    if (!finalFilteredTasks || finalFilteredTasks.length === 0) return [];
    
    // Group tasks by subCategory
    const subCategoryCount = {};
    finalFilteredTasks.forEach(task => {
      const subCategory = task.subCategory || 'Unknown';
      subCategoryCount[subCategory] = (subCategoryCount[subCategory] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.keys(subCategoryCount).map(subCategory => ({
      name: subCategory,
      count: subCategoryCount[subCategory]
    }));
  };
  
  // Get incident distribution data for charts
  const getIncidentDistributionData = () => {
    if (!finalFilteredTasks || finalFilteredTasks.length === 0) return [];
    
    // Group tasks by incident
    const incidentCount = {};
    finalFilteredTasks.forEach(task => {
      const incident = task.incident || 'Unknown';
      incidentCount[incident] = (incidentCount[incident] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.keys(incidentCount).map(incident => ({
      name: incident,
      count: incidentCount[incident]
    }));
  };

  // Fetch reports data from API - use filtered data
  const fetchReportsData = useCallback(async () => {
    try {
      // Generate dynamic reports based on filtered data
      const reports = [
        { 
          id: 1, 
          name: 'Weekly Task Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Last 7 days',
          taskCount: finalFilteredTasks.length,
          pendingTasks: finalFilteredTasks.filter(t => t.status === 'Pending').length,
          completedTasks: finalFilteredTasks.filter(t => t.status === 'Completed').length
        },
        { 
          id: 2, 
          name: 'Monthly Leave Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Current Month',
          leaveCount: finalFilteredLeaves.length,
          approvedLeaves: finalFilteredLeaves.filter(l => l.status === 'Approved').length,
          pendingLeaves: finalFilteredLeaves.filter(l => l.status === 'Pending').length
        },
        { 
          id: 3, 
          name: 'Performance Summary', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'All Time',
          totalTasks: finalFilteredTasks.length,
          totalLeaves: finalFilteredLeaves.length,
          completionRate: finalFilteredTasks.length > 0 ? Math.round((finalFilteredTasks.filter(t => t.status === 'Completed').length / finalFilteredTasks.length) * 100) : 0
        }
      ];
      return reports;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      return [];
    }
  }, [finalFilteredTasks, finalFilteredLeaves]);

  // Get reports data based on actual data - use filtered data
  const getReportsData = useCallback(() => {
    try {
      // Generate dynamic reports based on filtered data
      const reports = [
        { 
          id: 1, 
          name: 'Weekly Task Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Last 7 days',
          taskCount: finalFilteredTasks.length,
          pendingTasks: finalFilteredTasks.filter(t => t.status === 'Pending').length,
          completedTasks: finalFilteredTasks.filter(t => t.status === 'Completed').length
        },
        { 
          id: 2, 
          name: 'Monthly Leave Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Current Month',
          leaveCount: finalFilteredLeaves.length,
          approvedLeaves: finalFilteredLeaves.filter(l => l.status === 'Approved').length,
          pendingLeaves: finalFilteredLeaves.filter(l => l.status === 'Pending').length
        },
        { 
          id: 3, 
          name: 'Performance Summary', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'All Time',
          totalTasks: finalFilteredTasks.length,
          totalLeaves: finalFilteredLeaves.length,
          completionRate: finalFilteredTasks.length > 0 ? Math.round((finalFilteredTasks.filter(t => t.status === 'Completed').length / finalFilteredTasks.length) * 100) : 0
        }
      ];
      return reports;
    } catch (error) {
      console.error('Error generating reports data:', error);
      return [];
    }
  }, [finalFilteredTasks, finalFilteredLeaves]);

  // Get notifications data based on actual data - use filtered data
  const getNotificationsData = useCallback(() => {
    try {
      const notifications = [];
      
      // Add task-related notifications from filtered tasks
      finalFilteredTasks.slice(0, 3).forEach(task => {
        notifications.push({
          id: `task-${task.id}`,
          message: `Task "${task.description}" is ${task.status}`,
          time: task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'Recently',
          type: 'task'
        });
      });
      
      // Add leave-related notifications from filtered leaves
      finalFilteredLeaves.slice(0, 3).forEach(leave => {
        if (leave.status === 'Pending') {
          notifications.push({
            id: `leave-${leave.id}`,
            message: `Leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} is pending approval`,
            time: leave.createdAt ? new Date(leave.createdAt).toLocaleString() : 'Recently',
            type: 'leave'
          });
        } else if (leave.status === 'Approved') {
          notifications.push({
            id: `leave-${leave.id}`,
            message: `Leave request approved`,
            time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
            type: 'approval'
          });
        } else if (leave.status === 'Rejected') {
          notifications.push({
            id: `leave-${leave.id}`,
            message: `Leave request rejected`,
            time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
            type: 'rejection'
          });
        }
      });
      
      // Sort notifications by time (newest first)
      notifications.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return timeB - timeA;
      });
      
      return notifications.slice(0, 7); // Limit to 7 notifications
    } catch (error) {
      console.error('Error generating notifications data:', error);
      return [];
    }
  }, [finalFilteredTasks, finalFilteredLeaves]);

  // Get actual reports and notifications data
  const reportsData = getReportsData();
  const notificationsData = getNotificationsData();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Agent Dashboard
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Task Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div">
                  {finalFilteredTasks.length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('tasks', finalFilteredTasks)}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventAvailable sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="div">
                  {finalFilteredLeaves.filter(l => l.status === 'Pending').length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Pending Leaves
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('leaves', finalFilteredLeaves.filter(l => l.status === 'Pending'))}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  {reportsData.length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Reports Generated
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('reports', reportsData)}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Notifications sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h5" component="div">
                  {notificationsData.length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Notifications
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('notifications', notificationsData)}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Modern Expandable Filter Section */}
        <Grid item xs={12}>
          <FilterSection
            title="Advanced Filters"
            defaultExpanded={true}
            hasActiveFilters={Boolean(searchTerm || userFilter)}
            onClearFilters={() => {
              setSearchTerm('');
              setSelectedUser(null);
              setUserFilter('');
            }}
          >
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Tasks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: <SearchIcon fontSize="small" />
                }}
              />
            </Grid>
            
            {(user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'SystemAdmin') && (
              <Grid item xs={12} sm={3}>
                <UserFilterDropdown
                  users={filteredUsers}
                  selectedUser={selectedUser}
                  onUserChange={(newValue) => {
                    setSelectedUser(newValue);
                    // Don't apply filter immediately, let user click Apply button
                  }}
                  label="Filter by User"
                  loading={userLoading}
                  gridSize={{ xs: 12, sm: 12 }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="contained"
                  onClick={() => {
                    // Apply user filter when Apply button is clicked
                    if (selectedUser) {
                      // Use the value field from the processed user object for consistent matching
                      setUserFilter(selectedUser.value || selectedUser.username || selectedUser.email || '');
                    } else {
                      setUserFilter('');
                    }
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
        </Grid>
        
        {/* Charts and Task Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: { xs: 1, sm: 0 } }}>
                Sub-Category Classification - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </Typography>
              <Box>
                <IconButton 
                  color={chartType === 'bar' ? 'primary' : 'default'}
                  onClick={() => setChartType('bar')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'bar' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setChartType('pie')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'pie' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <PieChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'donut' ? 'primary' : 'default'}
                  onClick={() => setChartType('donut')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'donut' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'radial' ? 'primary' : 'default'}
                  onClick={() => setChartType('radial')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'radial' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setChartType('line')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'line' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <LineChartIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTaskDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Task Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTaskDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTaskDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTaskDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Task Count" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'donut' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTaskDistributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTaskDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'radial' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="10%" 
                    outerRadius="80%" 
                    barSize={10}
                    data={getTaskDistributionData().map((entry, index) => ({
                      ...entry,
                      fill: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
                    }))}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ fill: '#666', position: 'insideStart' }}
                      background
                      clockWise={true}
                      dataKey="count"
                    />
                    <Tooltip />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
          
          {/* Incident Classification Chart */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: { xs: 1, sm: 0 } }}>
                Incident Classification - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </Typography>
              <Box>
                <IconButton 
                  color={incidentChartType === 'bar' ? 'primary' : 'default'}
                  onClick={() => setIncidentChartType('bar')}
                  size="small"
                  sx={{ mx: 0.5, border: incidentChartType === 'bar' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton 
                  color={incidentChartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setIncidentChartType('pie')}
                  size="small"
                  sx={{ mx: 0.5, border: incidentChartType === 'pie' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <PieChartIcon />
                </IconButton>
                <IconButton 
                  color={incidentChartType === 'donut' ? 'primary' : 'default'}
                  onClick={() => setIncidentChartType('donut')}
                  size="small"
                  sx={{ mx: 0.5, border: incidentChartType === 'donut' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={incidentChartType === 'radial' ? 'primary' : 'default'}
                  onClick={() => setIncidentChartType('radial')}
                  size="small"
                  sx={{ mx: 0.5, border: incidentChartType === 'radial' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={incidentChartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setIncidentChartType('line')}
                  size="small"
                  sx={{ mx: 0.5, border: incidentChartType === 'line' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <LineChartIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              {incidentChartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getIncidentDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Incident Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {incidentChartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getIncidentDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getIncidentDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {incidentChartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getIncidentDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Incident Count" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {incidentChartType === 'donut' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getIncidentDistributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getIncidentDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {incidentChartType === 'radial' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="10%" 
                    outerRadius="80%" 
                    barSize={10}
                    data={getIncidentDistributionData().map((entry, index) => ({
                      ...entry,
                      fill: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
                    }))}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ fill: '#666', position: 'insideStart' }}
                      background
                      clockWise={true}
                      dataKey="count"
                    />
                    <Tooltip />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Task History" />
              <Tab label="Leave Summary" />
            </Tabs>
            
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <TableContainer sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Sub-Category</TableCell>
                          <TableCell>Incident</TableCell>
                          <TableCell>Obligation</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>User Info</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Files</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {finalFilteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>{task.source || 'N/A'}</TableCell>
                            <TableCell>{task.category || 'N/A'}</TableCell>
                            <TableCell>{task.subCategory || 'N/A'}</TableCell>
                            <TableCell>{task.incident || 'N/A'}</TableCell>
                            <TableCell>{task.obligation || 'N/A'}</TableCell>
                            <TableCell>{task.userName || 'N/A'}</TableCell>
                            <TableCell>{task.office || 'N/A'}</TableCell>
                            <TableCell>{task.userInformation || 'N/A'}</TableCell>
                            <TableCell>{task.description || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={task.status || 'Pending'} 
                                color={
                                  task.status === 'Completed' ? 'success' : 
                                  task.status === 'In Progress' ? 'primary' : 
                                  task.status === 'Cancelled' ? 'error' : 'default'
                                } 
                              />
                            </TableCell>
                            <TableCell>
                              {task.files && task.files.length > 0 ? (
                                <Chip 
                                  label={task.files.length} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              ) : (
                                <Chip label="No Files" size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => handleEditTask(task)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Leave History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {finalFilteredLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.userName || 'N/A'}</TableCell>
                          <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.reason || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={leave.status || 'Pending'} 
                              color={
                                leave.status === 'Approved' ? 'success' : 
                                leave.status === 'Pending' ? 'warning' : 'error'
                              } 
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
              {tasks.length > 0 || leaves.length > 0 || meetings.length > 0 || collaborations.length > 0 ? (
                <Box>
                  {/* Show recent tasks, leaves, meetings, and collaborations for the current user */}
                  {[...finalFilteredTasks.map(t => ({...t, type: 'task'})), 
                    ...finalFilteredLeaves.map(l => ({...l, type: 'leave'})),
                    ...meetings.map(m => ({...m, type: 'meeting'})),
                    ...collaborations.map(c => ({...c, type: 'collaboration'}))]
                    .sort((a, b) => new Date(b.createdAt || b.date || b.createdAt) - new Date(a.createdAt || a.date || a.createdAt))
                    .slice(0, 10)
                    .map((item, index) => (
                      <Box 
                        key={`${item.type}-${item.id}`} 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          borderLeft: '4px solid',
                          borderLeftColor: item.status === 'Completed' ? 'success.main' : 
                                          item.status === 'Approved' ? 'success.main' : 
                                          item.status === 'Rejected' ? 'error.main' : 
                                          item.status === 'In Progress' ? 'primary.main' : 
                                          item.type === 'meeting' ? 'info.main' :
                                          item.type === 'collaboration' ? 'secondary.main' : 'warning.main'
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                          {item.type === 'task' ? (item.description || 'New task') : 
                           item.type === 'leave' ? (item.reason || 'New leave request') :
                           item.type === 'meeting' ? (item.subject || 'New meeting') :
                           item.type === 'collaboration' ? (item.title || 'New collaboration') : 'Activity'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.userName ? `By ${item.userName}` : item.createdBy ? `By User ${item.createdBy}` : 'System'} •{' '}
                          {new Date(item.createdAt || item.date).toLocaleString()}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={item.status || 
                                   (item.type === 'meeting' ? 'Scheduled' : 
                                   item.type === 'collaboration' ? 'Active' : 'Pending')} 
                            size="small"
                            color={
                              item.status === 'Completed' || item.status === 'Approved' ? 'success' : 
                              item.status === 'In Progress' ? 'primary' : 
                              item.status === 'Rejected' ? 'error' : 
                              item.type === 'meeting' ? 'info' :
                              item.type === 'collaboration' ? 'secondary' : 'default'
                            } 
                          />
                          {item.type === 'task' && item.category && (
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="info"
                            />
                          )}
                          {item.type === 'task' && item.subCategory && (
                            <Chip 
                              label={item.subCategory} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="secondary"
                            />
                          )}
                          {item.type === 'task' && item.incident && (
                            <Chip 
                              label={item.incident} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="warning"
                            />
                          )}
                          {item.type === 'meeting' && (
                            <Chip 
                              icon={<VideoCallIcon />}
                              label="Meeting" 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="info"
                            />
                          )}
                          {item.type === 'collaboration' && (
                            <Chip 
                              icon={<LinkIcon />}
                              label="Collaboration" 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="secondary"
                            />
                          )}
                        </Box>
                      </Box>
                    ))
                  }
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: 'text.secondary' }}>No recent activity</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog.open} onClose={handleCloseViewDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} />
            {viewDetailsDialog.type === 'tasks' && 'Task Details'}
            {viewDetailsDialog.type === 'leaves' && 'Leave Details'}
            {viewDetailsDialog.type === 'reports' && 'Report Details'}
            {viewDetailsDialog.type === 'notifications' && 'Notification Details'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewDetailsDialog.type === 'tasks' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                {isAdmin ? 'Showing all tasks in the system.' : 'Showing all tasks assigned to you.'}
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Sub-Category</TableCell>
                      <TableCell>Incident</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{task.category || 'N/A'}</TableCell>
                        <TableCell>{task.subCategory || 'N/A'}</TableCell>
                        <TableCell>{task.incident || 'N/A'}</TableCell>
                        <TableCell>{task.description || 'N/A'}</TableCell>
                        <TableCell>{task.userName || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status || 'Pending'} 
                            size="small"
                            color={
                              task.status === 'Completed' ? 'success' : 
                              task.status === 'In Progress' ? 'primary' : 
                              task.status === 'Cancelled' ? 'error' : 'default'
                            } 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {viewDetailsDialog.type === 'leaves' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                {isAdmin ? 'Showing all leave requests in the system.' : 'Showing pending leave requests for you.'}
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.userName || 'N/A'}</TableCell>
                        <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{leave.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {viewDetailsDialog.type === 'reports' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                Showing all generated reports with their details.
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Generated At</TableCell>
                      <TableCell>Filter Criteria</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.generatedAt}</TableCell>
                        <TableCell>{report.filter}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {viewDetailsDialog.type === 'notifications' && (
            <Box>
              <DialogContentText>
                Showing recent notifications and alerts.
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                {viewDetailsDialog.data && viewDetailsDialog.data.length > 0 ? (
                  viewDetailsDialog.data.map((notification, index) => (
                    <Typography key={notification.id || index} variant="body2" sx={{ mb: 1 }}>
                      <strong>{notification.type === 'task' ? 'Task Update:' : 
                               notification.type === 'leave' ? 'Leave Request:' : 
                               notification.type === 'approval' ? 'Leave Approved:' : 
                               notification.type === 'rejection' ? 'Leave Rejected:' : 
                               'Notification:'}</strong> {notification.message} ({notification.time})
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">No notifications available</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDetails}>Close</Button>
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
                <FormControl fullWidth required>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value)}
                    label="Source"
                  >
                    {editSources.map((src) => (
                      <MenuItem key={src.id || src.value} value={src.value || src}>
                        {src.value || src}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    label="Category"
                  >
                    {editCategories.map((cat) => (
                      <MenuItem key={cat.id || cat.value} value={cat.value || cat}>
                        {cat.value || cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Sub-Category</InputLabel>
                  <Select
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    label="Sub-Category"
                  >
                    {filteredEditSubCategories.map((subCat) => (
                      <MenuItem key={subCat.id || subCat.value} value={subCat.value || subCat}>
                        {subCat.value || subCat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Incident</InputLabel>
                  <Select
                    value={editIncident}
                    onChange={(e) => setEditIncident(e.target.value)}
                    label="Incident"
                  >
                    {filteredEditIncidents.map((inc) => (
                      <MenuItem key={inc.id || inc.value} value={inc.value || inc}>
                        {inc.value || inc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Add Office Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Office</InputLabel>
                  <Select
                    value={editOffice}
                    onChange={(e) => setEditOffice(e.target.value)}
                    label="Office"
                  >
                    {editOffices.map((office) => (
                      <MenuItem key={office.id || office.value} value={office.value || office}>
                        {office.value || office}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Add Obligation Dropdown - Ensuring visibility */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Obligation</InputLabel>
                  <Select
                    value={editObligation || ''}
                    onChange={(e) => setEditObligation(e.target.value)}
                    label="Obligation"
                  >
                    {editObligations.map((obligation) => (
                      <MenuItem key={obligation.id || obligation.value || obligation} value={obligation.value || obligation}>
                        {obligation.value || obligation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Add User Information Field */}
              <Grid item xs={12}>
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
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Add File Upload Field */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                >
                  Upload Files
                  <input
                    type="file"
                    hidden
                    onChange={handleEditFileChange}
                    multiple
                  />
                </Button>
                
                {/* Display selected files */}
                {editFiles.length > 0 && (
                  <Paper sx={{ mt: 2, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Files:
                    </Typography>
                    <List dense>
                      {editFiles.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB - ${file.type}`}
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
    </Box>
  );
};

export default AgentDashboard;
