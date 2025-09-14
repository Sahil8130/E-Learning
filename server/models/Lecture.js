const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['reading', 'quiz'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  // File upload support
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  // For quiz lectures
  questions: [{
    question: {
      type: String,
      required: function() { return this.type === 'quiz'; }
    },
    options: [{
      type: String,
      required: function() { return this.type === 'quiz'; }
    }],
    correctAnswer: {
      type: Number,
      required: function() { return this.type === 'quiz'; }
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Lecture', lectureSchema);
