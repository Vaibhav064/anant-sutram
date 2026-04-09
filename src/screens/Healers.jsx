import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge, VerifiedBadge, OnlineDot } from '../components/ui/Badge';

export const HEALERS_DATA = [
  {
    id: '1',
    name: 'Manisha Soni',
    photo: '/healers/manisha.jpg',
    specialty: ['pranic', 'life-coach', 'relationship'],
    category: 'spiritual',
    tagline: 'Pranic Healer • Life Coach • Relationship Advisor',
    rating: 4.9, reviewCount: 142,
    priceQuick: 499, priceFull: 1499,
    isAvailableNow: true, isVerified: true,
    languages: ['English', 'Hindi'],
    experience: '8+ years',
    bio: 'Manisha Soni is a certified Pranic Healer and empathetic life coach who specializes in deep emotional healing and relationship transformation. With over 8 years of experience, she helps individuals dissolve limiting patterns and rediscover inner clarity.',
    specialties: ['Pranic Healing & Energy Cleansing', 'Relationship Conflict Resolution', 'Emotional Blockage Release', 'Self-Worth & Confidence Building'],
    reviews: [
      { name: 'Ananya R.', text: 'Manisha ji completely transformed my relationship with my partner. Her energy healing sessions are deeply profound.', rating: 5 },
      { name: 'Karan M.', text: 'After just 3 sessions, I felt a shift in my anxiety levels. She truly listens and heals from the core.', rating: 5 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 499 },
      { type: 'Deep Healing Session', duration: '45 min', price: 1499 },
      { type: 'Energy Package', duration: '3 sessions', price: 3999 },
    ]
  },
  {
    id: '2',
    name: 'Dakshina Charan',
    photo: '/healers/dakshina.jpg',
    specialty: ['pranic', 'life-coach', 'relationship'],
    category: 'spiritual',
    tagline: 'Pranic Healer • Life Coach • Relationship Advisor',
    rating: 4.8, reviewCount: 98,
    priceQuick: 599, priceFull: 1799,
    isAvailableNow: true, isVerified: true,
    languages: ['Hindi', 'English', 'Gujarati'],
    experience: '10+ years',
    bio: 'Dakshina Charan is a seasoned Pranic Healer and relationship advisor with over a decade of transformative practice. She helps individuals decode emotional wounds through energy work and guided introspection.',
    specialties: ['Advanced Pranic Healing', 'Marital & Family Counseling', 'Chakra Balancing & Aura Cleansing', 'Grief & Loss Processing'],
    reviews: [
      { name: 'Meera S.', text: 'Dakshina ma\'am has a gift. She identified my emotional blocks in the first session itself. Truly healing.', rating: 5 },
      { name: 'Rohit K.', text: 'Her pranic healing sessions brought a sense of peace I hadn\'t felt in years.', rating: 5 },
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
    rating: 4.7, reviewCount: 67,
    priceQuick: 399, priceFull: 1199,
    isAvailableNow: false, isVerified: true,
    languages: ['English', 'Hindi'],
    experience: '3+ years',
    bio: 'Priyansh Vyas is a young, highly intuitive relationship advisor and life coach. His sessions feel less like therapy and more like talking to someone who genuinely understands modern life challenges.',
    specialties: ['Modern Relationship Dynamics', 'Breakup Recovery & Moving On', 'Self-Discovery & Identity Building', 'Goal Setting & Life Direction'],
    reviews: [
      { name: 'Sneha P.', text: 'Priyansh is incredibly relatable. He helped me navigate my breakup with so much clarity and kindness.', rating: 5 },
      { name: 'Arjun D.', text: 'Finally someone who gets what our generation goes through.', rating: 4 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 399 },
      { type: 'Deep Session', duration: '45 min', price: 1199 },
      { type: 'Growth Package', duration: '3 sessions', price: 2999 },
    ]
  },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pranic', label: 'Pranic' },
  { id: 'life-coach', label: 'Life Coach' },
  { id: 'relationship', label: 'Relationship' },
];

export function Healers() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = HEALERS_DATA.filter(h => {
    const matchSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || h.specialty.includes(activeFilter);
    const matchAvailable = !showAvailableOnly || h.isAvailableNow;
    return matchSearch && matchFilter && matchAvailable;
  });

  return (
    <div className="min-h-screen bg-bg pb-nav">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5 sticky top-0 ios-glass z-20 border-b border-white/5">
        <h1 className="text-[28px] font-bold text-white mb-5 tracking-tight">Find a Healer</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface2 border border-white/6 rounded-2xl pl-10 pr-4 py-3 text-[14px] text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/25"
          />
        </div>

        {/* Filter row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-semibold transition-all border shrink-0
                ${activeFilter === f.id ? 'bg-primary text-white border-primary shadow-btn' : 'bg-surface2 text-white/50 border-white/6 hover:border-white/15'}`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-semibold transition-all border shrink-0 flex items-center gap-1.5
              ${showAvailableOnly ? 'bg-success/20 text-success border-success/30' : 'bg-surface2 text-white/50 border-white/6 hover:border-white/15'}`}
          >
            <OnlineDot size="xs" animated={false} /> Available now
          </button>
        </div>
      </div>

      {/* ── Guide Type Intro ── */}
      <div className="px-5 pt-6 pb-3">
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest mb-4">Verified Professionals</p>
      </div>

      {/* ── Healer Cards ── */}
      <div className="px-5 space-y-4 pb-6">
        {filtered.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(`/healers/${h.id}`)}
            className="bg-surface2 border border-white/8 rounded-2xl p-5 cursor-pointer hover:border-white/18 hover:bg-surface3 transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img src={h.photo} alt={h.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-[28px]">🧘‍♀️</div>
                </div>
                {h.isVerified && (
                  <div className="absolute -bottom-1.5 -right-1.5 z-10">
                    <VerifiedBadge />
                  </div>
                )}
                {h.isAvailableNow && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <OnlineDot size="sm" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <h3 className="font-bold text-[16px] text-white truncate">{h.name}</h3>
                    <p className="text-[11px] text-white/40 mt-0.5 truncate">{h.tagline}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-[15px] text-white">₹{h.priceQuick}</p>
                    <p className="text-[10px] text-white/30">/15 min</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2">
                  <Star size={12} className="text-gold fill-gold" />
                  <span className="text-[12px] text-gold font-bold">{h.rating}</span>
                  <span className="text-[11px] text-white/30">({h.reviewCount})</span>
                  <span className="text-white/20 mx-1">·</span>
                  <span className="text-[11px] text-primary-light font-medium">{h.experience}</span>
                </div>

                {/* Languages + Booking */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1.5">
                    {h.languages.slice(0, 3).map(l => (
                      <span key={l} className="text-[9px] text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 uppercase tracking-wider font-medium">
                        {l.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/healers/${h.id}`); }}
                    className="bg-primary/20 text-primary-light border border-primary/30 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-primary/30 transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-[48px] block mb-4">🔍</span>
            <p className="text-white/40 text-[16px] font-medium mb-2">No healers found</p>
            <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); setShowAvailableOnly(false); }}
              className="text-primary text-[14px] font-semibold mt-3">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
