import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ConnectionStatus from './components/ConnectionStatus';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import LectureView from './pages/LectureView';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import CreateLecture from './pages/CreateLecture';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Navbar />
            <ConnectionStatus />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/courses" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/lectures/:id" element={<LectureView />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/instructor" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/instructor/create-course" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <CreateCourse />
                  </ProtectedRoute>
                } />
                <Route path="/instructor/create-lecture/:courseId" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <CreateLecture />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <NotificationContainer />
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;