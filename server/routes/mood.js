const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const { authMiddleware } = require('./auth');

// ─── Save mood entry ───────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { score, note, emoji } = req.body;
    if (score === undefined || score === null)
      return res.status(400).json({ error: 'Mood score is required' });

    const entry = new MoodEntry({
      userId: req.userId,
      score: Math.min(10, Math.max(0, Number(score))),
      note: note || '',
      emoji: emoji || '',
    });

    await entry.save();
    res.status(201).json({ entry });
  } catch (err) {
    console.error('Save mood error:', err);
    res.status(500).json({ error: 'Failed to save mood entry' });
  }
});

// ─── Get mood history (last 30 days) ─────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await MoodEntry.find({
      userId: req.userId,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 }).limit(100);

    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

// ─── Get today's mood ─────────────────────────────────────────────────────────
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await MoodEntry.findOne({
      userId: req.userId,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });

    res.json({ entry: entry || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today\'s mood' });
  }
});

module.exports = router;
