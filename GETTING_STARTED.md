# Getting Started with Quodo3

This guide will help you set up and run Quodo3 on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

## Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quodo3
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Set up MongoDB
Follow the instructions in [MONGODB_SETUP.md](MONGODB_SETUP.md) to install and configure MongoDB.

### 5. Configure Environment Variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file and update the values:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quodo3
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
```

Create a `.env` file in the client directory:
```bash
cd client
cp .env.example .env
cd ..
```

Edit `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start the Development Servers

#### Option A: Start servers separately
In one terminal, start the backend:
```bash
npm run dev
```

In another terminal, start the frontend:
```bash
cd client
npm start
```

#### Option B: Start both servers with one command
```bash
npm run dev:all
```

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default User Credentials

After setting up the database and running the seed script, you can log in with:

**Username**: admin
**Password**: admin123
**Role**: System Administrator

## Running Tests

### Backend Tests
```bash
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## Seeding Initial Data

To populate the database with default data:
```bash
npm run seed
```

This will create:
- A default admin user
- Default dropdown values for forms

## Project Structure Overview

```
quodo3/
├── client/          # Frontend React application
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── validators/      # Input validation
├── scripts/         # Utility scripts
├── uploads/         # File uploads
├── __tests__/       # Test files
├── server.js        # Main server file
└── package.json     # Project dependencies
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server |
| `npm run dev` | Start the backend server in development mode |
| `npm run dev:all` | Start both frontend and backend servers |
| `npm test` | Run backend tests |
| `npm run seed` | Seed the database with initial data |
| `npm run check-setup` | Verify project setup |
| `cd client && npm start` | Start the frontend development server |
| `cd client && npm test` | Run frontend tests |

## Troubleshooting

### Server won't start
- Ensure all dependencies are installed (`npm install`)
- Check that MongoDB is running
- Verify environment variables are set correctly

### Frontend not connecting to backend
- Check that the backend server is running
- Verify `REACT_APP_API_URL` in `client/.env`
- Check browser console for CORS or network errors

### Database connection errors
- Ensure MongoDB is installed and running
- Verify `MONGODB_URI` in `.env`
- Check MongoDB logs for errors

### Tests failing
- Ensure the test database is accessible
- Check that all dependencies are installed
- Verify test environment variables

## Next Steps

1. Explore the application by logging in with the default admin credentials
2. Create additional users with different roles
3. Test all functionality for each user role
4. Review the API documentation in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
5. Check the system architecture in [ARCHITECTURE.md](ARCHITECTURE.md)
6. Review deployment options in [DEPLOYMENT.md](DEPLOYMENT.md)

## Getting Help

If you encounter any issues:
1. Check the documentation files in the project root
2. Review the console output for error messages
3. Ensure all prerequisites are installed and running
4. Refer to the troubleshooting section above

For additional help, you can:
- Open an issue on the GitHub repository
- Contact the development team
- Refer to the official documentation for the technologies used