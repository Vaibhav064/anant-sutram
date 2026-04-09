const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Update user profile (nickname, onboarding answers)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { nickname, onboardingAnswers } = req.body;
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (onboardingAnswers) updateData.onboarding_answers = onboardingAnswers;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      user: { id: user._id, email: user.email, nickname: user.nickname, onboardingAnswers: user.onboarding_answers }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
