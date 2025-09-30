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
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'System Administrator',
      role: 'SystemAdmin',
      office: 'Head Office',
      isActive: true
    },
    {
      id: 2,
      username: 'johndoe',
      email: 'john@example.com',
      fullName: 'John Doe',
      role: 'Admin',
      office: 'Dhaka Branch',
      isActive: true
    },
    {
      id: 3,
      username: 'janesmith',
      email: 'jane@example.com',
      fullName: 'Jane Smith',
      role: 'Agent',
      office: 'Dhaka Branch',
      isActive: false
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive } 
        : user
    ));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      {/* User Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New User
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role">
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SystemAdmin">System Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Office"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<AddIcon>}>
              Create User
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* User Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select 
                label="Role" 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SystemAdmin">System Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select 
                label="Status" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" fullWidth>
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* User List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Office</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={
                      user.role === 'SystemAdmin' ? 'error' : 
                      user.role === 'Admin' ? 'primary' : 
                      user.role === 'Supervisor' ? 'secondary' : 'default'
                    } 
                  />
                </TableCell>
                <TableCell>{user.office}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleStatus(user.id)}
                        color="primary"
                      />
                    }
                    label={user.isActive ? 'Active' : 'Inactive'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;