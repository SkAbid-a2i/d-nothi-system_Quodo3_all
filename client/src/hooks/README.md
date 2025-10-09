# Reusable Hooks and Components

This directory contains reusable hooks and components that can be used across different parts of the application.

## User Filter Hook (`useUserFilter.js`)

A custom hook that fetches and manages user data for filter dropdowns, specifically designed for admin roles.

### Usage

```javascript
import useUserFilter from '../hooks/useUserFilter';
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user } = useAuth();
  const { users, loading, error, fetchUsers } = useUserFilter(user);
  
  // users: Array of user objects formatted for dropdown
  // loading: Boolean indicating if users are being fetched
  // error: Error message if fetching failed
  // fetchUsers: Function to manually refresh users
  
  return (
    // Your component JSX
  );
};
```

### Features

- Automatically fetches users for admin roles (SystemAdmin, Admin, Supervisor)
- Formats user data for dropdown components
- Handles loading and error states
- Provides manual refresh capability

## User Filter Dropdown Component (`UserFilterDropdown.js`)

A reusable Material-UI Autocomplete component for user filtering.

### Usage

```javascript
import UserFilterDropdown from '../components/UserFilterDropdown';

const MyComponent = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  return (
    <UserFilterDropdown
      users={usersArray}
      selectedUser={selectedUser}
      onUserChange={setSelectedUser}
      label="Filter by User"
      loading={loadingState}
      gridSize={{ xs: 12, sm: 6, md: 4 }}
    />
  );
};
```

### Props

- `users`: Array of user objects for the dropdown options
- `selectedUser`: Currently selected user object
- `onUserChange`: Callback function when user selection changes
- `label`: Label for the dropdown (default: "Filter by User")
- `loading`: Loading state for the dropdown
- `gridSize`: Grid size configuration (default: { xs: 12, sm: 6, md: 4 })

## Integration Example

To use these in a new component:

1. Import the hook and component:
```javascript
import useUserFilter from '../hooks/useUserFilter';
import UserFilterDropdown from '../components/UserFilterDropdown';
import { useAuth } from '../contexts/AuthContext';
```

2. Use the hook to fetch user data:
```javascript
const { user } = useAuth();
const { users, loading, error } = useUserFilter(user);
```

3. Use the component for the dropdown:
```javascript
<UserFilterDropdown
  users={users}
  selectedUser={selectedUser}
  onUserChange={handleUserChange}
  loading={loading}
/>
```

This approach ensures consistent user filtering functionality across the application while maintaining clean, reusable code.