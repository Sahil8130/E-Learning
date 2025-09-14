import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProgress } from '../features/progress/progressSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { BookOpen, User, Plus, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { progress, loading } = useAppSelector(state => state.progress);
  
  // Convert progress object to array for easier handling
  const progressArray = Object.values(progress).filter(p => p && p.course);

  useEffect(() => {
    if (user?.role === 'student') {
      // Fetch progress for all courses the student is enrolled in
      dispatch(fetchProgress({ userId: user.id, courseId: 'all' }));
    }
  }, [dispatch, user]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600">
              Here's your learning progress and overview
            </p>
          </div>

          {user?.role === 'student' ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
                
                {progressArray.length === 0 ? (
                  <Card>
                    <Card.Content className="text-center py-12">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No courses enrolled yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start your learning journey by exploring our available courses.
                      </p>
                      <Link to="/courses">
                        <Button size="lg">
                          Browse Courses
                        </Button>
                      </Link>
                    </Card.Content>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {progressArray.map((courseProgress, index) => (
                      <motion.div
                        key={courseProgress._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card hover className="h-full">
                          <Card.Header>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {courseProgress.course?.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <User className="w-4 h-4 mr-1" />
                                  <span>by {courseProgress.course?.instructor?.name}</span>
                                </div>
                              </div>
                            </div>
                          </Card.Header>
                          
                          <Card.Content>
                            <div className="space-y-4">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Progress</span>
                                <span>{courseProgress.completedLectures?.length || 0} / {courseProgress.totalLectures || 0} lectures</span>
                              </div>
                              
                              <ProgressBar
                                progress={courseProgress.completedLectures?.length || 0}
                                total={courseProgress.totalLectures || 0}
                                showPercentage={true}
                                color="primary"
                              />
                              
                              <div className="text-xs text-gray-500">
                                {courseProgress.completedLectures?.length === courseProgress.totalLectures 
                                  ? 'Course Completed! 🎉' 
                                  : `${courseProgress.totalLectures - (courseProgress.completedLectures?.length || 0)} lectures remaining`
                                }
                              </div>
                            </div>
                          </Card.Content>
                          
                          <Card.Footer>
                            <Link to={`/courses/${courseProgress.course?._id}`} className="w-full">
                              <Button className="w-full">
                                Continue Learning
                              </Button>
                            </Link>
                          </Card.Footer>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <Card>
                <Card.Content className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Instructor Dashboard
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Manage your courses, track student progress, and create engaging content.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/instructor">
                      <Button size="lg" className="w-full sm:w-auto">
                        Manage Courses
                      </Button>
                    </Link>
                    <Link to="/instructor/create-course">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Course
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
