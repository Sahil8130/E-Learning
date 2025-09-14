import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI, lecturesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseResponse, lecturesResponse] = await Promise.all([
        coursesAPI.getById(id),
        lecturesAPI.getByCourse(id)
      ]);
      
      setCourse(courseResponse.data);
      setLectures(lecturesResponse.data);
    } catch (error) {
      setError('Failed to fetch course data');
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-container">
        <div className="error">{error || 'Course not found'}</div>
      </div>
    );
  }

  const isInstructor = user?.role === 'instructor' && course.instructor._id === user.id;

  return (
    <div className="course-detail-container">
      <div className="course-header">
        <h1>{course.title}</h1>
        <p className="course-instructor">by {course.instructor.name}</p>
        <p className="course-description">{course.description}</p>
        
        {isInstructor && (
          <div className="instructor-actions">
            <Link 
              to={`/instructor/create-lecture/${course._id}`}
              className="action-button primary"
            >
              Add Lecture
            </Link>
          </div>
        )}
      </div>

      <div className="lectures-section">
        <h2>Lectures</h2>
        
        {lectures.length === 0 ? (
          <div className="no-lectures">
            <p>No lectures available for this course yet.</p>
            {isInstructor && (
              <Link 
                to={`/instructor/create-lecture/${course._id}`}
                className="action-button"
              >
                Create First Lecture
              </Link>
            )}
          </div>
        ) : (
          <div className="lectures-list">
            {lectures.map((lecture, index) => (
              <div key={lecture._id} className="lecture-item">
                <div className="lecture-info">
                  <h3>
                    {index + 1}. {lecture.title}
                  </h3>
                  <span className={`lecture-type ${lecture.type}`}>
                    {lecture.type}
                  </span>
                </div>
                
                <div className="lecture-actions">
                  <Link 
                    to={`/lectures/${lecture._id}`}
                    className="lecture-button"
                  >
                    {lecture.type === 'quiz' ? 'Take Quiz' : 'View Lecture'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
