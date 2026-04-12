const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  testId: {
    type: String, // 'bdi', 'gad7', etc.
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
  },
  severity: {
    type: String,
    required: true,
  },
  answers: {
    type: [Number], // Array of scores selected per question (optional but good for history)
    default: [],
  }
}, { timestamps: true });

// Compound index for efficient querying of a specific user's specific test history
assessmentSchema.index({ userId: 1, testId: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
