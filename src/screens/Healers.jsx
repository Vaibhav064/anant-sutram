import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    ],
    emoji: '🌸',
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
      { name: 'Meera S.', text: "Dakshina ma'am has a gift. She identified my emotional blocks in the first session itself. Truly healing.", rating: 5 },
      { name: 'Rohit K.', text: "Her pranic healing sessions brought a sense of peace I hadn't felt in years.", rating: 5 },
    ],
    sessionTypes: [
      { type: 'Quick Check-in', duration: '15 min', price: 599 },
      { type: 'Deep Healing Session', duration: '45 min', price: 1799 },
      { type: 'Transformation Package', duration: '5 sessions', price: 6999 },
    ],
    emoji: '🌿',
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
    ],
    emoji: '🧭',
  },
];

const FILTERS = [
  { id: 'all', label: 'All Healers', emoji: '✨' },
  { id: 'pranic', label: 'Pranic', emoji: '🌸' },
  { id: 'life-coach', label: 'Life Coach', emoji: '🧭' },
  { id: 'relationship', label: 'Relationship', emoji: '💙' },
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
    <div className="min-h-[100dvh] pb-32 flex flex-col" style={{ background: 'var(--bg-app)' }}>
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 pt-12 pb-4 px-6 flex items-center justify-between" style={{ background: 'var(--bg-app)' }}>
        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-xl bg-surface border border-soft flex items-center justify-center text-sub hover:bg-surface2 transition-colors active:scale-95 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[17px] font-bold text-main tracking-tight">Connections</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* ── Search & Hero ── */}
      <div className="px-6 pt-2 pb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-bold text-[#F5B041] uppercase tracking-[0.3em] mb-1.5 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-[#F5B041]" /> Verified Professionals
          </p>
          <h2 className="text-[32px] font-bold text-main tracking-tight leading-none mb-3">
            Your Support<br/>Network
          </h2>
          <p className="text-sub text-[15px] font-medium mb-6">Find a healer who resonates with your journey.</p>
        </motion.div>

        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#F5B041] transition-colors" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-soft rounded-[20px] pl-11 pr-10 py-3.5 text-[15px] text-main focus:outline-none focus:border-[#F5B041] focus:ring-2 focus:ring-[#F5B041]/10 transition-all font-medium placeholder:text-muted shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sub hover:text-main transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-6 mb-6">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {FILTERS.map(f => (
            <motion.button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              whileTap={{ scale: 0.95 }}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] text-[13px] font-bold transition-all border shrink-0
                ${activeFilter === f.id
                  ? 'bg-surface border-[#FDE68A] text-[#92400E] shadow-sm'
                  : 'bg-transparent text-sub border-soft hover:bg-surface'}`}
            >
              <span className="text-[14px]">{f.emoji}</span> {f.label}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            whileTap={{ scale: 0.95 }}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-[13px] font-bold transition-all border shrink-0
              ${showAvailableOnly ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-transparent text-sub border-soft hover:bg-surface'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Online Now
          </motion.button>
        </div>
      </div>

      {/* ── Healer Cards ── */}
      <div className="px-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((h, i) => (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/healers/${h.id}`)}
              className="bg-surface rounded-[28px] p-5 shadow-sm border border-subtle cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDE68A] opacity-15 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-[72px] h-[72px] rounded-[20px] bg-surface2 border border-subtle flex items-center justify-center overflow-hidden">
                    <img
                      src={h.photo}
                      alt={h.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-[32px]">{h.emoji}</div>
                  </div>
                  {h.isVerified && (
                    <div className="absolute -bottom-1 -right-1 z-10 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                  )}
                  {h.isAvailableNow && (
                    <div className="absolute -top-1 -right-1 z-10 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between mb-0.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[17px] text-main tracking-tight leading-none truncate pr-2">{h.name}</h3>
                      <p className="text-[12px] text-sub mt-1.5 font-medium truncate">{h.tagline}</p>
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-surface2 border border-subtle flex items-center justify-center text-muted">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-surface2 px-2 py-1 rounded-[8px] border border-soft">
                      <Star size={11} className="text-[#F5B041] fill-[#F5B041]" />
                      <span className="text-main font-bold text-[11px]">{h.rating}</span>
                      <span className="text-muted font-bold text-[10px]">({h.reviewCount})</span>
                    </div>
                    <span className="text-main font-bold text-[9px] uppercase tracking-widest bg-surface2 border border-soft px-2.5 py-1 rounded-[8px]">{h.experience}</span>
                    {h.isAvailableNow && (
                      <span className="text-emerald-700 font-bold text-[9px] uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-[8px]">Available</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-soft">
                <div className="flex gap-1.5">
                  {h.languages.slice(0, 2).map(l => (
                    <span key={l} className="text-[9px] text-sub font-bold px-2 py-1 rounded-[6px] border border-soft uppercase tracking-widest bg-surface2">
                      {l}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted font-bold uppercase tracking-widest">from </span>
                  <span className="text-[16px] font-black text-main leading-none">₹{h.priceQuick}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-surface border border-soft border-dashed rounded-[32px] shadow-sm"
          >
            <span className="text-[40px] block mb-3">🔍</span>
            <p className="text-main text-[16px] font-bold mb-1">No healers found</p>
            <p className="text-sub text-[13px] font-medium mb-4">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); setShowAvailableOnly(false); }}
              className="text-[#92400E] bg-[#FDE68A]/30 px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-[#FDE68A]/50 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
