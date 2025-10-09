import React from 'react';
import { 
  Grid, 
  TextField, 
  Autocomplete 
} from '@mui/material';

/**
 * Reusable User Filter Dropdown Component
 * @param {Object} props - Component props
 * @param {Array} props.users - Array of user objects for the dropdown
 * @param {Object} props.selectedUser - Currently selected user
 * @param {Function} props.onUserChange - Callback when user selection changes
 * @param {string} props.label - Label for the dropdown
 * @param {boolean} props.loading - Loading state
 * @param {string} props.gridSize - Grid size configuration
 * @returns {JSX.Element} User filter dropdown component
 */
const UserFilterDropdown = ({
  users = [],
  selectedUser = null,
  onUserChange,
  label = "Filter by User",
  loading = false,
  gridSize = { xs: 12, sm: 6, md: 4 }
}) => {
  return (
    <Grid item {...gridSize}>
      <Autocomplete
        key={`user-filter-${users.length}-${JSON.stringify(users.slice(0, 5))}`}
        options={users}
        getOptionLabel={(option) => {
          if (!option) return '';
          return option.label || (option.fullName || option.username || option.email) + ' (' + (option.username || option.email) + ')' || 'Unknown User';
        }}
        value={selectedUser}
        onChange={(event, newValue) => {
          console.log('User selected:', newValue);
          onUserChange(newValue);
        }}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label={label} 
            fullWidth 
            disabled={loading}
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        noOptionsText="No users found"
        loading={loading}
      />
    </Grid>
  );
};

export default UserFilterDropdown;