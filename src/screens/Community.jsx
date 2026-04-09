import { useState } from 'react';
import { Flag, Heart, MessageSquare, Plus, RefreshCw, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0F0A1E] flex flex-col pb-24 relative">
      <div className="px-6 pt-safe mt-6 flex justify-between items-center sticky top-0 bg-[#0F0A1E]/95 backdrop-blur z-20 pb-4">
        <h1 className="text-[24px] font-display font-bold text-white">Healing Circles</h1>
        <button onClick={() => setShowComposer(true)} className="bg-secondary/20 border border-secondary/30 text-secondary p-2.5 rounded-full transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.2)]">
          <Plus size={20} className="stroke-[2.5]" />
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar px-6 py-2 space-x-2 sticky top-[75px] bg-[#0F0A1E]/95 backdrop-blur z-20">
        {CIRCLES.map(c => (
          <button 
            key={c}
            onClick={() => setActiveCircle(c)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors border shadow-sm
              ${activeCircle === c ? 'bg-secondary text-[#0D0D1E] border-secondary' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}
            `}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-4">
        {filteredPosts.map(p => (
          <div key={p.id} className="w-full p-5 rounded-2xl bg-[#0D0D1E] border border-white/10 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-white text-[14px] font-bold shadow-inner">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white/90">{p.name}</h3>
                  <div className="flex items-center text-[10px] text-white/40 mt-1 font-medium">
                    <span className="text-secondary uppercase tracking-wider">{p.circle.replace('-', ' ')}</span>
                    <span className="mx-2 opacity-50">•</span>
                    <span>{p.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[15px] text-white/90 leading-relaxed mb-5 font-display">{p.content}</p>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex space-x-6">
                <button onClick={() => handleRelate(p.id)} className={`flex items-center space-x-2 transition-colors ${relates[p.id] ? 'text-secondary' : 'text-white/40 hover:text-white/60'}`}>
                  <div className={`p-1.5 rounded-full ${relates[p.id] ? 'bg-secondary/20' : 'bg-transparent'}`}>
                    <Heart size={16} className={relates[p.id] ? 'fill-secondary' : ''} />
                  </div>
                  <span className="text-[13px] font-bold">{p.relate + (relates[p.id] ? 1 : 0)} relate</span>
                </button>
                <button className="flex items-center space-x-2 text-white/40 hover:text-white/60 transition-colors">
                  <div className="p-1.5 rounded-full bg-transparent">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-[13px] font-bold">Reply</span>
                </button>
              </div>
              <button className="text-white/20 hover:text-alert transition-colors p-2">
                <Flag size={14} />
              </button>
            </div>
          </div>
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
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0F0A1E] rounded-t-3xl p-6 z-50 border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] pb-safe"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[20px] font-display font-bold text-white">Share a thought</h2>
                <button onClick={() => setShowComposer(false)} className="text-white/50 bg-white/5 border border-white/10 rounded-full p-2 hover:bg-white/10"><X size={18}/></button>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/80 to-secondary/80 flex items-center justify-center text-sm font-bold text-white shadow-lg">{anonName.charAt(0)}</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-0.5">Posting as</span>
                    <span className="text-[14px] text-white font-bold">{anonName}</span>
                  </div>
                </div>
                <button onClick={spinName} className="text-secondary bg-secondary/10 p-2.5 rounded-full hover:bg-secondary/20 transition-colors"><RefreshCw size={16} /></button>
              </div>

              <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] font-medium text-white appearance-none mb-5 outline-none focus:border-secondary transition-colors">
                <option value="anxiety">Anxiety</option>
                <option value="heartbreak">Heartbreak</option>
                <option value="work-stress">Work Stress</option>
                <option value="spiritual">Spiritual Growth</option>
                <option value="loneliness">Loneliness</option>
              </select>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 focus-within:border-primary/50 transition-colors">
                <textarea 
                  className="w-full bg-transparent border-0 outline-none text-white text-[16px] font-display leading-relaxed placeholder:text-white/30 resize-none min-h-[120px]"
                  placeholder="Share freely — this is a safe space..."
                />
              </div>

              <p className="text-[11px] text-white/40 text-center mb-6 px-4 leading-relaxed">
                This community is completely anonymous. Please be kind, and remember this is a space for healing.
              </p>

              <button className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-[16px] shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.5)] transition-shadow" onClick={() => setShowComposer(false)}>
                Share Anonymously &rarr;
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
