import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Wind, CloudRain, Sun, Moon, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// Map each duration (min) to the local MP3 file in /music
const DURATION_TRACKS = {
  3:  '/music/3 minutes meditaion.mp3',
  5:  '/music/5 Minute Meditation Music for Instant Inner Peace - 5 Minutes by Great Meditation (youtube).mp3',
  10: '/music/10 Minute Super Deep Meditation Music • Connect with Your Spiritual Guide • Deep Healing - Deep Breath - Relaxing Music (youtube).mp3',
  15: '/music/15 Minute Super Deep Meditation Music • Connect with Your Spiritual Guide • Deep Healing - Deep Breath - Relaxing Music (youtube).mp3',
  20: '/music/20 Minute Deep Meditation Music • Connect To HIGHER SELF • Alpha Waves - Deep Breath - Relaxing Music (youtube).mp3',
};

const EMOTIONS = [
  { id: 'stressed', label: 'Stressed', icon: <Activity size={18} />, color: '#FFB5B5', textColor: '#A83232', suggestion: 'Box Breathing', durations: [3, 5, 10] },
  { id: 'anxious', label: 'Anxious', icon: <Wind size={18} />, color: '#C5D5F7', textColor: '#1E2A4A', suggestion: 'Grounding Body Scan', durations: [5, 10, 15] },
  { id: 'tired', label: 'Tired', icon: <Moon size={18} />, color: '#D5C8F0', textColor: '#2D1F54', suggestion: 'Yoga Nidra Deep Rest', durations: [10, 15, 20] },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: <CloudRain size={18} />, color: '#E5E7EB', textColor: '#374151', suggestion: 'Silent Stillness', durations: [3, 5, 10] },
  { id: 'calm', label: 'Calm / Focus', icon: <Sun size={18} />, color: '#FDE68A', textColor: '#92400E', suggestion: 'Vipassana Awareness', durations: [10, 15, 20] }
];

const GUIDED_INSTRUCTIONS = {
  stressed: [
    { time: 0, text: "Close your eyes. Let your shoulders drop." },
    { time: 10, text: "Breathe in through your nose for 4 counts..." },
    { time: 15, text: "Hold gently for 4 counts..." },
    { time: 20, text: "Exhale slowly through your mouth for 4 counts..." },
    { time: 25, text: "Hold empty for 4 counts. Repeat this cycle." },
    { time: 40, text: "Notice where the tension lives in your body." },
    { time: 55, text: "With each exhale, imagine that tension dissolving." },
    { time: 75, text: "You are safe. You are here. Keep breathing." },
    { time: 100, text: "Let each breath carry away what no longer serves you." },
    { time: 130, text: "You're doing beautifully. Stay with me." },
  ],
  anxious: [
    { time: 0, text: "Find a comfortable position. You're safe here." },
    { time: 10, text: "Feel your feet touching the ground beneath you." },
    { time: 20, text: "Notice 5 things you can see around you." },
    { time: 35, text: "Now notice 4 things you can physically feel." },
    { time: 50, text: "Listen for 3 sounds in this moment." },
    { time: 65, text: "Identify 2 things you can smell." },
    { time: 80, text: "Name 1 thing you can taste." },
    { time: 95, text: "Breathe deeply. You are grounded in the present." },
    { time: 115, text: "Anxiety is a wave. You are the ocean." },
    { time: 140, text: "Let it pass through you. You remain." },
  ],
  tired: [
    { time: 0, text: "Lie down if you can. Let gravity hold you." },
    { time: 15, text: "Release all effort. You don't need to do anything." },
    { time: 30, text: "Scan from the crown of your head downward..." },
    { time: 50, text: "Let your face soften. Your jaw. Your eyes." },
    { time: 70, text: "Feel your chest rise and fall naturally." },
    { time: 90, text: "Your body knows how to rest. Trust it." },
    { time: 110, text: "Sink a little deeper into stillness." },
    { time: 130, text: "There is nowhere else to be right now." },
  ],
  overwhelmed: [
    { time: 0, text: "Just stop. Everything can wait." },
    { time: 10, text: "Place your hand on your heart." },
    { time: 20, text: "Feel it beating. It hasn't forgotten you." },
    { time: 35, text: "One breath in. One breath out." },
    { time: 50, text: "That's all you need to do right now." },
    { time: 65, text: "The noise outside can wait." },
    { time: 85, text: "You are one person. That is enough." },
    { time: 110, text: "Return to yourself. The world will be there." },
  ],
  calm: [
    { time: 0, text: "Settle into awareness. No agenda." },
    { time: 15, text: "Observe your breath without changing it." },
    { time: 30, text: "Notice thoughts arising like clouds passing." },
    { time: 50, text: "Don't chase them. Don't push them away." },
    { time: 70, text: "Return gently to the breath." },
    { time: 90, text: "Awareness itself is always calm." },
    { time: 120, text: "Rest in the gap between thoughts." },
    { time: 150, text: "You are the silence beneath the noise." },
  ],
};

