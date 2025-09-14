const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLectures: [{
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: null
    }
  }],
  totalLectures: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure unique combination of student and course
progressSchema.index({ student: 1, course: 1 }, { unique: true });

// Method to check if student can access a lecture
progressSchema.methods.canAccessLecture = function(lectureOrder) {
  // Student can access lecture if:
  // 1. It's the first lecture (order 1)
  // 2. Previous lecture is completed
  if (lectureOrder === 1) {
    return true;
  }
  
  // Check if previous lecture is completed
  const previousLectureCompleted = this.completedLectures.some(completed => 
    completed.lecture && completed.lecture.order === lectureOrder - 1
  );
  
  return previousLectureCompleted;
};

module.exports = mongoose.model('Progress', progressSchema);
