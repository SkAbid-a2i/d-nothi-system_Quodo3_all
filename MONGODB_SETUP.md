# MongoDB Setup Guide

## Option 1: Install MongoDB Locally (Windows)

1. Download MongoDB Community Server:
   - Visit https://www.mongodb.com/try/download/community
   - Select Windows as your operating system
   - Download the MSI installer

2. Install MongoDB:
   - Run the downloaded MSI file
   - Follow the installation wizard
   - Choose "Complete" setup type
   - Select "Run service as Network Service user"
   - Choose the default data directory or specify a custom one
   - Complete the installation

3. Start MongoDB Service:
   - The MongoDB service should start automatically after installation
   - You can verify this by opening Services (services.msc) and looking for "MongoDB Server"

4. Test the Connection:
   - Open a new Command Prompt
   - Run: `mongo` or `mongosh`
   - If you see a MongoDB shell prompt, the installation was successful

## Option 2: Use MongoDB Atlas (Cloud)

1. Sign up for MongoDB Atlas:
   - Visit https://www.mongodb.com/cloud/atlas
   - Create a free account

2. Create a Cluster:
   - Select "Shared" tier (free)
   - Choose a cloud provider and region
   - Create your cluster (this may take a few minutes)

3. Configure Database User:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a user with read and write permissions

4. Configure Network Access:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can add your current IP or allow access from anywhere (0.0.0.0/0)

5. Get Connection String:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. Update Environment Variables:
   - Open the `.env` file in your project root
   - Update the `MONGODB_URI` with your Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/quodo3?retryWrites=true&w=majority
     ```

## Option 3: Use Docker (If you have Docker installed)

1. Pull MongoDB Docker Image:
   ```
   docker pull mongo
   ```

2. Run MongoDB Container:
   ```
   docker run --name mongodb -p 27017:27017 -d mongo
   ```

3. The database will be available at `mongodb://localhost:27017`

## Verifying Your Setup

After setting up MongoDB using any of the above methods:

1. Restart your backend server:
   ```
   npm start
   ```

2. Check the console output for:
   ```
   Server is running on port 5000
   Connected to MongoDB database
   ```

3. Test the API:
   - Visit http://localhost:5000 in your browser
   - You should see a JSON response indicating the server is running

## Troubleshooting

### Connection Issues
- Ensure MongoDB service is running
- Check if the port (27017) is not blocked by firewall
- Verify the connection string in your `.env` file

### Authentication Issues
- Double-check your username and password
- Ensure your database user has proper permissions

### Windows-Specific Issues
- Make sure MongoDB is added to your system PATH
- Run Command Prompt as Administrator if needed