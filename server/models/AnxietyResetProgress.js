const mongoose = require('mongoose');

const dailyEntrySchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 1, max: 21 },
  completedAt: { type: Date, default: null },
  journalResponse: { type: String, default: '' },
  taskDone: { type: Boolean, default: false },
  exerciseDone: { type: Boolean, default: false },
  moodScore: { type: Number, default: null },
});

const anxietyResetProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 21,
  },
  selectedPlan: {
    type: String,
    enum: ['psychologist', 'spiritual', 'coach', null],
    default: null,
  },
  planPurchased: {
    type: Boolean,
    default: false,
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: null,
  },
  lastCompletedDate: {
    type: Date,
    default: null,
  },
  dailyEntries: [dailyEntrySchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('AnxietyResetProgress', anxietyResetProgressSchema);
