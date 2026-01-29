# E-Commerce Website with Auto-Sync to GitHub

This E-Commerce website now includes automatic saving and syncing of admin panel updates to GitHub.

## Features

- **Admin Panel**: Manage inventory, sales, and financial reports
- **Auto-Save**: All changes made in the admin panel are automatically saved to JSON files
- **GitHub Sync**: Changes are automatically committed and pushed to GitHub using a PowerShell script

## Setup Instructions

### 1. Install Node.js (if not already installed)

Download and install Node.js from https://nodejs.org/

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

The server will run on http://localhost:3000

### 4. Run the Auto-Commit Script

Open PowerShell in the project directory and run:

```powershell
.\auto_commit_push.ps1
```

This script will monitor file changes and automatically commit and push to GitHub.

## Usage

1. Open http://localhost:3000/admin.html in your browser
2. Login with username: `finance`, password: `admin123`
3. Make changes in the admin panel (edit inventory, mark orders as delivered, etc.)
4. Changes are automatically saved to JSON files and synced to GitHub

## Files Added/Modified

- `server.js`: Node.js server for data persistence
- `package.json`: Dependencies for the server
- `admin.js`: Modified to use server API instead of localStorage
- `auto_commit_push.ps1`: PowerShell script for auto-commit and push
- `README.md`: This documentation

## Data Storage

- Inventory data: `inventory.json`
- Sales data: `sales.json`

These files are created automatically when the server runs and data is saved.

## Security Note

This is a demo implementation. In production, you should:
- Use proper authentication
- Implement HTTPS
- Add input validation
- Use a database instead of JSON files
- Secure the admin credentials
