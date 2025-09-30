# D-Nothi Task Management System - Frontend

## Overview

This is the frontend implementation of the D-Nothi Task Management System, built with React and Material-UI. The system provides role-based access control with different dashboards and functionalities for Agents, Admins, Supervisors, and SystemAdmins.

## Features Implemented

### 1. Authentication & Routing
- Role-based login with automatic redirects
- Protected routes based on user roles
- Responsive sidebar navigation

### 2. Dashboard Components
- **Agent Dashboard**
  - Personal task overview
  - Task history with filtering and export options
  - Leave summary and history
  - Chart visualizations (Pie, Bar, Line)
  - Time range filters (daily/weekly/monthly/yearly)

- **Admin/Supervisor Dashboard**
  - Team task monitoring
  - Pending leave approval queue
  - Customizable widgets
  - Team performance charts
  - Export capabilities (CSV, Excel, PDF)

- **SystemAdmin Console**
  - User management (create, edit, disable users)
  - Role assignment and office scoping
  - Permission template management
  - Dropdown value management

### 3. Task Management
- Dynamic searchable dropdowns for Source, Category, and Office
- Dependent dropdowns (Category → Service)
- File upload with progress tracking and quota management
- Default datetime set to current time
- Task creation, editing, and deletion

### 4. Leave Management
- Leave request submission
- Admin approval/rejection workflow
- Leave history tracking
- Calendar view integration

### 5. File Management
- File upload with storage quota monitoring
- File listing with search and filter
- Download and delete functionality
- File type categorization

### 6. Help & Support
- Video tutorial integration
- User guide documentation
- FAQ section
- Multilanguage support (English/Bengali)

### 7. Settings
- Profile management
- Security settings (password change, 2FA)
- Application preferences (language, theme)
- Notification controls

## Technology Stack

- **Frontend Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── AgentDashboard.js
│   │   ├── AdminDashboard.js
│   │   ├── Dashboard.js
│   │   ├── Files.js
│   │   ├── Help.js
│   │   ├── Layout.js
│   │   ├── LeaveManagement.js
│   │   ├── Login.js
│   │   ├── ProtectedRoute.js
│   │   ├── ReportManagement.js
│   │   ├── Settings.js
│   │   ├── TaskLogger.js
│   │   ├── TaskManagement.js
│   │   └── UserManagement.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Role-Based Access Control

### Roles and Permissions

1. **Agent**
   - View personal dashboard
   - Manage own tasks
   - Submit leave requests
   - Access help and settings

2. **Supervisor/Admin**
   - All Agent permissions
   - View team tasks
   - Approve/reject leave requests
   - Manage team performance data
   - Customize dashboard widgets

3. **SystemAdmin**
   - All Admin permissions
   - Create/disable users
   - Assign roles and office scoping
   - Manage permission templates
   - Configure dropdown values

## Component Details

### TaskLogger.js
Implements the task creation form with:
- Dynamic searchable dropdowns using Autocomplete
- Dependent Category → Service dropdowns
- File upload with progress tracking
- Storage quota validation
- Default datetime initialization

### UserManagement.js
Provides SystemAdmin functionality for:
- User creation and management
- Role assignment
- Status toggling (active/inactive)
- Office scoping
- Permission template management

### Layout.js
Implements the main application layout with:
- Role-based sidebar navigation
- Dark/light mode toggle
- User logout functionality
- Responsive design

## API Integration

The frontend integrates with the backend through the `api.js` service layer, which provides:

- Authentication endpoints
- User management endpoints
- Task management endpoints
- Leave management endpoints
- Dropdown value endpoints
- Report generation endpoints

## Multilanguage Support

The application supports both English and Bengali languages, with language toggle functionality in:
- Settings component
- Help component

## Deployment

The application is configured for deployment on:
- Netlify (frontend)
- Render (backend)
- TiDB Cloud (database)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the client directory with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Future Enhancements

1. Real-time notifications
2. Advanced reporting features
3. Mobile-responsive design improvements
4. Enhanced file management capabilities
5. Integration with external calendar systems
6. Advanced analytics and insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.