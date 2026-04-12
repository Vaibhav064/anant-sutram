import { useState } from 'react';
import { ChevronDown, Flag, Heart, MessageSquare, Plus, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_POSTS = [
  { id: 1, name: 'HealingAura_42', circle: 'anxiety', content: 'Does anyone else feel like their chest is tight right before going to sleep? I tried meditation but my mind keeps racing.', relate: 12, timeAgo: '2h ago' },
  { id: 2, name: 'Starfire_9', circle: 'heartbreak', content: 'It has been 3 months and I still look for their name on my phone. When does it get easier?', relate: 45, timeAgo: '5h ago' },
  { id: 3, name: 'QuietMind', circle: 'work-stress', content: 'I just want to quit everything and move to the mountains. The corporate rush is draining my soul. But I have bills to pay.', relate: 89, timeAgo: '1d ago' },
  { id: 4, name: 'SeekingLight', circle: 'spiritual', content: 'Meditated for 20 minutes today. Felt a profound sense of stillness for the first time in years.', relate: 34, timeAgo: '1d ago' },
];

const CIRCLES = ["All", "Anxiety", "Heartbreak", "Work Stress", "Spiritual Growth", "Loneliness"];

export function Community() {
  const [activeCircle, setActiveCircle] = useState("All");
  const [showComposer, setShowComposer] = useState(false);
  const [anonName, setAnonName] = useState('GentleBreeze_11');
  const [relates, setRelates] = useState({});

  const filteredPosts = MOCK_POSTS.filter(p => {
    if (activeCircle === "All") return true;
    return p.circle === activeCircle.toLowerCase().replace(' ', '-');
  });

  const handleRelate = (id) => {
    setRelates(prev => ({ ...prev, [id]: true }));
  };

  const spinName = () => {
    const names = ['SilentRiver_7', 'WanderingSoul', 'Stardust_44', 'Emerald_Sky', 'MidnightMoon'];
    setAnonName(names[Math.floor(Math.random() * names.length)]);
  };

  return (
  return (
    <div className="min-h-screen bg-bg flex flex-col pb-24 relative overflow-x-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-14 pb-6 sticky top-0 glass-morphism z-30 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-[32px] font-black text-white tracking-tighter">Healing Circles</h1>
           <button 
             onClick={() => setShowComposer(true)} 
             className="w-12 h-12 rounded-[18px] bg-primary text-white flex items-center justify-center shadow-glow-primary btn-glow transition-transform active:scale-[0.9] hover:scale-105"
           >
             <Plus size={24} strokeWidth={3} />
           </button>
        </div>

        {/* Filter Circles */}
        <div className="flex overflow-x-auto no-scrollbar gap-2.5 px-1 -mx-1">
          {CIRCLES.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCircle(c)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.15em] transition-all border shrink-0
                ${activeCircle === c ? 'bg-primary text-white border-primary shadow-glow-primary' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}
              `}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6 mt-8">
        <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.2em]">Shared Reflections</p>
        
        {filteredPosts.map(p => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass border border-white/10 rounded-[32px] p-6 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-[18px] font-black shadow-inner">
                  {p.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-[#120F20]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-white tracking-tight leading-none mb-1.5">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-primary-light text-[10px] font-black uppercase tracking-widest">{p.circle.replace('-', ' ')}</span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{p.timeAgo}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[17px] text-white/80 leading-relaxed mb-6 font-medium tracking-tight px-1">
              {p.content}
            </p>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-5">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleRelate(p.id)} 
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all ${relates[p.id] ? 'bg-primary/20 text-primary-light shadow-glow-primary' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                >
                  <Heart size={16} className={relates[p.id] ? 'fill-primary-light stroke-primary-light' : ''} />
                  <span className="text-[12px] font-black uppercase tracking-widest">{p.relate + (relates[p.id] ? 1 : 0)} Relate</span>
                </button>
                
                <button className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 text-white/30 hover:bg-white/10 transition-all">
                  <MessageSquare size={16} />
                  <span className="text-[12px] font-black uppercase tracking-widest">Reply</span>
                </button>
              </div>
              
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/10 hover:text-alert/60 transition-all">
                <Flag size={14} />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 italic text-[16px] font-display">No thoughts shared in this circle yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showComposer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setShowComposer(false)} />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 glass-morphism rounded-t-[40px] p-8 z-50 border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.6)] pb-10"
            >
              <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10"></div>
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[28px] font-black text-white tracking-tighter">Share Inner Thought</h2>
                <button onClick={() => setShowComposer(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={20}/></button>
              </div>

              <div className="flex items-center justify-between glass border border-white/10 p-5 rounded-[24px] mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-primary/20 border border-primary/20 flex items-center justify-center text-[20px] font-black text-primary-light shadow-glow-primary">
                    {anonName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Encrypted Identity</span>
                    <span className="text-[16px] text-white font-black tracking-tight">{anonName}</span>
                  </div>
                </div>
                <button onClick={spinName} className="w-10 h-10 rounded-full bg-primary/10 text-primary-light flex items-center justify-center hover:bg-primary hover:text-white transition-all"><RefreshCw size={18} /></button>
              </div>

              <div className="relative mb-6">
                <select className="w-full bg-white/5 border border-white/10 rounded-[22px] px-6 py-4 text-[15px] font-black uppercase tracking-widest text-white appearance-none outline-none focus:border-primary transition-all">
                  <option value="anxiety">Anxiety Circle</option>
                  <option value="heartbreak">Heartbreak Circle</option>
                  <option value="work-stress">Work Stress Circle</option>
                  <option value="spiritual">Spiritual Growth Circle</option>
                  <option value="loneliness">Loneliness Circle</option>
                </select>
                <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 mb-8 focus-within:border-primary/40 focus-within:bg-white/10 transition-all">
                <textarea 
                  className="w-full bg-transparent border-0 outline-none text-white text-[18px] font-medium tracking-tight leading-relaxed placeholder:text-white/10 resize-none min-h-[160px]"
                  placeholder="The world is listening, and you are anonymized..."
                />
              </div>

              <div className="flex items-center gap-3 justify-center mb-8 px-8">
                 <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                 <p className="text-[11px] text-white/30 text-center font-black uppercase tracking-[0.15em]">
                    End-to-End Anonymous Protocol Active
                 </p>
              </div>

              <button 
                className="w-full h-18 py-5 rounded-[24px] bg-primary text-white font-black text-[16px] uppercase tracking-[0.2em] shadow-glow-primary btn-glow transform active:scale-[0.98] transition-all" 
                onClick={() => setShowComposer(false)}
              >
                Release Thought Anonymously
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
