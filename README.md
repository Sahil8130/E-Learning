# 🎓 Online Learning Platform

A full-stack online learning platform built with the MERN stack, featuring modern UI/UX, file uploads, real-time search, and comprehensive progress tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies:**
```bash
npm run install-all
```

2. **Set up environment variables:**

Create `server/.env`:
```
MONGO_URI=mongodb+srv://sahilsaroj00314_db_user:2wxfKjEkWzqejiTW@cluster0.pxqkury.mongodb.net/online-learning
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

3. **Run the application:**
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## ✨ Features

### 🎯 Core Learning Features
- **User Management**: Registration, login, role-based access (Instructor/Student)
- **Course Management**: Create, edit, and manage courses
- **Lecture System**: Reading materials and interactive quizzes
- **File Uploads**: Support for PDFs, images, and documents
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Search Functionality**: Real-time course search and filtering

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Modern styling with custom components
- **Framer Motion**: Smooth animations and transitions
- **Redux Toolkit**: Advanced state management
- **Toast Notifications**: User feedback system

## 🏗️ Project Structure

```
online-learning-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── store/          # Redux store
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File storage
│   ├── server.js
│   └── package.json
└── package.json            # Root package.json
```

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install-all

# Run both frontend and backend
npm run dev

# Run only backend
npm run server

# Run only frontend
npm run client

# Build frontend for production
npm run build

# Start production server
npm start
```

## 📱 User Roles

### 👨‍🏫 Instructor
- Create and manage courses
- Add lectures (reading materials and quizzes)
- Upload files for course materials
- Track student progress

### 👨‍🎓 Student
- Browse available courses
- Enroll in courses
- Complete lectures sequentially
- Take quizzes with real-time feedback
- Track learning progress

## 🔧 Technical Stack

### Frontend
- React 18 with Create React App
- Redux Toolkit for state management
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB Atlas with Mongoose
- JWT for authentication
- Multer for file uploads
- CORS for cross-origin requests

## 🎉 Ready to Use!

The application is now fully functional and ready for development. Open http://localhost:3000 in your browser to start using the platform!

**Happy Learning! 🎓✨**