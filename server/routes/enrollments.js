const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll student in a course
// @access  Private (Student only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId
    });

    await enrollment.save();

    // Create progress entry
    const progress = new Progress({
      student: req.user._id,
      course: courseId,
      completedLectures: [],
      totalLectures: course.lectures.length
    });

    await progress.save();

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
      progress
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/student/:studentId
// @desc    Get all enrollments for a student
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user can access this data
    if (req.user._id !== studentId && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'title description instructor')
      .populate('course.instructor', 'name email')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/course/:courseId
// @desc    Get all enrollments for a course
// @access  Private (Instructor only)
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { courseId } = req.params;

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/enrollments/:enrollmentId
// @desc    Unenroll from a course
// @access  Private
router.delete('/:enrollmentId', auth, async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user can unenroll
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete enrollment and progress
    await Enrollment.findByIdAndDelete(enrollmentId);
    await Progress.findOneAndDelete({
      student: enrollment.student,
      course: enrollment.course
    });

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/check/:courseId
// @desc    Check if student is enrolled in a course
// @access  Private
router.get('/check/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
