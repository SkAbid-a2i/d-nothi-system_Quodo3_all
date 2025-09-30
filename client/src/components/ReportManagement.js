import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  GridOn as ExcelIcon
} from '@mui/icons-material';
import { reportAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';

const ReportManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('task');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  
  const [taskReports, setTaskReports] = useState([]);
  const [leaveReports, setLeaveReports] = useState([]);
  const [summaryReports, setSummaryReports] = useState({});

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
      
      if (reportType === 'task') {
        const response = await reportAPI.getTaskReport(params);
        setTaskReports(response.data);
        // Log audit entry
        auditLog.reportExported('Task Report', 'generated', user?.username || 'unknown');
      } else if (reportType === 'leave') {
        const response = await reportAPI.getLeaveReport(params);
        setLeaveReports(response.data);
        // Log audit entry
        auditLog.reportExported('Leave Report', 'generated', user?.username || 'unknown');
      } else if (reportType === 'summary') {
        const response = await reportAPI.getSummaryReport(params);
        setSummaryReports(response.data);
        // Log audit entry
        auditLog.reportExported('Summary Report', 'generated', user?.username || 'unknown');
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
      const params = {
        startDate,
        endDate,
        userId: userId || undefined,
        status: status || undefined,
        format
      };
      
      let response;
      if (reportType === 'task') {
        response = await reportAPI.getTaskReport(params);
      } else if (reportType === 'leave') {
        response = await reportAPI.getLeaveReport(params);
      } else if (reportType === 'summary') {
        response = await reportAPI.getSummaryReport(params);
      }
      
      // In a real implementation, this would download the file
      // For now, we'll just log the action
      auditLog.reportExported(`${reportType} Report`, format, user?.username || 'unknown');
      
      setSuccess(`Report exported as ${format.toUpperCase()} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError(`Failed to export report as ${format.toUpperCase()}`);
      setTimeout(() => setError(''), 5000);
    }
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
                  <TableCell>Date</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taskReports.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{new Date(task.date).toLocaleDateString()}</TableCell>
                    <TableCell>{task.source}</TableCell>
                    <TableCell>{task.category}</TableCell>
                    <TableCell>{task.service}</TableCell>
                    <TableCell>{task.userName}</TableCell>
                    <TableCell>{task.office}</TableCell>
                    <TableCell>
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
                  <TableCell>Employee</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveReports.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.userName}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        color={getStatusColor(leave.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{leave.approvedByName || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 2 && Object.keys(summaryReports).length > 0 && (
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
                      <TableCell>Status</TableCell>
                      <TableCell>Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryReports.tasks && summaryReports.tasks.map((stat) => (
                      <TableRow key={stat.status}>
                        <TableCell>{stat.status}</TableCell>
                        <TableCell>{stat.count}</TableCell>
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
                      <TableCell>Status</TableCell>
                      <TableCell>Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryReports.leaves && summaryReports.leaves.map((stat) => (
                      <TableRow key={stat.status}>
                        <TableCell>{stat.status}</TableCell>
                        <TableCell>{stat.count}</TableCell>
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