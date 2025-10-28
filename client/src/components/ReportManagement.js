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
import { reportAPI } from '../services/api';
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
  
  const [taskReports, setTaskReports] = useState([]);
  const [leaveReports, setLeaveReports] = useState([]);
  const [activityReports, setActivityReports] = useState([]);

  useEffect(() => {
    // Reset reports when tab changes
    setTaskReports([]);
    setLeaveReports([]);
    setActivityReports([]);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
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
        reportType: activeTab === 0 ? 'Task' : activeTab === 1 ? 'Leave' : 'Summary'
      };
      
      // Get the appropriate data based on the active tab
      if (activeTab === 0) {
        exportData.tasks = taskReports;
      } else if (activeTab === 1) {
        exportData.leaves = leaveReports;
      } else {
        exportData.summary = activityReports;
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
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 && t('reports.taskReports')}
              {activeTab === 1 && t('reports.leaveReports')}
              {activeTab === 2 && t('reports.activityReports')}
            </Typography>
          </Grid>
          
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
    </Box>
  );
};

export default ReportManagement;