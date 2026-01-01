import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
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
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { reportAPI, userAPI, dropdownAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';
import CsvIcon from '../components/icons/CsvIcon';
import ExcelIcon from '../components/icons/ExcelIcon';
import PdfIcon from '../components/icons/PdfIcon';

const ReportManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('task');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch dropdown options for breakdown report
  useEffect(() => {
    if (activeTab === 3) { // Only fetch when breakdown tab is active
      fetchBreakdownDropdowns();
    }
  }, [activeTab]);
  
  const fetchBreakdownDropdowns = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const usersResponse = await userAPI.getAllUsers();
      setUsers(usersResponse.data || []);
      
      // Fetch all dropdown types
      const [sourcesRes, categoriesRes, subCategoriesRes, incidentsRes, officesRes, obligationsRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Sub-Category'),
        dropdownAPI.getDropdownValues('Incident'),
        dropdownAPI.getDropdownValues('Office'),
        dropdownAPI.getDropdownValues('Obligation')
      ]);
      
      setSources(sourcesRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
      setIncidents(incidentsRes.data || []);
      setOffices(officesRes.data || []);
      setObligations(obligationsRes.data || []);
    } catch (error) {
      console.error('Error fetching breakdown dropdowns:', error);
      setError('Failed to load dropdown options');
    } finally {
      setLoading(false);
    }
  };
  
  const [taskReports, setTaskReports] = useState([]);
  const [leaveReports, setLeaveReports] = useState([]);
  const [activityReports, setActivityReports] = useState([]);
  const [breakdownReports, setBreakdownReports] = useState([]);
  
  // BreakDown Report states
  const [breakdownTimeRange, setBreakdownTimeRange] = useState('');
  const [breakdownStartDate, setBreakdownStartDate] = useState('');
  const [breakdownEndDate, setBreakdownEndDate] = useState('');
  const [breakdownUserId, setBreakdownUserId] = useState('');
  const [breakdownSource, setBreakdownSource] = useState('');
  const [breakdownCategory, setBreakdownCategory] = useState('');
  const [breakdownSubCategory, setBreakdownSubCategory] = useState('');
  const [breakdownIncident, setBreakdownIncident] = useState('');
  const [breakdownOffice, setBreakdownOffice] = useState('');
  const [breakdownUserInformation, setBreakdownUserInformation] = useState('');
  const [breakdownObligation, setBreakdownObligation] = useState('');
  
  // Dropdown options for breakdown report
  const [users, setUsers] = useState([]);
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [offices, setOffices] = useState([]);
  const [obligations, setObligations] = useState([]);

  useEffect(() => {
    // Reset reports when tab changes
    setTaskReports([]);
    setLeaveReports([]);
    setActivityReports([]);
    setBreakdownReports([]);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (activeTab === 3) { // Breakdown Report
        // Create breakdown report parameters
        const breakdownParams = {
          startDate: breakdownStartDate,
          endDate: breakdownEndDate,
          timeRange: breakdownTimeRange,
          userId: breakdownUserId || undefined,
          source: breakdownSource || undefined,
          category: breakdownCategory || undefined,
          subCategory: breakdownSubCategory || undefined,
          incident: breakdownIncident || undefined,
          office: breakdownOffice || undefined,
          userInformation: breakdownUserInformation || undefined,
          obligation: breakdownObligation || undefined,
        };
        
        // Fetch tasks with breakdown filters
        const response = await reportAPI.getTaskReport(breakdownParams);
        setBreakdownReports(response.data);
      } else {
        const params = {
          startDate,
          endDate,
          userId: userId || undefined,
          status: status || undefined
        };
        
        let data;
        if (activeTab === 0) {
          data = await reportAPI.getTaskReport(params);
          setTaskReports(data.data);
        } else if (activeTab === 1) {
          data = await reportAPI.getLeaveReport(params);
          setLeaveReports(data.data);
        } else {
          data = await reportAPI.getSummaryReport(params);
          setActivityReports(data.data);
        }
      }
      
      setSuccess('Report generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      // Show loading state
      setLoading(true);
      setError('');
      
      // Prepare data for export based on active tab
      let exportData = {
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown',
        reportType: activeTab === 0 ? 'Task' : activeTab === 1 ? 'Leave' : activeTab === 2 ? 'Summary' : 'Breakdown'
      };
      
      // Get the appropriate data based on the active tab
      if (activeTab === 0) {
        exportData.tasks = taskReports;
      } else if (activeTab === 1) {
        exportData.leaves = leaveReports;
      } else if (activeTab === 2) {
        exportData.summary = activityReports;
      } else {
        exportData.breakdown = breakdownReports;
      }
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv;charset=utf-8;';
        filename = `report_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else if (format === 'xlsx') {
        // For Excel, we'll create CSV content (simpler approach)
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'application/vnd.ms-excel;charset=utf-8;';
        filename = `report_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else if (format === 'pdf') {
        // For PDF, we'll create a simple text representation
        const pdfContent = convertToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf;charset=utf-8;';
        filename = `report_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `report_export_${new Date().toISOString().split('T')[0]}.json`;
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
      
      // Log audit entry
      const reportTypeName = activeTab === 0 ? 'Task' : activeTab === 1 ? 'Leave' : 'Summary';
      auditLog.reportExported(`${reportTypeName} Report`, format, user?.username || 'unknown');
      
      setSuccess(`Report exported as ${format.toUpperCase()} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError(`Failed to export report as ${format.toUpperCase()}: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert report data to CSV
  const convertToCSV = (data) => {
    let csv = 'Report Export\n';
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `User: ${data.user}\n`;
    csv += `Report Type: ${data.reportType}\n\n`;
    
    if (data.reportType === 'Task' && data.tasks) {
      // Task report section
      csv += 'Task Report\n';
      csv += 'Date,Source,Category,Service,User,Office,Status\n';
      
      data.tasks.forEach(task => {
        // Handle both raw objects and Sequelize instances
        const taskData = task.toJSON ? task.toJSON() : task;
        csv += `"${taskData.date || ''}","${taskData.source || ''}","${taskData.category || ''}","${taskData.service || ''}","${taskData.userName || ''}","${taskData.office || ''}","${taskData.status || ''}"\n`;
      });
    } else if (data.reportType === 'Leave' && data.leaves) {
      // Leave report section
      csv += 'Leave Report\n';
      csv += 'Employee,Start Date,End Date,Reason,User,Status,Approved By\n';
      
      data.leaves.forEach(leave => {
        // Handle both raw objects and Sequelize instances
        const leaveData = leave.toJSON ? leave.toJSON() : leave;
        csv += `"${leaveData.userName || ''}","${leaveData.startDate || ''}","${leaveData.endDate || ''}","${leaveData.reason || ''}","${leaveData.userName || ''}","${leaveData.status || ''}","${leaveData.approvedByName || ''}"\n`;
      });
    } else if (data.reportType === 'Summary' && data.summary) {
      // Summary report section
      csv += 'Summary Report\n\n';
      
      if (data.summary.tasks) {
        csv += 'Task Statistics\n';
        csv += 'Status,Count\n';
        data.summary.tasks.forEach(stat => {
          // Handle both raw objects and Sequelize instances
          const statData = stat.toJSON ? stat.toJSON() : stat;
          csv += `"${statData.status || statData.status}","${statData.count || statData.count}"\n`;
        });
        csv += '\n';
      }
      
      if (data.summary.leaves) {
        csv += 'Leave Statistics\n';
        csv += 'Status,Count\n';
        data.summary.leaves.forEach(stat => {
          // Handle both raw objects and Sequelize instances
          const statData = stat.toJSON ? stat.toJSON() : stat;
          csv += `"${statData.status || statData.status}","${statData.count || statData.count}"\n`;
        });
        csv += '\n';
      }
    } else if (data.reportType === 'Breakdown' && data.breakdown) {
      // Breakdown report section
      csv += 'Breakdown Report\n';
      csv += 'Date,Source,Category,Sub-Category,Incident,User,Office,User Information,Obligation,Status\n';
      
      data.breakdown.forEach(task => {
        // Handle both raw objects and Sequelize instances
        const taskData = task.toJSON ? task.toJSON() : task;
        csv += `"${taskData.date || ''}","${taskData.source || ''}","${taskData.category || ''}","${taskData.subCategory || ''}","${taskData.incident || ''}","${taskData.userName || ''}","${taskData.office || ''}","${taskData.userInformation || ''}","${taskData.obligation || ''}","${taskData.status || ''}"\n`;
      });
    }
    
    return csv;
  };

  // Helper function to convert report data to PDF-like text with better formatting
  const convertToPDF = (data) => {
    let pdf = 'D-Nothi Team & Activity Management Report\n';
    pdf += '='.repeat(80) + '\n';
    pdf += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    pdf += `Generated by: ${data.user}\n`;
    pdf += `Report Type: ${data.reportType}\n`;
    pdf += '='.repeat(80) + '\n\n';
    
    if (data.reportType === 'Task' && data.tasks) {
      // Task report section
      pdf += 'TASK REPORT\n';
      pdf += '='.repeat(80) + '\n\n';
      
      if (data.tasks.length === 0) {
        pdf += 'No tasks found.\n\n';
      } else {
        // Create a table-like format for tasks
        pdf += '+------------+------------+------------+------------+------------+------------+------------+\n';
        pdf += '| Date       | Source     | Category   | Service    | User       | Office     | Status     |\n';
        pdf += '+------------+------------+------------+------------+------------+------------+------------+\n';
        
        data.tasks.forEach((task, index) => {
          // Handle both raw objects and Sequelize instances
          const taskData = task.toJSON ? task.toJSON() : task;
          const date = taskData.date || 'N/A';
          const source = taskData.source || 'N/A';
          const category = taskData.category || 'N/A';
          const service = taskData.service || 'N/A';
          const userName = taskData.userName || 'N/A';
          const office = taskData.office || 'N/A';
          const status = taskData.status || 'N/A';
          
          // Truncate values to fit in columns
          const formatDate = date.length > 10 ? date.substring(0, 10) : date;
          const formatSource = source.length > 10 ? source.substring(0, 10) : source;
          const formatCategory = category.length > 10 ? category.substring(0, 10) : category;
          const formatService = service.length > 10 ? service.substring(0, 10) : service;
          const formatUser = userName.length > 10 ? userName.substring(0, 10) : userName;
          const formatOffice = office.length > 10 ? office.substring(0, 10) : office;
          const formatStatus = status.length > 10 ? status.substring(0, 10) : status;
          
          pdf += `| ${formatDate.padEnd(10)} | ${formatSource.padEnd(10)} | ${formatCategory.padEnd(10)} | ${formatService.padEnd(10)} | ${formatUser.padEnd(10)} | ${formatOffice.padEnd(10)} | ${formatStatus.padEnd(10)} |\n`;
        });
        
        pdf += '+------------+------------+------------+------------+------------+------------+------------+\n';
      }
    } else if (data.reportType === 'Leave' && data.leaves) {
      // Leave report section
      pdf += 'LEAVE REPORT\n';
      pdf += '='.repeat(80) + '\n\n';
      
      if (data.leaves.length === 0) {
        pdf += 'No leaves found.\n\n';
      } else {
        // Create a table-like format for leaves
        pdf += '+------------+------------+------------+------------+------------+------------+\n';
        pdf += '| Employee   | Start Date | End Date   | Reason     | Status     | Approved By|\n';
        pdf += '+------------+------------+------------+------------+------------+------------+\n';
        
        data.leaves.forEach((leave, index) => {
          // Handle both raw objects and Sequelize instances
          const leaveData = leave.toJSON ? leave.toJSON() : leave;
          const userName = leaveData.userName || 'N/A';
          const startDate = leaveData.startDate || 'N/A';
          const endDate = leaveData.endDate || 'N/A';
          const reason = leaveData.reason || 'N/A';
          const status = leaveData.status || 'N/A';
          const approvedBy = leaveData.approvedByName || 'N/A';
          
          // Truncate values to fit in columns
          const formatUser = userName.length > 10 ? userName.substring(0, 10) : userName;
          const formatStart = startDate.length > 10 ? startDate.substring(0, 10) : startDate;
          const formatEnd = endDate.length > 10 ? endDate.substring(0, 10) : endDate;
          const formatReason = reason.length > 10 ? reason.substring(0, 10) : reason;
          const formatStatus = status.length > 10 ? status.substring(0, 10) : status;
          const formatApproved = approvedBy.length > 10 ? approvedBy.substring(0, 10) : approvedBy;
          
          pdf += `| ${formatUser.padEnd(10)} | ${formatStart.padEnd(10)} | ${formatEnd.padEnd(10)} | ${formatReason.padEnd(10)} | ${formatStatus.padEnd(10)} | ${formatApproved.padEnd(10)} |\n`;
        });
        
        pdf += '+------------+------------+------------+------------+------------+------------+\n';
      }
    } else if (data.reportType === 'Summary' && data.summary) {
      // Summary report section
      pdf += 'SUMMARY REPORT\n';
      pdf += '='.repeat(80) + '\n\n';
      
      if (data.summary.tasks) {
        pdf += 'Task Statistics\n';
        pdf += '='.repeat(30) + '\n';
        pdf += '+------------+------------+\n';
        pdf += '| Status     | Count      |\n';
        pdf += '+------------+------------+\n';
        
        data.summary.tasks.forEach(stat => {
          // Handle both raw objects and Sequelize instances
          const statData = stat.toJSON ? stat.toJSON() : stat;
          const status = statData.status || 'N/A';
          const count = statData.count || 'N/A';
          
          pdf += `| ${status.padEnd(10)} | ${String(count).padEnd(10)} |\n`;
        });
        
        pdf += '+------------+------------+\n\n';
      }
      
      if (data.summary.leaves) {
        pdf += 'Leave Statistics\n';
        pdf += '='.repeat(30) + '\n';
        pdf += '+------------+------------+\n';
        pdf += '| Status     | Count      |\n';
        pdf += '+------------+------------+\n';
        
        data.summary.leaves.forEach(stat => {
          // Handle both raw objects and Sequelize instances
          const statData = stat.toJSON ? stat.toJSON() : stat;
          const status = statData.status || 'N/A';
          const count = statData.count || 'N/A';
          
          pdf += `| ${status.padEnd(10)} | ${String(count).padEnd(10)} |\n`;
        });
        
        pdf += '+------------+------------+\n';
      }
    } else if (data.reportType === 'Breakdown' && data.breakdown) {
      // Breakdown report section
      pdf += 'BREAKDOWN REPORT\n';
      pdf += '='.repeat(80) + '\n\n';
      
      if (data.breakdown.length === 0) {
        pdf += 'No tasks found.\n\n';
      } else {
        // Create a table-like format for tasks
        pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+------------+------------+\n';
        pdf += '| Date       | Source     | Category   | Sub-Category| Incident   | User       | Office     | User Info  | Obligation | Status     |\n';
        pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+------------+------------+\n';
        
        data.breakdown.forEach((task, index) => {
          // Handle both raw objects and Sequelize instances
          const taskData = task.toJSON ? task.toJSON() : task;
          const date = taskData.date || 'N/A';
          const source = taskData.source || 'N/A';
          const category = taskData.category || 'N/A';
          const subCategory = taskData.subCategory || 'N/A';
          const incident = taskData.incident || 'N/A';
          const userName = taskData.userName || 'N/A';
          const office = taskData.office || 'N/A';
          const userInformation = taskData.userInformation || 'N/A';
          const obligation = taskData.obligation || 'N/A';
          const status = taskData.status || 'N/A';
          
          // Truncate values to fit in columns
          const formatDate = date.length > 10 ? date.substring(0, 10) : date;
          const formatSource = source.length > 10 ? source.substring(0, 10) : source;
          const formatCategory = category.length > 10 ? category.substring(0, 10) : category;
          const formatSubCategory = subCategory.length > 12 ? subCategory.substring(0, 12) : subCategory;
          const formatIncident = incident.length > 10 ? incident.substring(0, 10) : incident;
          const formatUser = userName.length > 10 ? userName.substring(0, 10) : userName;
          const formatOffice = office.length > 10 ? office.substring(0, 10) : office;
          const formatUserInformation = userInformation.length > 10 ? userInformation.substring(0, 10) : userInformation;
          const formatObligation = obligation.length > 10 ? obligation.substring(0, 10) : obligation;
          const formatStatus = status.length > 10 ? status.substring(0, 10) : status;
          
          pdf += `| ${formatDate.padEnd(10)} | ${formatSource.padEnd(10)} | ${formatCategory.padEnd(10)} | ${formatSubCategory.padEnd(12)} | ${formatIncident.padEnd(10)} | ${formatUser.padEnd(10)} | ${formatOffice.padEnd(10)} | ${formatUserInformation.padEnd(10)} | ${formatObligation.padEnd(10)} | ${formatStatus.padEnd(10)} |\n`;
        });
        
        pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+------------+------------+\n';
      }
    }
    
    // Add footer
    pdf += '\n' + '='.repeat(80) + '\n';
    pdf += 'Report generated by D-Nothi Team & Activity Management System\n';
    pdf += new Date().toLocaleString() + '\n';
    
    return pdf;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('reports.title')}
      </Typography>
      
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
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('reports.taskReports')} icon={<SearchIcon />} />
          <Tab label={t('reports.leaveReports')} icon={<SearchIcon />} />
          <Tab label={t('reports.activityReports')} icon={<SearchIcon />} />
          <Tab label="BreakDown Report" icon={<SearchIcon />} />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 && t('reports.taskReports')}
              {activeTab === 1 && t('reports.leaveReports')}
              {activeTab === 2 && t('reports.activityReports')}
              {activeTab === 3 && 'BreakDown Report'}
            </Typography>
          </Grid>
          
          {activeTab !== 3 ? (
            // Original report filters
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={t('reports.startDate')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={t('reports.endDate')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('reports.reportType')}</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label={t('reports.reportType')}
                  >
                    <MenuItem value="task">{t('reports.taskReport')}</MenuItem>
                    <MenuItem value="leave">{t('reports.leaveReport')}</MenuItem>
                    <MenuItem value="summary">{t('reports.activityReport')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {t('reports.generateReport')}
                </Button>
              </Grid>
              
              {reportType !== 'summary' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="User ID (optional)"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status (optional)</InputLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        label="Status (optional)"
                      >
                        <MenuItem value="">All</MenuItem>
                        {reportType === 'task' ? (
                          <>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                          </>
                        ) : (
                          <>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </>
          ) : (
            // BreakDown Report filters
            <>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={breakdownTimeRange}
                    onChange={(e) => setBreakdownTimeRange(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="">Select Time Range</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={breakdownStartDate}
                  onChange={(e) => setBreakdownStartDate(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={breakdownEndDate}
                  onChange={(e) => setBreakdownEndDate(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Generate Report
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={breakdownUserId}
                    onChange={(e) => setBreakdownUserId(e.target.value)}
                    label="User"
                  >
                    <MenuItem value="">All Users</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>{user.fullName || user.username}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={breakdownSource}
                    onChange={(e) => setBreakdownSource(e.target.value)}
                    label="Source"
                  >
                    <MenuItem value="">All Sources</MenuItem>
                    {sources.map(source => (
                      <MenuItem key={source.id} value={source.value}>{source.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={breakdownCategory}
                    onChange={(e) => setBreakdownCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.value}>{category.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sub-Category</InputLabel>
                  <Select
                    value={breakdownSubCategory}
                    onChange={(e) => setBreakdownSubCategory(e.target.value)}
                    label="Sub-Category"
                  >
                    <MenuItem value="">All Sub-Categories</MenuItem>
                    {subCategories.map(subCategory => (
                      <MenuItem key={subCategory.id} value={subCategory.value}>{subCategory.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Incident</InputLabel>
                  <Select
                    value={breakdownIncident}
                    onChange={(e) => setBreakdownIncident(e.target.value)}
                    label="Incident"
                  >
                    <MenuItem value="">All Incidents</MenuItem>
                    {incidents.map(incident => (
                      <MenuItem key={incident.id} value={incident.value}>{incident.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Office</InputLabel>
                  <Select
                    value={breakdownOffice}
                    onChange={(e) => setBreakdownOffice(e.target.value)}
                    label="Office"
                  >
                    <MenuItem value="">All Offices</MenuItem>
                    {offices.map(office => (
                      <MenuItem key={office.id} value={office.value}>{office.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="User Information"
                  value={breakdownUserInformation}
                  onChange={(e) => setBreakdownUserInformation(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Obligation</InputLabel>
                  <Select
                    value={breakdownObligation}
                    onChange={(e) => setBreakdownObligation(e.target.value)}
                    label="Obligation"
                  >
                    <MenuItem value="">All Obligations</MenuItem>
                    {obligations.map(obligation => (
                      <MenuItem key={obligation.id} value={obligation.value}>{obligation.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<CsvIcon />}
                onClick={() => handleExport('csv')}
                disabled={loading}
              >
                Export CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ExcelIcon />}
                onClick={() => handleExport('xlsx')}
                disabled={loading}
              >
                Export Excel
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PdfIcon />}
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                Export PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Report Results */}
      {activeTab === 0 && taskReports.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Task Report Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Source</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Service</TableCell>
                  <TableCell align="center">User</TableCell>
                  <TableCell align="center">Office</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taskReports.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell align="center">{new Date(task.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{task.source}</TableCell>
                    <TableCell align="center">{task.category}</TableCell>
                    <TableCell align="center">{task.service}</TableCell>
                    <TableCell align="center">{task.userName}</TableCell>
                    <TableCell align="center">{task.office}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status)} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 1 && leaveReports.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Leave Report Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Employee</TableCell>
                  <TableCell align="center">Start Date</TableCell>
                  <TableCell align="center">End Date</TableCell>
                  <TableCell align="center">Reason</TableCell>
                  <TableCell align="center">User</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveReports.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell align="center">{leave.userName}</TableCell>
                    <TableCell align="center">{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{leave.reason}</TableCell>
                    <TableCell align="center">{leave.userName}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={leave.status} 
                        color={getStatusColor(leave.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">{leave.approvedByName || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 2 && Object.keys(activityReports).length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Summary Report Results
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Task Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityReports.tasks && activityReports.tasks.map((stat) => (
                      <TableRow key={stat.status}>
                        <TableCell align="center">{stat.status}</TableCell>
                        <TableCell align="center">{stat.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Leave Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityReports.leaves && activityReports.leaves.map((stat) => (
                      <TableRow key={stat.status}>
                        <TableCell align="center">{stat.status}</TableCell>
                        <TableCell align="center">{stat.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {activeTab === 3 && breakdownReports.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            BreakDown Report Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Source</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Sub-Category</TableCell>
                  <TableCell align="center">Incident</TableCell>
                  <TableCell align="center">User</TableCell>
                  <TableCell align="center">Office</TableCell>
                  <TableCell align="center">User Information</TableCell>
                  <TableCell align="center">Obligation</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breakdownReports.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell align="center">{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="center">{task.source || 'N/A'}</TableCell>
                    <TableCell align="center">{task.category || 'N/A'}</TableCell>
                    <TableCell align="center">{task.subCategory || 'N/A'}</TableCell>
                    <TableCell align="center">{task.incident || 'N/A'}</TableCell>
                    <TableCell align="center">{task.userName || 'N/A'}</TableCell>
                    <TableCell align="center">{task.office || 'N/A'}</TableCell>
                    <TableCell align="center">{task.userInformation || 'N/A'}</TableCell>
                    <TableCell align="center">{task.obligation || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={task.status || 'N/A'} 
                        color={getStatusColor(task.status)} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ReportManagement;