const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    default: '',
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  aiInsight: {
    text: { type: String, default: '' },
    emotions: { type: [String], default: [] },
  },
  moodScore: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
