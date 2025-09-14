const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress/:userId/:courseId
// @desc    Get student progress for a course
// @access  Private
router.get('/:userId/:courseId', auth, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    if (req.user._id !== userId && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let progress = await Progress.findOne({ student: userId, course: courseId });
    
    if (!progress) {
      // Create new progress entry
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      progress = new Progress({
        student: userId,
        course: courseId,
        completedLectures: [],
        totalLectures: course.lectures.length
      });
      
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/progress
// @desc    Update student progress
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, lectureId, score } = req.body;
    const userId = req.user._id;

    if (!courseId || !lectureId) {
      return res.status(400).json({ message: 'Course ID and Lecture ID are required' });
    }

    let progress = await Progress.findOne({ student: userId, course: courseId });
    
    if (!progress) {
      // Create new progress entry
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      progress = new Progress({
        student: userId,
        course: courseId,
        completedLectures: [],
        totalLectures: course.lectures.length
      });
    }

    // Check if lecture is already completed
    const existingLecture = progress.completedLectures.find(l => l.lecture.toString() === lectureId);
    
    if (!existingLecture) {
      progress.completedLectures.push({
        lecture: lectureId,
        completedAt: new Date(),
        score: score || 0
      });
    } else {
      // Update existing completion
      existingLecture.completedAt = new Date();
      if (score !== undefined) {
        existingLecture.score = score;
      }
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/progress/complete-lecture
// @desc    Mark a lecture as completed
// @access  Private
router.post('/complete-lecture', auth, async (req, res) => {
  try {
    const { courseId, lectureId, score } = req.body;
    const userId = req.user._id;

    if (!courseId || !lectureId) {
      return res.status(400).json({ message: 'Course ID and Lecture ID are required' });
    }

    // Check if student is enrolled
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course' });
    }

    let progress = await Progress.findOne({ student: userId, course: courseId });
    
    if (!progress) {
      // Create new progress entry
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      progress = new Progress({
        student: userId,
        course: courseId,
        completedLectures: [],
        totalLectures: course.lectures.length
      });
    }

    // Check if lecture is already completed
    const existingLecture = progress.completedLectures.find(l => l.lecture.toString() === lectureId);
    
    if (!existingLecture) {
      progress.completedLectures.push({
        lecture: lectureId,
        completedAt: new Date(),
        score: score || 0
      });
    } else {
      // Update existing completion
      existingLecture.completedAt = new Date();
      if (score !== undefined) {
        existingLecture.score = score;
      }
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Complete lecture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;