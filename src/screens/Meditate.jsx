import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Wind, CloudRain, Sun, Moon, Activity, Timer } from 'lucide-react';
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
  { id: 'stressed', label: 'Stressed', icon: <Activity size={20} />, color: 'text-alert bg-alert/10 border-alert/30', suggestion: 'Box Breathing', durations: [3, 5, 10] },
  { id: 'anxious', label: 'Anxious', icon: <Wind size={20} />, color: 'text-primary bg-primary/10 border-primary/30', suggestion: 'Grounding Body Scan', durations: [5, 10, 15] },
  { id: 'tired', label: 'Tired', icon: <Moon size={20} />, color: 'text-secondary bg-secondary/10 border-secondary/30', suggestion: 'Yoga Nidra Deep Rest', durations: [10, 15, 20] },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: <CloudRain size={20} />, color: 'text-white bg-white/10 border-white/30', suggestion: 'Silent Stillness', durations: [3, 5, 10] },
  { id: 'calm', label: 'Calm / Focus', icon: <Sun size={20} />, color: 'text-gold bg-gold/10 border-gold/30', suggestion: 'Vipassana Awareness', durations: [10, 15, 20] }
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
    const totalSeconds = durationMin * 60;
    setSecondsLeft(totalSeconds);
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
    <div className="min-h-[100dvh] bg-transparent text-white flex flex-col pb-28 relative z-10">
      <div className="sticky top-0 bg-bg/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between z-20 pt-safe">
        <button onClick={() => navigate(-1)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[18px] font-display font-medium text-white tracking-wide">Meditate</h1>
        <div className="w-8"></div>
      </div>

      <AnimatePresence mode="wait">
        {isSessionActive ? (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            {/* Breathing Ring */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-10">
              <motion.div 
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              />
              <motion.div 
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute inset-4 rounded-full border-2 border-primary/40"
              />
              <motion.div 
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute inset-10 rounded-full border border-secondary/30"
              />
              <div className="relative z-10 text-center">
                <div className="text-[44px] font-display font-bold text-white tracking-wider">{formatTime(secondsLeft)}</div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.25em] font-bold mt-1">remaining</div>
              </div>
            </div>

            {/* Guided instruction */}
            <motion.p 
              key={currentInstruction}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[20px] font-display italic text-white/90 max-w-xs leading-relaxed mb-12"
            >
              "{currentInstruction}"
            </motion.p>

            {/* Sound wave indicator */}
            {isAudioPlaying && (
              <div className="flex space-x-1.5 items-end h-6 mb-8 opacity-50">
                <motion.div animate={{ height: [6,20,6] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 bg-secondary rounded-full" />
                <motion.div animate={{ height: [14,6,14] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1.5 bg-secondary rounded-full" />
                <motion.div animate={{ height: [8,18,8] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-1.5 bg-secondary rounded-full" />
                <motion.div animate={{ height: [16,8,16] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1.5 bg-secondary rounded-full" />
                <motion.div animate={{ height: [10,16,10] }} transition={{ repeat: Infinity, duration: 1.3 }} className="w-1.5 bg-secondary rounded-full" />
              </div>
            )}

            <button onClick={stopSession} className="px-8 py-3.5 rounded-full border border-white/20 text-white/70 font-medium hover:bg-white/10 transition-colors text-[14px]">
              End Session
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 mt-8"
          >
            <h2 className="text-[32px] font-display font-bold leading-tight mb-2">How is your mind <br/>right now?</h2>
            <p className="text-white/50 text-[14px]">Select how you feel to get a personalized session.</p>
            
            <div className="mt-8 flex flex-wrap gap-3">
              {EMOTIONS.map(emo => {
                const isSelected = selectedEmotion === emo.id;
                const isRecommended = defaultEmotion === emo.id;
                
                return (
                  <button
                    key={emo.id}
                    onClick={() => setSelectedEmotion(emo.id)}
                    className={`relative px-4 py-3 rounded-2xl flex items-center space-x-3 border transition-all duration-300
                      ${isSelected ? emo.color + ' border-opacity-100 shadow-lg scale-[1.02]' : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'}
                    `}
                  >
                    {isRecommended && !selectedEmotion && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-primary/50 tracking-wider">
                        FOR YOU
                      </div>
                    )}
                    <div className={isSelected ? '' : 'text-white/40'}>{emo.icon}</div>
                    <span className="font-medium text-[14px]">{emo.label}</span>
                  </button>
                )
              })}
            </div>

            {selectedEmotion && selectedEmotionObj && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 bg-[#1A1A2E]/50 border border-primary/20 p-6 rounded-3xl backdrop-blur-md shadow-[0_10px_30px_rgba(139,92,246,0.15)]"
              >
                <div className="text-[11px] uppercase tracking-widest text-primary font-bold mb-2">Guided Session</div>
                <h3 className="text-[24px] font-display text-white mb-2 font-bold leading-snug">
                  {selectedEmotionObj.suggestion}
                </h3>
                <p className="text-white/40 text-[13px] mb-6">Real-time guided instructions with your meditation music.</p>
                
                <div className="flex space-x-3">
                  {selectedEmotionObj.durations.map(d => (
                    <button 
                      key={d}
                      onClick={() => startSession(selectedEmotion, d)}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3.5 rounded-full font-bold text-[14px] shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center space-x-2"
                    >
                      <Timer size={16} />
                      <span>{d} min</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ambient sound controls */}
            <div className="mt-10 bg-[#0C0C1A] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/15 blur-[50px] rounded-full pointer-events-none" />
              
              <h3 className="text-[18px] font-display font-bold mb-1">Ambient Soundscape</h3>
              <p className="text-white/40 text-[13px] mb-6 pr-16 leading-relaxed">Your meditation music plays globally across the app.</p>
              
              <div className="flex items-center space-x-5">
                <button 
                  onClick={() => {
                    if (!isAudioPlaying) {
                      // Default to the 5-min track for ambient listening
                      setActiveTrack(DURATION_TRACKS[5]);
                    }
                    setAudioPlaying(!isAudioPlaying);
                  }}
                  className="w-14 h-14 shrink-0 rounded-full bg-white text-[#0C0C1A] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(255,255,255,0.2)] border-none"
                >
                  {isAudioPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex justify-between items-center text-white/50 text-[11px] uppercase font-bold tracking-widest">
                    <VolumeX size={14} />
                    <span>{Math.round(audioVolume * 100)}%</span>
                    <Volume2 size={14} />
                  </div>
                  <input 
                    type="range"
                    min="0" max="1" step="0.01"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full accent-secondary h-1.5 bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
                  />
                </div>
              </div>
              
              {isAudioPlaying && (
                <div className="absolute top-6 right-6 flex space-x-1 items-end h-5 opacity-40">
                   <motion.div animate={{ height: [5,16,5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 bg-secondary rounded-full" />
                   <motion.div animate={{ height: [10,6,10] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1.5 bg-secondary rounded-full" />
                   <motion.div animate={{ height: [6,14,6] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 bg-secondary rounded-full" />
                   <motion.div animate={{ height: [12,5,12] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1.5 bg-secondary rounded-full" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
