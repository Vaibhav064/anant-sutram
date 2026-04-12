const express = require('express');
const router = express.Router();
const { authMiddleware: requireAuth } = require('./auth');
const Assessment = require('../models/Assessment');

// Save a new assessment result
router.post('/', requireAuth, async (req, res) => {
  try {
    const { testId, score, severity, answers } = req.body;
    console.log(`[ASSESSMENT_SAVE] Saving ${testId} for user ${req.userId}. Score: ${score}, Severity: ${severity}`);
    
    if (!testId || score === undefined || !severity) {
      return res.status(400).json({ error: 'Missing required assessment fields' });
    }

    const test = new Assessment({
      userId: req.userId,
      testId,
      score,
      severity,
      answers: answers || []
    });

    await test.save();
    res.status(201).json({ message: 'Assessment saved successfully', entry: test });
  } catch (error) {
    console.error('Save assessment error:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// Get history for a specific test
router.get('/:testId', requireAuth, async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Fetch all history for this user and test type, sorted newest first
    const history = await Assessment.find({ 
      userId: req.userId, 
      testId 
    }).sort({ createdAt: -1 });

    res.json({ history });
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment history' });
  }
});

// Get a broad summary across all tests for the "Psychological Portrait"
router.get('/user/summary', requireAuth, async (req, res) => {
  try {
    // 1. Group by testId and get the latest entry for each
    const recentTests = await Assessment.aggregate([
      { $match: { userId: req.userId } },
      { $sort: { createdAt: -1 } },
      { 
        $group: { 
          _id: '$testId', 
          latestScore: { $first: '$score' },
          latestSeverity: { $first: '$severity' },
          date: { $first: '$createdAt' }
        } 
      }
    ]);
    
    res.json({ summary: recentTests });
  } catch (error) {
    console.error('Get assessment summary error:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment summary' });
  }
});

module.exports = router;
