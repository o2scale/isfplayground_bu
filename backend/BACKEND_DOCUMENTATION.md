# ISF Playground Backend Documentation

## Overview
The ISF Playground backend is a Node.js/Express.js application with MongoDB as the database. It provides APIs for managing students, tasks, sports activities, music training, machine management, and various other educational activities.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with AWS S3 integration
- **Logging**: Pino logger
- **Documentation**: Swagger/OpenAPI
- **Face Recognition**: Face-api.js with TensorFlow.js

### Project Structure
```
backend/
├── config/           # Configuration files
├── constants/        # Application constants
├── controllers/      # Request handlers
├── data-access/      # Database operations
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── db/              # Database setup and dumps
├── weights/         # ML model weights
├── uploads/         # File upload directory
└── logs/            # Application logs
```

## 📁 Directory Structure & Components

### 1. Configuration (`config/`)
- **`db.js`**: MongoDB connection configuration
- **`pino-config.js`**: Logging configuration with Pino

### 2. Constants (`constants/`)
- **`general.js`**: General application constants
- **`users.js`**: User-related constants and enums

### 3. Controllers (`controllers/`)
Handle HTTP requests and responses:

- **`userController.js`** (27KB, 983 lines)
  - User management operations
  - Student registration and updates
  - Profile management

- **`taskController.js`** (22KB, 827 lines)
  - Task creation and management
  - Task assignment and tracking

- **`sports.js`** (18KB, 680 lines)
  - Sports activities management
  - Training session tracking

- **`music.js`** (18KB, 678 lines)
  - Music training management
  - Instrument assignments

- **`machineController.js`** (16KB, 530 lines)
  - Machine management
  - Equipment tracking

- **`purchaseAndRepair.js`** (13KB, 489 lines)
  - Purchase order management
  - Repair request handling

- **`studentMoodTrackerController.js`** (8.8KB, 346 lines)
  - Student mood tracking
  - Emotional well-being monitoring

- **`balagruha.js`** (7.9KB, 312 lines)
  - Balagruha (playground) management
  - Activity scheduling

- **`roleController.js`** (4.1KB, 145 lines)
  - Role-based access control
  - Permission management

### 4. Data Access Layer (`data-access/`)
Database operations and queries:

- **`User.js`** (33KB, 1446 lines) - User data operations
- **`task.js`** (9.1KB, 378 lines) - Task data operations
- **`trainingSession.js`** (3.8KB, 172 lines) - Training session data
- **`balagruha.js`** (3.2KB, 138 lines) - Balagruha data operations
- **`machines.js`** (2.8KB, 120 lines) - Machine data operations
- **`repairRequests.js`** (2.1KB, 74 lines) - Repair request data
- **`studentMoodTracker.js`** (1.9KB, 81 lines) - Mood tracking data
- **`sportsTask.js`** (1.5KB, 69 lines) - Sports task data
- **`purchaseOrder.js`** (1.5KB, 53 lines) - Purchase order data
- **`medicalRecords.js`** (936B, 38 lines) - Medical records data
- **`attendance.js`** (1.3KB, 51 lines) - Attendance tracking data

### 5. Models (`models/`)
Mongoose schemas and data models:

- **`user.js`** (3.9KB, 154 lines) - User schema
- **`task.js`** (2.7KB, 91 lines) - Task schema
- **`sportsTasks.js`** (2.0KB, 67 lines) - Sports task schema
- **`medical.js`** (1.5KB, 56 lines) - Medical records schema
- **`trainingSession.js`** (1.2KB, 36 lines) - Training session schema
- **`repairRequests.js`** (1.1KB, 37 lines) - Repair request schema
- **`machineactivelog.js`** (1.0KB, 54 lines) - Machine activity log
- **`purchaseOrders.js`** (987B, 31 lines) - Purchase order schema
- **`studentMoodTracker.js`** (942B, 41 lines) - Mood tracker schema
- **`machineAssignment.js`** (864B, 43 lines) - Machine assignment schema
- **`student.js`** (856B, 28 lines) - Student schema
- **`balagruha.js`** (692B, 32 lines) - Balagruha schema
- **`attendance.js`** (609B, 23 lines) - Attendance schema
- **`role.js`** (505B, 21 lines) - Role schema
- **`machine.js`** (747B, 41 lines) - Machine schema
- **`activitylog.js`** (411B, 15 lines) - Activity log schema

### 6. Routes (`routes/`)
API endpoint definitions:

#### Main Routes
- **`auth.js`** (11KB, 398 lines) - Authentication routes
- **`userRoutes.js`** (5.9KB, 234 lines) - User management routes
- **`roleRoutes.js`** (7.8KB, 292 lines) - Role management routes
- **`taskRoutes.js`** (3.4KB, 123 lines) - Task management routes
- **`studentMoodTrackerRoutes.js`** (1.1KB, 39 lines) - Mood tracking routes

#### Version 1 Routes (`routes/v1/`)
- **`user.js`** (3.2KB, 122 lines) - V1 user routes
- **`sports.js`** (2.7KB, 109 lines) - Sports management routes
- **`music.js`** (2.7KB, 109 lines) - Music training routes
- **`purchaseAndRepair.js`** (3.0KB, 118 lines) - Purchase/repair routes
- **`machines.js`** (1.3KB, 63 lines) - Machine management routes
- **`balagruha.js`** (1.0KB, 52 lines) - Balagruha routes
- **`trainingSession.js`** (1.2KB, 50 lines) - Training session routes

