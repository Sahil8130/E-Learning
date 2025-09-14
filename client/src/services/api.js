import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Lectures API
export const lecturesAPI = {
  getByCourse: (courseId) => api.get(`/lectures/course/${courseId}`),
  getById: (id) => api.get(`/lectures/${id}`),
  checkAccess: (id) => api.get(`/lectures/${id}/access`),
  markComplete: (id) => api.post(`/lectures/${id}/mark-complete`),
  create: (lectureData) => {
    // Check if it's FormData (file upload) or regular object
    if (lectureData instanceof FormData) {
      return api.post('/lectures', lectureData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/lectures', lectureData);
  },
  update: (id, lectureData) => api.put(`/lectures/${id}`, lectureData),
  delete: (id) => api.delete(`/lectures/${id}`),
  submitQuiz: (id, answers) => api.post(`/lectures/${id}/submit-quiz`, { answers }),
};

// Progress API
export const progressAPI = {
  get: (userId, courseId) => api.get(`/progress/${userId}/${courseId}`),
  getByUserAndCourse: (userId, courseId) => api.get(`/progress/${userId}/${courseId}`),
  getByUser: (userId) => api.get(`/progress/student/${userId}`),
  update: (progressData) => api.post('/progress', progressData),
  markCompleted: (lectureId) => api.post('/progress', { lectureId }),
  completeLecture: (courseId, lectureId, score) => api.post('/progress/complete-lecture', { courseId, lectureId, score }),
};

// Enrollment API
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  getStudentEnrollments: (studentId) => api.get(`/enrollments/student/${studentId}`),
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  checkEnrollment: (courseId) => api.get(`/enrollments/check/${courseId}`),
};

export default api;
