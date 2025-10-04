return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Key Metrics Cards - First Row */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Tasks
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalTasks}
                      </Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Leaves
                      </Typography>
                      <Typography variant="h4">
                        {stats.pendingLeaves}
                      </Typography>
                    </Box>
                    <EventAvailable sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        On Leave Today
                      </Typography>
                      <Typography variant="h4">
                        {stats.todaysLeaves}
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Users
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <GroupIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Approved Leaves
                      </Typography>
                      <Typography variant="h4">
                        {stats.approvedLeaves}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Task Distribution - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </Typography>
              <Box>
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setChartType('pie')}
                  size="small"
                >
                  <PieChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'bar' ? 'primary' : 'default'}
                  onClick={() => setChartType('bar')}
                  size="small"
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setChartType('line')}
                  size="small"
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
            </Box>
          </Paper>
        </Grid>
        
        {/* Team Performance Section */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Team Performance
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={getTeamPerformanceData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="tasks"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTeamPerformanceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Summary:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                    <Typography variant="h6">
                      {users.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Active Tasks
                    </Typography>
                    <Typography variant="h6">
                      {tasks.filter(t => t.status !== 'Completed').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {tasks.filter(t => t.status === 'Completed').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Leaves
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {leaves.filter(l => l.status === 'Pending').length}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Filters and Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
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
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Filter by User"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon fontSize="small" />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
            </Grid>
          </Paper>
        </Grid>
        
        {/* Data Tables */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
              <Tab label="Team Tasks" icon={<Assignment />} iconPosition="start" />
              <Tab label="Pending Leaves" icon={<EventAvailable />} iconPosition="start" />
              <Tab label="Who's on Leave Today" icon={<CalendarToday />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTeamTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.userName || 'N/A'}</TableCell>
                          <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{task.source || 'N/A'}</TableCell>
                          <TableCell>{task.category || 'N/A'}</TableCell>
                          <TableCell>{task.service || 'N/A'}</TableCell>
                          <TableCell>{task.description || 'N/A'}</TableCell>
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
              )}
              
              {activeTab === 1 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPendingLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.userName || 'N/A'}</TableCell>
                          <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.reason || 'N/A'}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {activeTab === 2 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getTodaysLeaves().map((leave) => (
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
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
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

export default AdminDashboard;