### 7. Services (`services/`)
Business logic layer:

- **`task.js`** (27KB, 988 lines) - Task business logic
- **`student.js`** (27KB, 816 lines) - Student business logic
- **`sportsTask.js`** (21KB, 719 lines) - Sports task logic
- **`musicTask.js`** (20KB, 689 lines) - Music task logic
- **`user.js`** (12KB, 458 lines) - User business logic
- **`balagruha.js`** (6.8KB, 252 lines) - Balagruha business logic
- **`studentMoodTracker.js`** (4.6KB, 211 lines) - Mood tracking logic
- **`trainingSession.js`** (3.5KB, 121 lines) - Training session logic
- **`attendenance.js`** (2.4KB, 89 lines) - Attendance logic
- **`medicalRecords.js`** (1.4KB, 56 lines) - Medical records logic

#### Subdirectories
- **`purchaseAndRepair/`**
  - `repairRequests.js` (3.3KB, 111 lines)
  - `purchaseOrder.js` (6.2KB, 201 lines)
- **`aws/`**
  - `s3.js` (2.3KB, 80 lines) - AWS S3 integration

### 8. Middleware (`middleware/`)
Custom Express middleware:

- **`auth.js`** (2.7KB, 111 lines) - JWT authentication middleware
- **`checkPermission.js`** (1.1KB, 44 lines) - Permission checking
- **`upload.js`** (1.2KB, 45 lines) - File upload middleware

### 9. Utilities (`utils/`)
- **`helper.js`** (1.9KB, 67 lines) - Common utility functions

### 10. Database (`db/`)
- **`init-mongo.js`** (1.1KB, 41 lines) - Database initialization
- **`instructions.txt`** (147B, 5 lines) - Setup instructions
- **`dump/isfplayground/`** - MongoDB dump files with sample data

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sports Activities
- `GET /api/v1/sports` - Get sports activities
- `POST /api/v1/sports` - Create sports activity
- `PUT /api/v1/sports/:id` - Update sports activity

### Music Training
- `GET /api/v1/music` - Get music activities
- `POST /api/v1/music` - Create music activity
- `PUT /api/v1/music/:id` - Update music activity

### Machine Management
- `GET /api/v1/machines` - Get machines
- `POST /api/v1/machines` - Add machine
- `PUT /api/v1/machines/:id` - Update machine

### Balagruha (Playground)
- `GET /api/v1/balagruha` - Get playground activities
- `POST /api/v1/balagruha` - Create playground activity

### Purchase & Repair
- `GET /api/v1/purchase-repair` - Get purchase/repair requests
- `POST /api/v1/purchase-repair` - Create request

### Training Sessions
- `GET /api/v1/training-session` - Get training sessions
- `POST /api/v1/training-session` - Create training session

### Mood Tracking
- `GET /api/v1/mood-tracker` - Get mood data
- `POST /api/v1/mood-tracker` - Record mood

### Roles & Permissions
- `GET /api/roles` - Get roles
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role

## 🔧 Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based middleware

### 2. File Management
- AWS S3 integration for file storage
- Multer middleware for file uploads
- Support for images, videos, and documents

### 3. Face Recognition
- Face-api.js integration
- Student identification via facial recognition
- Age and gender detection

### 4. Logging & Monitoring
- Pino logger for structured logging
- Request/response logging
- Error tracking and monitoring

### 5. API Documentation
- Swagger/OpenAPI documentation
- Interactive API explorer at `/api-docs`

### 6. Database Management
- MongoDB with Mongoose ODM
- Database dumps for development
- Automatic data restoration

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- AWS S3 bucket (for file storage)

### Environment Variables
Create a `.env` file with:
```env
MONGO_URI=mongodb://localhost:27017/isfplayground
MONGO_URI_LOCAL=mongodb://localhost:27017/isfplayground
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5001
AWS_S3_ACCESS_KEY_ID=your-aws-access-key
AWS_S3_SECRET_KEY=your-aws-secret-key
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET=your-s3-bucket-name
AWS_S3_WTF_BUCKET_NAME=wtfpins
```

### Installation
```bash
npm install
npm start
```

## 📊 Database Collections

The application uses the following MongoDB collections:
- `users` - User accounts and profiles
- `tasks` - Task assignments and tracking
- `sports_tasks` - Sports activities
- `machines` - Equipment and machines
- `balagruhas` - Playground activities
- `purchase_orders` - Purchase requests
- `repair_requests` - Equipment repair requests
- `training_sessions` - Training session data
- `student_mood_trackers` - Student emotional data
- `attendances` - Attendance records
- `medicalrecords` - Medical information
- `roles` - User roles and permissions

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- Rate limiting (can be implemented)

## 📝 Logging

- Structured logging with Pino
- Request/response logging
- Error tracking
- Log files stored in `logs/` directory

## 🧪 Testing

Currently no automated tests are implemented. Consider adding:
- Unit tests for controllers and services
- Integration tests for API endpoints
- Database testing with test fixtures

## 🔄 Deployment

### Production Considerations
- Set proper environment variables
- Configure MongoDB for production
- Set up AWS S3 for file storage
- Implement proper logging and monitoring
- Configure CORS for production domains
- Set up SSL/TLS certificates

### Docker Support
Consider adding Docker support for containerized deployment.

## 📚 Additional Resources

- API Documentation: Available at `/api-docs` when server is running
- Database Schema: See individual model files in `models/`
- Business Logic: See service files in `services/`

