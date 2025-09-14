import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { coursesAPI, lecturesAPI } from '../services/api';
import { useAppDispatch } from '../hooks/redux';
import { addNotification } from '../features/ui/uiSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';

const CreateLecture = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'reading',
    content: '',
    order: 1,
    questions: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getById(courseId);
      setCourse(response.data);
      setFormData(prev => ({
        ...prev,
        order: (response.data.lectures?.length || 0) + 1
      }));
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('course', courseId);
      formDataToSend.append('order', formData.order);
      
      if (formData.type === 'quiz') {
        formDataToSend.append('questions', JSON.stringify(formData.questions));
      }
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await lecturesAPI.create(formDataToSend);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Lecture created successfully!'
      }));
      
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create lecture');
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create lecture'
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
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
              onClick={() => navigate(`/courses/${courseId}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Add Lecture to "{course.title}"
            </h1>
          </div>

          <Card>
            <Card.Content>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lecture Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter lecture title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lecture Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="reading">Reading</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'reading' ? 'Content' : 'Instructions'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={
                      formData.type === 'reading' 
                        ? 'Enter the lecture content or provide a link'
                        : 'Enter quiz instructions'
                    }
                    required
                  />
                </div>

                {formData.type === 'reading' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File (Optional)
                    </label>
                    <FileUpload
                      onFileSelect={setSelectedFile}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      maxSize={10 * 1024 * 1024}
                    />
                  </div>
                )}
                
                {formData.type === 'quiz' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                    
                    {formData.questions.map((question, questionIndex) => (
                      <motion.div
                        key={questionIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Text
                            </label>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter the question"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Answer Options
                            </label>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3 mb-2">
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                                  className="text-primary-600 focus:ring-primary-500"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleQuestionChange(questionIndex, 'options', newOptions);
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading}
                    disabled={formData.type === 'quiz' && formData.questions.length === 0}
                  >
                    Create Lecture
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateLecture;
