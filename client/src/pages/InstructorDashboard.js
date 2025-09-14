import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      // Filter courses created by the current instructor
      const instructorCourses = response.data.filter(
        course => course.instructor._id === user.id
      );
      setCourses(instructorCourses);
    } catch (error) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await coursesAPI.delete(courseId);
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
      }
    }
  };

  if (loading) {
    return (
      <div className="instructor-dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-dashboard-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard-container">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <p>Manage your courses and lectures</p>
        
        <div className="dashboard-actions">
          <Link to="/instructor/create-course" className="action-button primary">
            Create New Course
          </Link>
        </div>
      </div>

      <div className="courses-section">
        <h2>Your Courses</h2>
        
        {courses.length === 0 ? (
          <div className="no-courses">
            <p>You haven't created any courses yet.</p>
            <Link to="/instructor/create-course" className="create-button">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <div className="course-stats">
                    <span className="lecture-count">
                      {course.lectures?.length || 0} lectures
                    </span>
                  </div>
                </div>
                
                <div className="course-content">
                  <p className="course-description">{course.description}</p>
                </div>
                
                <div className="course-actions">
                  <Link 
                    to={`/courses/${course._id}`}
                    className="action-button"
                  >
                    View Course
                  </Link>
                  
                  <Link 
                    to={`/instructor/create-lecture/${course._id}`}
                    className="action-button"
                  >
                    Add Lecture
                  </Link>
                  
                  <button 
                    onClick={() => handleDeleteCourse(course._id)}
                    className="action-button danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
