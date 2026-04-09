const express = require('express');
const router = express.Router();
const AnxietyResetProgress = require('../models/AnxietyResetProgress');
const Purchase = require('../models/Purchase');
const { authMiddleware } = require('./auth');

// The 21-day program content — blended CBT + spiritual approach
const PROGRAM_DAYS = [
  { day: 1, theme: 'Awareness', title: 'Meet Your Anxiety', desc: 'Understanding what you\'re feeling is the first step toward healing.', exercise: 'Box Breathing (4-4-4-4)', reflection: 'Describe your anxiety as if it were a character. What does it look like? What does it want?', task: 'Write down 3 things that triggered anxiety this week — without judgment.' },
  { day: 2, theme: 'Grounding', title: 'Anchoring to Now', desc: 'The mind travels — learn to bring it home.', exercise: '5-4-3-2-1 Grounding Technique', reflection: 'When you\'re anxious, where does your mind go? Past or future? What would the present feel like without that weight?', task: 'Set a "grounding alarm" — 3x today, pause and name what you see, hear, and feel right now.' },
  { day: 3, theme: 'Breath', title: 'Your Breath is Medicine', desc: 'Every breath is a direct line to your nervous system.', exercise: '4-7-8 Breathing for 5 minutes', reflection: 'What does it feel like to actually slow down? What comes up when you stop moving?', task: 'Practice mindful breathing for 2 minutes before each meal today.' },
  { day: 4, theme: 'Body', title: 'Where Anxiety Lives', desc: 'Anxiety lives in the body before it reaches the mind.', exercise: 'Progressive Muscle Relaxation (10 min)', reflection: 'Scan your body right now. Where do you feel tightness? What story does that area hold?', task: 'Take a 15-minute walk with no phone — just notice your body moving.' },
  { day: 5, theme: 'Thoughts', title: 'Catching the Stories', desc: 'Your thoughts are not facts. Begin to notice them.', exercise: 'Thought journaling — write thoughts without editing', reflection: 'What is the most anxious thought you\'ve had today? Is it absolutely true? How would you feel without it?', task: 'Notice 5 automatic negative thoughts today and write them down.' },
  { day: 6, theme: 'Reframing', title: 'Changing the Channel', desc: 'You can\'t stop a thought — but you can redirect it.', exercise: 'Cognitive reframing practice (10 min)', reflection: 'Take one anxious thought from yesterday and write 3 alternative interpretations — kinder, truer ones.', task: 'For every worry today, ask: "Is this within my control right now?"' },
  { day: 7, theme: 'Rest', title: 'The Sacred Art of Doing Nothing', desc: 'Rest is not laziness. It is your nervous system healing.', exercise: 'Yoga Nidra (15 min guided)', reflection: 'What does rest feel like in your body? What guilt or discomfort arises when you stop?', task: 'Block 30 minutes today for complete rest — no screens, no productivity.' },
  { day: 8, theme: 'Self-Compassion', title: 'Befriending Yourself', desc: 'You cannot heal what you punish. Kindness is the medicine.', exercise: 'Self-compassion meditation (Loving Kindness)', reflection: 'What would you say to a dear friend going through exactly what you\'re going through?', task: 'Write yourself a letter of compassion — as if from your wisest, kindest self.' },
  { day: 9, theme: 'Triggers', title: 'Mapping Your Patterns', desc: 'Anxiety has patterns. Knowing yours gives you power.', exercise: 'Trigger mapping exercise (journaling)', reflection: 'Look at your triggers. Are they present situations, or echoes of the past?', task: 'Create a simple "anxiety map" — list your top 5 triggers and what need they might represent.' },
  { day: 10, theme: 'Boundaries', title: 'The Healing Power of No', desc: 'Every yes to everyone else is often a no to yourself.', exercise: 'Values + boundaries reflection (writing)', reflection: 'Where in your life are you saying yes when your soul says no? What keeps you from claiming your space?', task: 'Practice one small boundary today — say no, limit a draining conversation, or protect your time.' },
  { day: 11, theme: 'Connection', title: 'You Are Not Alone', desc: 'Anxiety thrives in isolation. Healing happens in warmth.', exercise: 'Gratitude + connection meditation', reflection: 'Who in your life makes you feel safe? When did you last truly connect with them?', task: 'Reach out to one person today — not to vent, but to genuinely connect.' },
  { day: 12, theme: 'Inner Child', title: 'The Root of It All', desc: 'Many anxious patterns began long before today.', exercise: 'Inner child visualization (guided)', reflection: 'Imagine meeting your younger self who was first scared or anxious. What would you tell them?', task: 'Look at a childhood photo. Write 3 sentences to that child from where you are now.' },
  { day: 13, theme: 'Nature', title: 'Healing Outside Yourself', desc: 'The earth has always been a sanctuary. Return to it.', exercise: 'Mindful nature walk or grounding barefoot', reflection: 'When did you last feel truly at peace in nature? What does the natural world remind you about life?', task: 'Spend at least 20 minutes outside today — observe without your phone.' },
  { day: 14, theme: 'Halfway', title: 'Celebrating Your Journey', desc: 'You have come 14 days. That is courage.', exercise: 'Celebratory gratitude practice + free movement', reflection: 'What has shifted in you over these 14 days? What are you most proud of noticing?', task: 'Write down 5 changes — however small — that you\'ve noticed in yourself.' },
  { day: 15, theme: 'Sleep', title: 'Healing Through Rest', desc: 'Anxiety attacks hardest when we are depleted. Sleep is armor.', exercise: 'Sleep hygiene ritual — wind-down practice', reflection: 'What thoughts hijack you at night? What would you need to lay them down?', task: 'Create a 30-minute bedtime ritual and follow it tonight — no screens, soft light, calm mind.' },
  { day: 16, theme: 'Purpose', title: 'The Antidote to Anxiety', desc: 'A life with meaning is one where anxiety has less room.', exercise: 'Purpose + values journaling', reflection: 'What gives you the deepest sense of meaning? When are you most alive?', task: 'Do one thing today that connects you to your purpose, however small.' },
  { day: 17, theme: 'Surrender', title: 'Letting Go of Control', desc: 'Much of anxiety is the war against uncertainty. Peace is in the white flag.', exercise: 'Mindful release visualization', reflection: 'What are you trying to control that is beyond your control? What would it feel like to truly let go?', task: 'Write down 3 things you\'re holding too tightly — then write "I release this with love."' },
  { day: 18, theme: 'Identity', title: 'You Are More Than Your Anxiety', desc: 'Anxiety is something you experience — not something you are.', exercise: 'Identity affirmation practice (10 min)', reflection: 'If anxiety disappeared tomorrow, who would you be? What would you do?', task: 'Write 10 things that are true about you that have nothing to do with your anxiety.' },
  { day: 19, theme: 'Forgiveness', title: 'Releasing the Weight', desc: 'Unprocessed pain becomes anxious energy. Forgiveness is freedom.', exercise: 'Ho\'oponopono forgiveness practice', reflection: 'Is there something or someone — including yourself — that you haven\'t fully forgiven? What does that unforgiveness cost you?', task: 'Write a forgiveness letter you don\'t have to send — to yourself or someone else.' },
  { day: 20, theme: 'Integration', title: 'Weaving It Together', desc: 'Everything you\'ve learned this month now becomes part of you.', exercise: 'Full-body awareness scan + affirmation', reflection: 'Looking back at day 1 — how have you changed? What do you now know about yourself?', task: 'Review your journal entries from this program. Notice your growth.' },
  { day: 21, theme: 'Emergence', title: 'You Made It', desc: 'Twenty-one days of courage. You have crossed a threshold.', exercise: 'Celebration meditation + deep gratitude', reflection: 'What is the most important thing you\'re taking from this journey? What is your commitment to yourself going forward?', task: 'Write a letter to Future You — 6 months from now — about what you\'ve learned and who you\'re becoming.' },
];

