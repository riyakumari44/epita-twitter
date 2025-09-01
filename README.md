# Epita Twitter - Full Stack Social Media Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

A comprehensive Twitter clone with full-stack functionality including authentication, tweets, polls, replies, retweets, media upload, and real-time features.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)  
- [Quick Start](#-quick-start)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🚀 Features

### ✅ **Implemented Features**
- **Authentication**: JWT-based login/register system
- **User Profiles**: Profile management with image uploads
- **Tweets**: Create, edit, delete tweets with media support
- **Media Upload**: Images and videos via Cloudinary integration
- **Polls**: Create and vote on polls with real-time results
- **Replies**: Comment on tweets with full thread support
- **Retweets**: Share tweets with optional comments
- **Real-time Updates**: Live feed updates and notifications
- **Search**: User search functionality with filters
- **Location**: Add location to tweets with geolocation
- **Responsive Design**: Mobile-first responsive interface

### 🔧 **Technical Features**
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Frontend**: React with modern hooks
- **File Storage**: Cloudinary for media
- **Security**: JWT authentication, input validation
- **API**: RESTful with consistent response format
- **Development**: Hot reload, auto-compilation

## 📋 Prerequisites

Before setting up the project, ensure you have:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** for version control

### Required Accounts
- **Cloudinary Account** - [Sign up here](https://cloudinary.com/) (for media uploads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/epita-twitter.git
cd epita-twitter
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd back-end
npm install

# Install frontend dependencies  
cd ../front-end
npm install
```

### 3. Environment Setup
```bash
# Copy environment files
cd ../back-end
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb epita_twitter

# Run migrations (see Database Setup section for details)
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend (from back-end directory)
npm run start:dev

# Terminal 2: Start frontend (from front-end directory) 
npm start
```

Your application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🗄️ Database Setup

### 1. Install PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Access PostgreSQL shell
sudo -u postgres psql

# Or on macOS/Windows:
psql postgres
```

```sql
-- Create database
CREATE DATABASE epita_twitter;

-- Create user (optional)
CREATE USER twitter_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE epita_twitter TO twitter_user;

-- Connect to database
\c epita_twitter;

-- Exit
\q

-- Exit
\q
```

### 3. Run Database Migrations

Connect to your database and run migrations in order:

```bash
# Connect to database
psql -h localhost -U postgres -d epita_twitter
```

```sql
-- Run migrations in this order:
\i back-end/migration-create-polls-tables.sql
\i back-end/migration-create-replies-table.sql  
\i back-end/migration-create-retweets-table.sql
\i back-end/migration-add-profile-fields.sql
\i back-end/migration-update-tweet-type-enum.sql
```

## 🔧 Backend Setup

### 1. Environment Configuration

Create `.env` file in `back-end` directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=epita_twitter

# JWT Configuration  
JWT_SECRET=your_very_long_512_bit_secret_key_here_make_it_secure

# Cloudinary Configuration (Required for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=8000
NODE_ENV=development
```

### 2. Install Dependencies & Start

```bash
cd back-end

# Install dependencies
npm install

# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run start:prod

# Run tests
npm test
```

### 3. Verify Backend Setup

Test the API endpoints:

```bash
# Health check
curl http://localhost:8000/api

# Register a test user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

## PostgreSQL Database Setup Commands

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE epita_twitter;

-- Create user (optional)
CREATE USER epita_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE epita_twitter TO epita_user;
```

## Testing the Application

1. **Start both servers** (backend on port 5001, frontend on port 3000)

2. **Test Registration:**
   - Click "Sign up" on the splash screen
   - Fill in username, email, and password
   - Submit the form
   - Check browser console and PostgreSQL for user creation

3. **Test Login:**
   - Click "Log in" on the splash screen
   - Use the email and password from registration
   - Submit the form
   - Check browser console for authentication token

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `profilePicture` (Text)
- `bio` (String, max 160 chars)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Project Structure

```
epita-twitter/
├── back-end/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── front-end/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── SplashScreen.js
│   │   └── ...
│   └── package.json
```

## Next Steps

1. **Add main dashboard** after successful login
2. **Implement tweet functionality**
3. **Add user profiles and following system**
4. **Add real-time features with Socket.io**
5. **Deploy to production**

## Troubleshooting

- **CORS errors**: Make sure backend CORS is configured for frontend URL
- **Connection errors**: Check if both servers are running
- **Database errors**: Ensure MongoDB is running and connection string is correct
- **Authentication errors**: Check JWT_SECRET in environment variables
# epita-twitter
