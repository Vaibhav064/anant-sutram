const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const moodRoutes = require('./routes/mood');
const journalRoutes = require('./routes/journal');
const anxietyResetRoutes = require('./routes/anxietyReset');
const healerRoutes = require('./routes/healers');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev — tighten in production
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Email config check ────────────────────────────────────────────────────────
async function checkEmailConfig() {
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';

  if (!emailUser || !emailPass) {
    process.env.EMAIL_CONFIGURED = 'false';
    console.warn('⚠️  Email not configured — accounts will be auto-verified');
    return;
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });
    await transporter.verify();
    process.env.EMAIL_CONFIGURED = 'true';
    console.log('✅ Email (Gmail SMTP) configured and working');
  } catch (err) {
    process.env.EMAIL_CONFIGURED = 'false';
    console.warn('⚠️  Gmail SMTP verification failed — accounts will be auto-verified');
    console.warn('   Reason:', err.message);
  }
}

// ─── MongoDB connection ────────────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('whitelist') || err.message.includes('IP')) {
      console.error('');
      console.error('╔══════════════════════════════════════════════════════╗');
      console.error('║  FIX: Add your IP to MongoDB Atlas IP Whitelist      ║');
      console.error('║  1. Go to: https://cloud.mongodb.com                 ║');
      console.error('║  2. Network Access → Add IP Address                  ║');
      console.error('║  3. Add 0.0.0.0/0 for development (any IP)           ║');
      console.error('║  Or add your specific IP for production               ║');
      console.error('╚══════════════════════════════════════════════════════╝');
      console.error('');
    }
    process.exit(1);
  }
}

// Handle connection drops
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

// ─── Start server ──────────────────────────────────────────────────────────────
async function start() {
  await Promise.all([connectDB(), checkEmailConfig()]);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/mood', moodRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/anxiety-reset', anxietyResetRoutes);
  app.use('/api/healers', healerRoutes);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start();
