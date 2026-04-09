const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { authMiddleware } = require('./auth');

// ─── Save journal entry ────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, prompt, tags, aiInsight, moodScore } = req.body;
    if (!content || !content.trim())
      return res.status(400).json({ error: 'Journal content is required' });

    const words = content.trim().split(/\s+/);
    const wordCount = content.trim() === '' ? 0 : words.length;

    const entry = new JournalEntry({
      userId: req.userId,
      content: content.trim(),
      prompt: prompt || '',
      wordCount,
      tags: tags || [],
      aiInsight: aiInsight || { text: '', emotions: [] },
      moodScore: moodScore || null,
    });

    await entry.save();
    res.status(201).json({ entry });
  } catch (err) {
    console.error('Save journal error:', err);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// ─── Get journal entries (paginated) ──────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { userId: req.userId };
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [entries, total] = await Promise.all([
      JournalEntry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JournalEntry.countDocuments(query),
    ]);

    res.json({ entries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// ─── Delete journal entry ──────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ─── Update journal entry ──────────────────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (req.body.aiInsight) entry.aiInsight = req.body.aiInsight;
    if (req.body.tags) entry.tags = req.body.tags;
    await entry.save();
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

module.exports = router;