export function Meditate() {
  const navigate = useNavigate();
  const { moodScore, isAudioPlaying, setAudioPlaying, audioVolume, setAudioVolume, setActiveTrack } = useStore();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);

  const defaultEmotion = moodScore 
    ? (moodScore <= 3 ? 'stressed' : moodScore <= 5 ? 'anxious' : moodScore <= 7 ? 'tired' : 'calm')
    : null;

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startSession = (emotionId, durationMin) => {
    const totalSecs = durationMin * 60;
    setTotalSeconds(totalSecs);
    setSecondsLeft(totalSecs);
    setIsSessionActive(true);
    elapsedRef.current = 0;

    // Set the correct track for this duration and start playing
    const track = DURATION_TRACKS[durationMin];
    if (track) {
      setActiveTrack(track);
    }
    setAudioPlaying(true);

    const instructions = GUIDED_INSTRUCTIONS[emotionId] || [];
    if (instructions.length > 0) setCurrentInstruction(instructions[0].text);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsSessionActive(false);
          setAudioPlaying(false);
          setCurrentInstruction('Session complete. Carry this peace with you. 🙏');
          return 0;
        }
        return prev - 1;
      });

      const elapsed = elapsedRef.current;
      const matching = instructions.filter(i => i.time <= elapsed);
      if (matching.length > 0) {
        setCurrentInstruction(matching[matching.length - 1].text);
      }
    }, 1000);
  };

  const stopSession = () => {
    clearInterval(timerRef.current);
    setIsSessionActive(false);
    setSecondsLeft(0);
    setAudioPlaying(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const selectedEmotionObj = EMOTIONS.find(e => e.id === selectedEmotion);

  return (
    <div className="min-h-[100dvh] flex flex-col pb-28 relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 pt-12 pb-4 px-6 flex items-center justify-between" style={{ background: 'var(--bg-app)' }}>
        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors active:scale-90 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 tracking-tight">Mindful Reset</h1>
        <div className="w-10 h-10"></div>
      </div>

      <AnimatePresence mode="wait">
        {isSessionActive ? (
          <motion.div
            key="session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            {/* Breathing Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-14">
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute inset-[0%] rounded-full bg-[#C2E8D8] blur-xl"
              />
              
              <div className="relative w-56 h-56 rounded-full bg-white shadow-xl flex flex-col items-center justify-center z-10 border border-[#C2E8D8]">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="112" cy="112" r="108" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  <motion.circle 
                    cx="112" cy="112" r="108" 
                    fill="none" stroke="#C2E8D8" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 108}
                    initial={false}
                    animate={{ strokeDashoffset: (2 * Math.PI * 108) * (1 - (secondsLeft / totalSeconds)) }}
                    transition={{ ease: "linear", duration: 1 }}
                  />
                </svg>
                <div className="text-[48px] font-black text-gray-900 tracking-tight leading-none z-10">{formatTime(secondsLeft)}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2 z-10">Remaining</div>
              </div>
            </div>

            {/* Guided instruction */}
            <motion.div 
              key={currentInstruction}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm mb-12 max-w-[280px]"
            >
              <p className="text-[16px] font-medium italic text-gray-800 leading-relaxed text-center">
                "{currentInstruction}"
              </p>
            </motion.div>

            {/* Sound wave indicator */}
            {isAudioPlaying && (
              <div className="flex space-x-1.5 items-end h-6 mb-8 opacity-60">
                <motion.div animate={{ height: [6,16,6] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 bg-[#4B5563] rounded-full" />
                <motion.div animate={{ height: [12,6,12] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1.5 bg-[#4B5563] rounded-full" />
                <motion.div animate={{ height: [8,14,8] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-1.5 bg-[#4B5563] rounded-full" />
                <motion.div animate={{ height: [14,8,14] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1.5 bg-[#4B5563] rounded-full" />
                <motion.div animate={{ height: [10,14,10] }} transition={{ repeat: Infinity, duration: 1.3 }} className="w-1.5 bg-[#4B5563] rounded-full" />
              </div>
            )}

            <button 
              onClick={stopSession} 
              className="px-10 py-4 rounded-[20px] bg-white border border-red-100 text-red-500 font-bold text-[13px] hover:bg-red-50 transition-all shadow-sm active:scale-95"
            >
              End Session
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="px-6 mt-6 relative z-10"
          >
            <h2 className="text-[32px] font-bold text-gray-900 leading-tight mb-2 tracking-tight">How are you<br/>feeling right now?</h2>
            <p className="text-gray-500 text-[15px] mb-8 font-medium">Select a state to align the soundscape.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS.map(emo => {
                const isSelected = selectedEmotion === emo.id;
                const isRecommended = defaultEmotion === emo.id;
                
                return (
                  <button
                    key={emo.id}
                    onClick={() => setSelectedEmotion(emo.id)}
                    className={`relative p-5 rounded-3xl flex flex-col items-start gap-4 transition-all duration-300 overflow-hidden text-left border shadow-sm
                      ${isSelected ? 'bg-white border-[#1A3D2E] scale-[1.02] shadow-md z-10' : 'bg-white border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <div 
                      className={`w-12 h-12 rounded-[18px] flex items-center justify-center my-1 transition-transform group-hover:scale-110`}
                      style={{ backgroundColor: isSelected ? emo.color : '#F3F4F6', color: isSelected ? emo.textColor : '#6B7280' }}
                    >
                       {emo.icon}
                    </div>
                    <div>
                       <span className={`font-bold text-[15px] ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{emo.label}</span>
                    </div>

                    {isRecommended && !selectedEmotion && (
                      <div className="absolute top-4 right-4 bg-[#C2E8D8] text-[#1A3D2E] text-[9px] font-bold px-2 py-1 rounded-[6px] tracking-widest uppercase shadow-sm">
                        For You
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedEmotion && selectedEmotionObj && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white border border-[#C2E8D8]/50 p-6 rounded-[32px] shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2E8D8] opacity-20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="inline-flex items-center gap-1.5 mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#1A3D2E] animate-pulse" />
                   <p className="text-[10px] font-bold text-[#1A3D2E] uppercase tracking-widest">Recommended Plan</p>
                </div>
                
                <h3 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                   {selectedEmotionObj.suggestion}
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {selectedEmotionObj.durations.map(d => (
                    <button 
                      key={d}
                      onClick={() => startSession(selectedEmotion, d)}
                      className="py-4 rounded-xl bg-[#C2E8D8]/30 border border-[#C2E8D8] text-[#1A3D2E] flex flex-col items-center justify-center transition-all active:scale-95 hover:bg-[#C2E8D8]/50"
                    >
                      <span className="text-[18px] font-bold tracking-tight leading-none">{d}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70">Min</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Audio Controls */}
            <div className="mt-6 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-5">
                  <button 
                    onClick={() => {
                      if (!isAudioPlaying) setActiveTrack(DURATION_TRACKS[5]);
                      setAudioPlaying(!isAudioPlaying);
                    }}
                    className="w-14 h-14 shrink-0 rounded-[20px] bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                  >
                    {isAudioPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
                  </button>
                  
                  <div className="flex-1 min-w-0 pr-2">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Ambient Volume</p>
                     <div className="flex items-center gap-3">
                        <VolumeX size={14} className="text-gray-300 shrink-0" />
                        <input 
                          type="range"
                          min="0" max="1" step="0.01"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="flex-1 accent-[#C2E8D8] h-1.5 bg-gray-100 rounded-full appearance-none outline-none cursor-pointer"
                        />
                        <Volume2 size={14} className="text-gray-300 shrink-0" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
