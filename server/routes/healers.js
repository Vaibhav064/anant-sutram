const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authMiddleware } = require('./auth');

// Static healer data (in production, migrate to Healer collection in DB)
const HEALERS_DATA = [
  {
    id: '1',
    name: 'Manisha Soni',
    photo: '/healers/manisha.jpg',
    specialty: ['pranic', 'life-coach', 'relationship'],
    category: 'spiritual',
    tagline: 'Pranic Healer • Life Coach • Relationship Advisor',
    rating: 4.9,
    reviewCount: 142,
    priceQuick: 499,
    priceFull: 1499,
    isAvailableNow: true,
    isVerified: true,
    languages: ['English', 'Hindi'],
    experience: '8+ years',
    bio: 'Manisha Soni is a certified Pranic Healer and empathetic life coach who specializes in deep emotional healing and relationship transformation. With over 8 years of experience in energy-based therapy, she helps individuals dissolve limiting patterns, heal from heartbreak, and rediscover inner clarity.',
    specialties: ['Pranic Healing & Energy Cleansing', 'Relationship Conflict Resolution', 'Emotional Blockage Release', 'Self-Worth & Confidence Building', 'Life Transition Guidance'],
    reviews: [
      { name: 'Ananya R.', text: 'Manisha ji completely transformed my relationship with my partner. Her energy healing sessions are deeply profound.', rating: 5 },
      { name: 'Karan M.', text: 'After just 3 sessions, I felt a shift in my anxiety levels. She truly listens and heals from the core.', rating: 5 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 499 },
      { type: 'Deep Healing Session', duration: '45 min', price: 1499 },
      { type: 'Pranic Energy Package', duration: '3 sessions', price: 3999 },
    ]
  },
  {
    id: '2',
    name: 'Dakshina Charan',
    photo: '/healers/dakshina.jpg',
    specialty: ['pranic', 'life-coach', 'relationship'],
    category: 'spiritual',
    tagline: 'Pranic Healer • Life Coach • Relationship Advisor',
    rating: 4.8,
    reviewCount: 98,
    priceQuick: 599,
    priceFull: 1799,
    isAvailableNow: true,
    isVerified: true,
    languages: ['Hindi', 'English', 'Gujarati'],
    experience: '10+ years',
    bio: 'Dakshina Charan is a seasoned Pranic Healer, intuitive life coach, and compassionate relationship advisor with over a decade of transformative practice.',
    specialties: ['Advanced Pranic Healing', 'Marital & Family Counseling', 'Chakra Balancing & Aura Cleansing', 'Grief & Loss Processing', 'Spiritual Awakening Guidance'],
    reviews: [
      { name: 'Meera S.', text: 'Dakshina ma\'am has a gift. She identified my emotional blocks in the first session itself. Truly healing.', rating: 5 },
      { name: 'Rohit K.', text: 'Her pranic healing sessions brought a sense of peace I hadn\'t felt in years. Highly recommended.', rating: 5 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 599 },
      { type: 'Deep Healing Session', duration: '45 min', price: 1799 },
      { type: 'Transformation Package', duration: '5 sessions', price: 6999 },
    ]
  },
  {
    id: '3',
    name: 'Priyansh Vyas',
    photo: '/healers/priyansh.jpg',
    specialty: ['relationship', 'life-coach'],
    category: 'coach',
    tagline: 'Relationship Advisor • Life Coach',
    rating: 4.7,
    reviewCount: 67,
    priceQuick: 399,
    priceFull: 1199,
    isAvailableNow: false,
    isVerified: true,
    languages: ['English', 'Hindi'],
    experience: '3+ years',
    bio: 'Priyansh Vyas is a young, highly intuitive relationship advisor and life coach. His sessions feel less like therapy and more like talking to someone who genuinely understands.',
    specialties: ['Modern Relationship Dynamics', 'Breakup Recovery & Moving On', 'Self-Discovery & Identity Building', 'Communication & Conflict Skills', 'Goal Setting & Life Direction'],
    reviews: [
      { name: 'Sneha P.', text: 'Priyansh is incredibly relatable. He helped me navigate my breakup with so much clarity and kindness.', rating: 5 },
      { name: 'Arjun D.', text: 'Finally someone who gets what our generation goes through. His advice is practical and heartfelt.', rating: 4 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 399 },
      { type: 'Deep Session', duration: '45 min', price: 1199 },
      { type: 'Growth Package', duration: '3 sessions', price: 2999 },
    ]
  },
];

// ─── Get all healers ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category, available, search } = req.query;
  let result = [...HEALERS_DATA];

  if (category && category !== 'all') {
    result = result.filter(h => h.specialty.includes(category) || h.category === category);
  }
  if (available === 'true') {
    result = result.filter(h => h.isAvailableNow);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.tagline.toLowerCase().includes(q) ||
      h.specialty.some(s => s.includes(q))
    );
  }
  res.json({ healers: result });
});

// ─── Get single healer ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const healer = HEALERS_DATA.find(h => h.id === req.params.id);
  if (!healer) return res.status(404).json({ error: 'Healer not found' });
  res.json({ healer });
});

// ─── Create booking ────────────────────────────────────────────────────────────
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const { healerId, healerName, sessionType, duration, price, notes } = req.body;
    if (!healerId || !sessionType)
      return res.status(400).json({ error: 'healerId and sessionType are required' });

    const booking = new Booking({
      userId: req.userId,
      healerId,
      healerName: healerName || '',
      sessionType,
      duration: duration || '',
      price: price || 0,
      notes: notes || '',
      status: 'confirmed', // Mock: immediately confirmed
    });
    await booking.save();
    res.status(201).json({ booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ─── Get user's bookings ───────────────────────────────────────────────────────
router.get('/bookings/mine', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
