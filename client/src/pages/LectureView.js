import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lecturesAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../hooks/redux';
import { addNotification } from '../features/ui/uiSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { ArrowLeft, FileText, Image, Download, CheckCircle, XCircle } from 'lucide-react';

const LectureView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [canAccess, setCanAccess] = useState(true);
  const [accessReason, setAccessReason] = useState('');

  useEffect(() => {
    fetchLecture();
  }, [id]);

  const fetchLecture = async () => {
    try {
      const response = await lecturesAPI.getById(id);
      setLecture(response.data);
      
      // Check if user can access this lecture
      await checkLectureAccess();
      
      // Initialize quiz answers
      if (response.data.type === 'quiz') {
        setQuizAnswers(new Array(response.data.questions.length).fill(null));
      }
      
      // Mark reading lecture as completed when viewed
      if (response.data.type === 'reading' && user?.role === 'student') {
        try {
          await lecturesAPI.markComplete(id);
        } catch (error) {
          console.error('Error marking lecture complete:', error);
        }
      }
    } catch (error) {
      setError('Failed to fetch lecture');
      console.error('Error fetching lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLectureAccess = async () => {
    try {
      const response = await lecturesAPI.checkAccess(id);
      setCanAccess(response.data.canAccess);
      setAccessReason(response.data.reason);
    } catch (error) {
      console.error('Error checking lecture access:', error);
      setCanAccess(false);
      setAccessReason('error');
    }
  };

  const handleQuizAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (quizAnswers.some(answer => answer === null)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Incomplete Quiz',
        message: 'Please answer all questions before submitting.'
      }));
      return;
    }

    setSubmitting(true);
    try {
      const response = await lecturesAPI.submitQuiz(id, quizAnswers);
      const result = response.data;
      setQuizResult(result);
      setQuizSubmitted(true);
      
      // Show result notification
      if (result.passed) {
        dispatch(addNotification({
          type: 'success',
          title: 'Quiz Passed!',
          message: `You scored ${result.percentage}% and completed the lecture!`
        }));
      } else {
        dispatch(addNotification({
          type: 'warning',
          title: 'Quiz Failed',
          message: `You scored ${result.percentage}%. You need 70% to pass.`
        }));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to submit quiz. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const markReadingComplete = async () => {
    try {
      await progressAPI.markCompleted(id);
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Lecture marked as completed!'
      }));
    } catch (error) {
      console.error('Error marking lecture complete:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark lecture as completed'
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || 'Lecture not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can access this lecture
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <XCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Lecture Locked
              </h2>
              <p className="text-gray-600 mb-6">
                {accessReason === 'previous_lecture_not_completed' 
                  ? 'You need to complete the previous lecture before accessing this one.'
                  : accessReason === 'not_enrolled'
                  ? 'You are not enrolled in this course.'
                  : 'You do not have access to this lecture.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={`/courses/${lecture.course._id}`}>
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/courses/${lecture.course?._id}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>

          <Card>
            <Card.Header>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {lecture.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lecture.type === 'reading' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lecture.type}
                    </span>
                    <span>Course: {lecture.course?.title}</span>
                  </div>
                </div>
              </div>
            </Card.Header>

            <Card.Content>
              {lecture.type === 'reading' ? (
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {lecture.content}
                    </p>
                  </div>
                  
                  {lecture.fileUrl && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(lecture.fileType)}
                          <div>
                            <p className="font-medium text-gray-900">{lecture.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {lecture.fileSize ? `${Math.round(lecture.fileSize / 1024)} KB` : ''}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:5000${lecture.fileUrl}`}
                          download={lecture.fileName}
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'student' && (
                    <div className="flex justify-center pt-6">
                      <Button onClick={markReadingComplete} size="lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {!quizSubmitted ? (
                    <div>
                      <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {lecture.content}
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        {lecture.questions.map((question, questionIndex) => (
                          <motion.div
                            key={questionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
                            className="border border-gray-200 rounded-lg p-6"
                          >
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Question {questionIndex + 1}
                            </h3>
                            <p className="text-gray-700 mb-4">{question.question}</p>
                            
                            <div className="space-y-3">
                              {question.options.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    value={optionIndex}
                                    checked={quizAnswers[questionIndex] === optionIndex}
                                    onChange={() => handleQuizAnswerChange(questionIndex, optionIndex)}
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="flex justify-center pt-6">
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={submitting || quizAnswers.some(answer => answer === null)}
                          loading={submitting}
                          size="lg"
                        >
                          Submit Quiz
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                      >
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                          quizResult.passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {quizResult.passed ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                          ) : (
                            <XCircle className="w-10 h-10 text-red-600" />
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Quiz Results
                        </h2>
                        <div className={`text-4xl font-bold mb-2 ${
                          quizResult.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {quizResult.score}%
                        </div>
                        <p className={`text-lg ${
                          quizResult.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {quizResult.passed ? 'Congratulations! You passed!' : 'You need to score at least 70% to pass.'}
                        </p>
                      </motion.div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Question Review</h3>
                        {quizResult.results.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`border rounded-lg p-4 ${
                              result.isCorrect 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {result.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Question {index + 1}
                                </h4>
                                <p className="text-gray-700 mb-2">{result.question}</p>
                                <p className="text-sm text-gray-600">
                                  Your answer: <span className="font-medium">{result.options[result.userAnswer]}</span>
                                </p>
                                {!result.isCorrect && (
                                  <p className="text-sm text-green-600">
                                    Correct answer: <span className="font-medium">{result.options[result.correctAnswer]}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LectureView;
