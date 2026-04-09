const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  note: {
    type: String,
    default: '',
    maxlength: 300,
  },
  emoji: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
