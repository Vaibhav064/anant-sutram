const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/mailer');
const { verifyGoogleToken } = require('../utils/googleAuth');

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

function isEmailConfigured() {
  return process.env.EMAIL_CONFIGURED === 'true';
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Full user payload sent to frontend
function userPayload(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name || '',
    // nickname: prefer name > nickname > 'Wanderer'
    nickname: user.name || user.nickname || 'Wanderer',
    photoUrl: user.photoUrl || null,
    authProvider: user.authProvider,
    onboardingAnswers: user.onboarding_answers,
    onboardingCompleted: user.onboardingCompleted,
    subscription: user.subscription,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    lastActiveDate: user.lastActiveDate,
    settings: user.settings || { theme: 'dark', notifications: { dailyReminders: true, meditationReminders: true, journalReminders: false } },
  };
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        if (!isEmailConfigured()) {
          existingUser.isVerified = true;
          existingUser.verificationToken = null;
          existingUser.verificationTokenExpiry = null;
          await existingUser.save();
          const token = signToken(existingUser._id);
          return res.status(200).json({ message: 'auto_verified', email, user: userPayload(existingUser), token });
        }
        const vtoken = generateVerificationToken();
        existingUser.verificationToken = vtoken;
        existingUser.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await existingUser.save();
        try { await sendVerificationEmail(email, vtoken); } catch {}
        return res.status(200).json({ message: 'verification_resent', email });
      }
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Derive a nickname from name or email
    const derivedName = name || email.split('@')[0];

    if (!isEmailConfigured()) {
      const user = new User({
        email,
        password: hashedPassword,
        name: derivedName,
        nickname: derivedName,
        isVerified: true,
      });
      await user.save();
      const token = signToken(user._id);
      return res.status(201).json({ message: 'auto_verified', user: userPayload(user), token });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = new User({
      email,
      password: hashedPassword,
      name: derivedName,
      nickname: derivedName,
      verificationToken,
      verificationTokenExpiry,
    });
    await user.save();

    try { await sendVerificationEmail(email, verificationToken); } catch (mailErr) {
      return res.status(500).json({ error: 'Failed to send verification email.' });
    }

    res.status(201).json({ message: 'verification_sent', email });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account found with this email.' });
    if (!user.password) return res.status(400).json({ error: 'This account uses Google Sign-In. Please use "Continue with Google".' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password. Please try again.' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'email_not_verified', email, message: 'Please verify your email before signing in.' });
    }

    // Update streak on login
    user.updateStreak();
    await user.save();

    const token = signToken(user._id);
    res.json({ user: userPayload(user), token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── GOOGLE AUTH ───────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;

    const googleUser = await verifyGoogleToken(idToken || accessToken);
    if (!googleUser) return res.status(401).json({ error: 'Invalid Google token.' });

    const { email, name, picture, sub: googleId } = googleUser;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // Existing user — sync Google data
      if (!user.googleId) {
        user.googleId = googleId;
        if (user.authProvider === 'email') user.authProvider = 'both';
        else user.authProvider = 'both';
      }
      // Always sync latest name and photo from Google
      if (name && !user.name) user.name = name;
      if (name) user.name = name; // keep synced
      if (picture) user.photoUrl = picture;
      user.nickname = name ? name.split(' ')[0] : user.nickname;
      user.isVerified = true;
    } else {
      // Brand new Google user
      isNewUser = true;
      user = new User({
        email,
        name: name || '',
        nickname: name ? name.split(' ')[0] : 'Wanderer',
        photoUrl: picture || null,
        googleId,
        authProvider: 'google',
        isVerified: true,
        password: null,
      });
    }

    // Update streak on every Google login
    user.updateStreak();
    await user.save();

    const token = signToken(user._id);

    res.json({
      user: userPayload(user),
      token,
      isNew: isNewUser || !user.onboardingCompleted,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// ─── VERIFY EMAIL ──────────────────────────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Expired</title>
        <style>body{background:#080612;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:'Segoe UI',sans-serif;}
        .card{background:#1A1630;border-radius:24px;padding:48px 40px;text-align:center;max-width:400px;}
        h2{color:#fff;margin:0 0 12px;}p{color:rgba(255,255,255,.6);margin:0 0 28px;}
        a{display:inline-block;background:#7C6AF5;color:#fff;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;}</style></head>
        <body><div class="card"><div style="font-size:48px;margin-bottom:16px;">⏰</div>
        <h2>Link Expired</h2><p>This link is invalid or has expired. Please sign up again.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Go Back</a></div></body></html>`);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    user.updateStreak();
    await user.save();

    return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Verified!</title>
      <style>body{background:#080612;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:'Segoe UI',sans-serif;}
      .card{background:#1A1630;border-radius:24px;padding:48px 40px;text-align:center;max-width:400px;}
      h2{color:#fff;margin:0 0 12px;}p{color:rgba(255,255,255,.6);margin:0 0 28px;}
      a{display:inline-block;background:#7C6AF5;color:#fff;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;}</style></head>
      <body><div class="card"><div style="font-size:48px;margin-bottom:16px;">✅</div>
      <h2>Email Verified!</h2><p>Your account is now active. Begin your healing journey.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Sign In Now</a></div></body></html>`);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ─── RESEND VERIFICATION ───────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });
    if (user.isVerified) return res.status(400).json({ error: 'This account is already verified.' });

    if (!isEmailConfigured()) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();
      const token = signToken(user._id);
      return res.json({ message: 'auto_verified', token, user: userPayload(user) });
    }

    const token = generateVerificationToken();
    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    try { await sendVerificationEmail(email, token); } catch {
      return res.status(500).json({ error: 'Failed to send email.' });
    }
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── GET ME (with streak update on each load) ──────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -verificationToken -verificationTokenExpiry');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update streak on each session restore
    user.updateStreak();
    await user.save();

    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, nickname, onboarding_answers, onboardingCompleted, photoUrl } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (nickname !== undefined) update.nickname = nickname;
    if (onboarding_answers !== undefined) update.onboarding_answers = onboarding_answers;
    if (onboardingCompleted !== undefined) update.onboardingCompleted = onboardingCompleted;
    if (photoUrl !== undefined) update.photoUrl = photoUrl;

    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true });
    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── UPDATE SETTINGS ───────────────────────────────────────────────────────────
router.patch('/settings', authMiddleware, async (req, res) => {
  try {
    const { theme, notifications } = req.body;
    const update = {};
    if (theme !== undefined) update['settings.theme'] = theme;
    if (notifications !== undefined) {
      if (notifications.dailyReminders !== undefined) update['settings.notifications.dailyReminders'] = notifications.dailyReminders;
      if (notifications.meditationReminders !== undefined) update['settings.notifications.meditationReminders'] = notifications.meditationReminders;
      if (notifications.journalReminders !== undefined) update['settings.notifications.journalReminders'] = notifications.journalReminders;
    }

    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true });
    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ─── MOCK SUBSCRIBE (Prototype - no real payment) ──────────────────────────────
router.patch('/subscription', authMiddleware, async (req, res) => {
  try {
    const { tier } = req.body;
    const allowed = ['free', 'shakti', 'moksha'];
    if (!allowed.includes(tier)) return res.status(400).json({ error: 'Invalid tier' });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { subscription: tier } },
      { new: true }
    );
    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;

