const express = require('express');
const { body, validationResult } = require('express-validator');
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/lectures/course/:courseId
// @desc    Get lectures for a course
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.courseId }).sort({ order: 1 });
    res.json(lectures);
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lectures/:id
// @desc    Get lecture by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    res.json(lecture);
  } catch (error) {
    console.error('Get lecture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lectures/:id/access
// @desc    Check if student can access lecture (for sequential navigation)
// @access  Private
router.get('/:id/access', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // If user is instructor, they can access any lecture
    if (req.user.role === 'instructor') {
      return res.json({ canAccess: true, reason: 'instructor' });
    }

    // For students, check if they are enrolled and can access this lecture
    const Enrollment = require('../models/Enrollment');
    const Progress = require('../models/Progress');
    
    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lecture.course._id
    });

    if (!enrollment) {
      return res.json({ canAccess: false, reason: 'not_enrolled' });
    }

    const progress = await Progress.findOne({ 
      student: req.user._id, 
      course: lecture.course._id 
    }).populate('completedLectures.lecture');

    if (!progress) {
      // Create progress entry if it doesn't exist
      const newProgress = new Progress({
        student: req.user._id,
        course: lecture.course._id,
        completedLectures: [],
        totalLectures: lecture.course.lectures.length
      });
      await newProgress.save();
      return res.json({ canAccess: true, reason: 'authorized', lectureOrder: lecture.order });
    }

    const canAccess = progress.canAccessLecture(lecture.order);
    res.json({ 
      canAccess, 
      reason: canAccess ? 'authorized' : 'previous_lecture_not_completed',
      lectureOrder: lecture.order
    });
  } catch (error) {
    console.error('Check lecture access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lectures
// @desc    Create a new lecture
// @access  Private (Instructor only)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('Lecture creation request body:', req.body);
    console.log('Lecture creation request file:', req.file);
    
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const { title, type, content, course, order, questions } = req.body;

    // Manual validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!type || !['reading', 'quiz'].includes(type)) {
      return res.status(400).json({ message: 'Type must be reading or quiz' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (!course) {
      return res.status(400).json({ message: 'Valid course ID is required' });
    }
    // Verify course exists and user owns it
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Auto-set order if not provided or invalid
    let lectureOrder = parseInt(order);
    if (!order || isNaN(lectureOrder) || lectureOrder < 1) {
      // Get the next order number
      const existingLectures = await Lecture.find({ course }).sort({ order: -1 }).limit(1);
      lectureOrder = existingLectures.length > 0 ? existingLectures[0].order + 1 : 1;
    }

    // Parse questions if they exist and type is quiz
    let parsedQuestions = undefined;
    if (type === 'quiz') {
      if (!questions) {
        return res.status(400).json({ message: 'Quiz lectures must have questions' });
      }
      
      try {
        parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          return res.status(400).json({ message: 'Quiz lectures must have at least one question' });
        }
      } catch (error) {
        console.error('Error parsing questions:', error);
        return res.status(400).json({ message: 'Invalid questions format' });
      }
    }

    const lectureData = {
      title,
      type,
      content,
      course,
      order: lectureOrder,
      questions: parsedQuestions
    };

    // Handle file upload if present
    if (req.file) {
      lectureData.fileUrl = `/uploads/${req.file.filename}`;
      lectureData.fileName = req.file.originalname;
      lectureData.fileType = req.file.mimetype;
      lectureData.fileSize = req.file.size;
    }

    const lecture = new Lecture(lectureData);
    await lecture.save();

    // Add lecture to course
    courseDoc.lectures.push(lecture._id);
    await courseDoc.save();

    res.status(201).json(lecture);
  } catch (error) {
    console.error('Create lecture error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   POST /api/lectures/:id/submit-quiz
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit-quiz', auth, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture || lecture.type !== 'quiz') {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if student is enrolled
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lecture.course._id
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course' });
    }

    let score = 0;
    const results = [];

    // Grade the quiz
    lecture.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score++;
      }
      
      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options
      });
    });

    const percentage = Math.round((score / lecture.questions.length) * 100);
    const passed = percentage >= 70; // 70% passing grade

    // If passed, mark lecture as completed
    if (passed) {
      const Progress = require('../models/Progress');
      let progress = await Progress.findOne({ 
        student: req.user._id, 
        course: lecture.course._id 
      });
      
      if (!progress) {
        progress = new Progress({
          student: req.user._id,
          course: lecture.course._id,
          completedLectures: [],
          totalLectures: lecture.course.lectures.length
        });
      }

      // Check if lecture is already completed
      const existingLecture = progress.completedLectures.find(l => l.lecture.toString() === lecture._id.toString());
      
      if (!existingLecture) {
        progress.completedLectures.push({
          lecture: lecture._id,
          completedAt: new Date(),
          score: percentage
        });
        await progress.save();
      }
    }

    res.json({
      score,
      totalQuestions: lecture.questions.length,
      percentage,
      passed,
      results,
      lectureCompleted: passed
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lectures/:id/mark-complete
// @desc    Mark a reading lecture as completed (when viewed)
// @access  Private
router.post('/:id/mark-complete', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Only reading lectures can be marked complete by viewing
    if (lecture.type !== 'reading') {
      return res.status(400).json({ message: 'Only reading lectures can be marked complete by viewing' });
    }

    // Check if student is enrolled
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lecture.course._id
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course' });
    }

    // Mark lecture as completed
    const Progress = require('../models/Progress');
    let progress = await Progress.findOne({ 
      student: req.user._id, 
      course: lecture.course._id 
    });
    
    if (!progress) {
      progress = new Progress({
        student: req.user._id,
        course: lecture.course._id,
        completedLectures: [],
        totalLectures: lecture.course.lectures.length
      });
    }

    // Check if lecture is already completed
    const existingLecture = progress.completedLectures.find(l => l.lecture.toString() === lecture._id.toString());
    
    if (!existingLecture) {
      progress.completedLectures.push({
        lecture: lecture._id,
        completedAt: new Date(),
        score: 100 // Reading lectures get 100% when viewed
      });
      await progress.save();
    }

    res.json({ 
      message: 'Lecture marked as completed',
      progress 
    });
  } catch (error) {
    console.error('Mark lecture complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;