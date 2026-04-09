const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Identity
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    default: '',
  },
  nickname: {
    type: String,
    default: 'Wanderer',
  },
  photoUrl: {
    type: String,
    default: null,
  },

  // Auth
  password: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'both'],
    default: 'email',
  },
  googleId: {
    type: String,
    default: null,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
  },

  // Onboarding
  onboarding_answers: {
    type: Object,
    default: {},
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },

  // Subscription
  subscription: {
    type: String,
    default: 'free',
  },

  // Streak & Activity
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: null,
  },

  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    notifications: {
      dailyReminders: { type: Boolean, default: true },
      meditationReminders: { type: Boolean, default: true },
      journalReminders: { type: Boolean, default: false },
    },
  },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// Streak logic: call this whenever there is meaningful user activity
// It is date-safe and idempotent for the same calendar day
// ─────────────────────────────────────────────────────────────────────────────
userSchema.methods.updateStreak = function () {
  const now = new Date();
  // Work in UTC midnight boundaries so timezone can't cause double-counts
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (!this.lastActiveDate) {
    // First ever activity
    this.currentStreak = 1;
    this.longestStreak = 1;
  } else {
    const last = new Date(this.lastActiveDate);
    const lastUTC = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
    const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day — do nothing, streak stays the same
      return;
    } else if (diffDays === 1) {
      // Consecutive day — increment
      this.currentStreak += 1;
    } else {
      // Gap — reset to 1
      this.currentStreak = 1;
    }

    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  }

  this.lastActiveDate = now;
};

module.exports = mongoose.model('User', userSchema);
