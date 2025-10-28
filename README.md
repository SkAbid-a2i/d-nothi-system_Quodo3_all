# Quodo3 - Task, Leave and User Management System

A comprehensive web application for organizations to manage tasks, leaves, reports, and user roles in a secure and efficient way.

## Features

### Enhanced Features
- **Email Notifications**: Automatic email notifications for leave requests, approvals, and rejections
- **Storage Quota Management**: Proper backend validation for file upload quotas
- **Permission Templates**: Comprehensive permission template management for role-based access
- **Full Dropdown Management**: Complete CRUD operations for dropdown values with dependent dropdowns
- **Advanced Reporting**: Export reports in CSV, Excel, and PDF formats
- **Multilanguage Support**: Full application support for English and Bengali languages

### User Roles
- **System Administrator (SystemAdmin)**: Can create and disable users, assign roles, and decide what different users can access.
- **Administrator (Admin)**: Can oversee team activities, approve or reject leaves, manage dropdown values, and view reports.
- **Supervisor**: Similar to Admin but with a focus on their assigned office or team.
- **Agent**: Can only manage their own tasks, dashboard, and leave requests.

### Key Features

#### Login & Access
- Secure login system
- Role-based access control
- Redirects users to their own dashboards based on role

#### Dashboards
- **Agent Dashboard**: Track own tasks, view graphs, history table with search and export, quick leave summary
- **Admin & Supervisor Dashboard**: See all team members' tasks and leaves, filter by user/date/category/status, pending leave requests overview, customizable dashboard blocks, export team-wide reports

#### Task Management
- Task entry form with date, source, category, service, user info, office, description, status, comments, and file upload
- File uploads limited by a per-user storage quota
- Dropdowns for Category → Service must be dependent and searchable
- Every task update or deletion is logged with "who did what and when"

#### Leave Management
- Form to request leave with dates and reason
- Admin/Supervisor approval or rejection
- Calendar view of leave schedules
- Email notifications for leave requests, approvals, and rejections
- Notifications for updates
- Full history of leave requests per user

#### Admin Console & Management Tools
- **User Privileges**: SystemAdmin defines what Admins and Supervisors can do via permission templates
- **Drop-Down Management**: Admin/Supervisor can add/update/delete dropdown options with full CRUD operations
- **Report Management & Analysis**: Reports for tasks, leaves, and activity, exportable in CSV, Excel, and PDF formats

#### Help / Tutorial Section
- Guidance in English and Bangla (multilanguage support)
- Video or link tutorials
- Info icons for on-page explanations

## Design & Style
- Modern, material-inspired design
- Light/Dark mode toggle
- Sidebar for easy navigation
- Brand colors: Lavender, Pale Green, Medium Aquamarine
- Logo: D-Nothi

## Technology Stack

### Backend
- Node.js with Express.js
- TiDB (MySQL-compatible cloud database) via Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React.js with React Router
- Material-UI for UI components
- Axios for API calls

## Deployment & Hosting
- Database: TiDB (cloud database)
- Backend: Render (free service)
- Frontend: Vercel (modern and fast deployment)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- TiDB Cloud account

### TiDB Setup
1. Create a TiDB cluster on [TiDB Cloud](https://tidbcloud.com/)
2. Get your connection details (host, port, user, password, database name)
3. Update the environment variables in the backend [.env](file:///d:/Project/Quodo3/.env) file with your TiDB credentials

### Backend Setup
1. Navigate to the project root directory
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Update the `.env` file with your TiDB credentials
5. Start the server: `npm start` or `npm run dev` for development
6. Create the initial admin user: `node scripts/create-admin.js`

### Frontend Setup
1. Navigate to the `client` directory
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server: `npm start`

## Deployment Instructions

See [DEPLOYMENT_VERCEL_RENDER.md](DEPLOYMENT_VERCEL_RENDER.md) for detailed deployment instructions for Vercel + Render setup.

## Environment Variables

### Backend (.env)
```
# Database Configuration
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=4VmPGSU3EFyEhLJ.root
DB_PASSWORD=your_tidb_password
DB_NAME=d_nothi_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=D-Nothi Team & Activity Management <no-reply@d-nothi.com>

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=https://d-nothi-system-quodo3-all.vercel.app
```

### Frontend (client/.env)
```
REACT_APP_API_URL=https://quodo3-backend.onrender.com/api
```

## Project Structure

```
quodo3/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   ├── .env                # Environment variables
│   └── package.json        # Frontend dependencies
├── config/                 # Configuration files
├── middleware/             # Express middleware
├── models/                 # Sequelize models
├── routes/                 # Express routes
├── scripts/                # Utility scripts
├── validators/             # Validation schemas
├── uploads/                # File uploads directory
├── .env                    # Backend environment variables
├── server.js               # Express server entry point
├── package.json            # Backend dependencies
└── README.md               # Project documentation
```

## Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure HTTP headers with Helmet
- Comprehensive audit logging for all CRUD operations
- Email notification security with app passwords
- Proper authorization checks for all operations

## Key Expectations
- The system keeps a history of all critical actions (audit log)
- Reports are easy to export and share
- The solution is secure, stable, and simple to maintain
- All sensitive information remains protected
- System remains flexible enough to be managed by a general IT user

## License
This project is licensed under the MIT License.