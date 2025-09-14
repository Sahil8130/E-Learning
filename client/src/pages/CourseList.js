import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCourses } from '../features/courses/courseSlice';
import { enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../features/ui/uiSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { BookOpen, User, Clock, UserPlus, CheckCircle } from 'lucide-react';

const CourseList = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { courses, filteredCourses, loading, error } = useAppSelector(state => state.courses);
  const [enrollments, setEnrollments] = useState({});
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    dispatch(fetchCourses());
    if (user?.role === 'student') {
      fetchEnrollments();
    }
  }, [dispatch, user]);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getStudentEnrollments(user.id);
      const enrollmentMap = {};
      response.data.forEach(enrollment => {
        enrollmentMap[enrollment.course._id] = enrollment;
      });
      setEnrollments(enrollmentMap);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await enrollmentAPI.enroll(courseId);
      await fetchEnrollments();
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Successfully enrolled in course!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to enroll in course'
      }));
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Available Courses
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our collection of courses and start your learning journey today!
            </p>
          </div>

          <div className="mb-8">
            <SearchBar placeholder="Search courses by title or description..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {courses.length === 0 
                    ? "No courses available at the moment. Please check back later." 
                    : "Try adjusting your search criteria."
                  }
                </p>
                {courses.length === 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400">
                      If you're an instructor, you can create courses from your dashboard.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <Card.Header>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {course.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-4 h-4 mr-1" />
                            <span>by {course.instructor?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>{course.lectures?.length || 0}</span>
                        </div>
                      </div>
                    </Card.Header>
                    
                    <Card.Content>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {course.description}
                      </p>
                    </Card.Content>
                    
                    <Card.Footer>
                      <div className="space-y-2">
                        <Link to={`/courses/${course._id}`} className="w-full">
                          <Button className="w-full">
                            View Course
                          </Button>
                        </Link>
                        
                        {user?.role === 'student' && (
                          <div>
                            {enrollments[course._id] ? (
                              <div className="flex items-center justify-center text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Enrolled
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEnroll(course._id)}
                                disabled={enrolling[course._id]}
                              >
                                {enrolling[course._id] ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                                    Enrolling...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Enroll
                                  </div>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseList;