// ─── Get progress ──────────────────────────────────────────────────────────────
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await AnxietyResetProgress.findOne({ userId: req.userId });
    res.json({ progress, programDays: PROGRAM_DAYS });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ─── Start program ─────────────────────────────────────────────────────────────
router.post('/start', authMiddleware, async (req, res) => {
  try {
    let progress = await AnxietyResetProgress.findOne({ userId: req.userId });
    
    if (progress) {
      // Resume or restart
      return res.json({ progress, message: 'resumed' });
    }

    progress = new AnxietyResetProgress({
      userId: req.userId,
      currentDay: 1,
      startDate: new Date(),
      dailyEntries: [],
    });
    await progress.save();

    res.status(201).json({ progress, message: 'started' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start program' });
  }
});

// ─── Complete a day ────────────────────────────────────────────────────────────
router.post('/complete-day', authMiddleware, async (req, res) => {
  try {
    const { day, journalResponse, taskDone, exerciseDone, moodScore } = req.body;
    if (!day) return res.status(400).json({ error: 'Day number is required' });

    const progress = await AnxietyResetProgress.findOne({ userId: req.userId });
    if (!progress) return res.status(404).json({ error: 'No active program found. Start the program first.' });

    // Update or add the daily entry
    const existingIdx = progress.dailyEntries.findIndex(e => e.day === day);
    const entryData = {
      day,
      completedAt: new Date(),
      journalResponse: journalResponse || '',
      taskDone: taskDone !== undefined ? taskDone : false,
      exerciseDone: exerciseDone !== undefined ? exerciseDone : false,
      moodScore: moodScore || null,
    };

    if (existingIdx >= 0) {
      progress.dailyEntries[existingIdx] = { ...progress.dailyEntries[existingIdx].toObject(), ...entryData };
    } else {
      progress.dailyEntries.push(entryData);
    }

    // Advance current day
    if (day >= progress.currentDay && day < 21) {
      progress.currentDay = day + 1;
    }
    if (day === 21) {
      progress.isCompleted = true;
    }

    // Update streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (progress.lastCompletedDate) {
      const last = new Date(progress.lastCompletedDate);
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.round((today - lastDay) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) progress.streakCount += 1;
      else if (diffDays > 1) progress.streakCount = 1;
    } else {
      progress.streakCount = 1;
    }
    progress.lastCompletedDate = now;

    await progress.save();
    res.json({ progress });
  } catch (err) {
    console.error('Complete day error:', err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// ─── Purchase a support plan ───────────────────────────────────────────────────
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { planId, planName, amount } = req.body;
    if (!planId || !planName || amount === undefined)
      return res.status(400).json({ error: 'planId, planName, and amount are required' });

    // Mock payment — in production, verify with Razorpay/Stripe first
    const purchase = new Purchase({
      userId: req.userId,
      planId,
      planName,
      planType: 'anxietyReset',
      amount,
      status: 'success',
      paymentGateway: 'mock',
    });
    await purchase.save();

    // Update anxiety reset progress with selected plan
    const planKey = planId.includes('psychologist') ? 'psychologist'
                  : planId.includes('spiritual') ? 'spiritual'
                  : 'coach';

    await AnxietyResetProgress.findOneAndUpdate(
      { userId: req.userId },
      { $set: { selectedPlan: planKey, planPurchased: true } },
      { upsert: true, new: true }
    );

    res.status(201).json({ purchase, message: 'Plan activated successfully!' });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Purchase failed. Please try again.' });
  }
});

// ─── Save selected plan (without purchase) ────────────────────────────────────
router.patch('/plan', authMiddleware, async (req, res) => {
  try {
    const { selectedPlan } = req.body;
    const progress = await AnxietyResetProgress.findOneAndUpdate(
      { userId: req.userId },
      { $set: { selectedPlan } },
      { new: true }
    );
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

module.exports = router;
