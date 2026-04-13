import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Wind, CloudRain, Sun, Moon, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const DURATION_TRACKS = {
  3:  '/music/3 minutes meditaion.mp3',
  5:  '/music/5 Minute Meditation Music for Instant Inner Peace - 5 Minutes by Great Meditation (youtube).mp3',
  10: '/music/10 Minute Super Deep Meditation Music • Connect with Your Spiritual Guide • Deep Healing - Deep Breath - Relaxing Music (youtube).mp3',
  15: '/music/15 Minute Super Deep Meditation Music • Connect with Your Spiritual Guide • Deep Healing - Deep Breath - Relaxing Music (youtube).mp3',
  20: '/music/20 Minute Deep Meditation Music • Connect To HIGHER SELF • Alpha Waves - Deep Breath - Relaxing Music (youtube).mp3',
};

const EMOTIONS = [
  { id: 'stressed',    label: 'Stressed',     icon: <Activity size={18} />, color: '#FFB5B5', textColor: '#A83232', suggestion: 'Box Breathing',         durations: [3, 5, 10] },
  { id: 'anxious',     label: 'Anxious',      icon: <Wind size={18} />,     color: '#C5D5F7', textColor: '#1E2A4A', suggestion: 'Grounding Body Scan',   durations: [5, 10, 15] },
  { id: 'tired',       label: 'Tired',        icon: <Moon size={18} />,     color: '#D5C8F0', textColor: '#2D1F54', suggestion: 'Yoga Nidra Deep Rest',  durations: [10, 15, 20] },
  { id: 'overwhelmed', label: 'Overwhelmed',  icon: <CloudRain size={18} />, color: '#E5E7EB', textColor: '#374151', suggestion: 'Silent Stillness',     durations: [3, 5, 10] },
  { id: 'calm',        label: 'Calm / Focus', icon: <Sun size={18} />,      color: '#FDE68A', textColor: '#92400E', suggestion: 'Vipassana Awareness',  durations: [10, 15, 20] },
];

const GUIDED_INSTRUCTIONS = {
  stressed: [
    { time: 0,   text: "Close your eyes. Let your shoulders drop." },
    { time: 10,  text: "Breathe in through your nose for 4 counts..." },
    { time: 15,  text: "Hold gently for 4 counts..." },
    { time: 20,  text: "Exhale slowly through your mouth for 4 counts..." },
    { time: 25,  text: "Hold empty for 4 counts. Repeat this cycle." },
    { time: 40,  text: "Notice where the tension lives in your body." },
    { time: 55,  text: "With each exhale, imagine that tension dissolving." },
    { time: 75,  text: "You are safe. You are here. Keep breathing." },
    { time: 100, text: "Let each breath carry away what no longer serves you." },
    { time: 130, text: "You're doing beautifully. Stay with me." },
  ],
  anxious: [
    { time: 0,   text: "Find a comfortable position. You're safe here." },
    { time: 10,  text: "Feel your feet touching the ground beneath you." },
    { time: 20,  text: "Notice 5 things you can see around you." },
    { time: 35,  text: "Now notice 4 things you can physically feel." },
    { time: 50,  text: "Listen for 3 sounds in this moment." },
    { time: 65,  text: "Identify 2 things you can smell." },
    { time: 80,  text: "Name 1 thing you can taste." },
    { time: 95,  text: "Breathe deeply. You are grounded in the present." },
    { time: 115, text: "Anxiety is a wave. You are the ocean." },
    { time: 140, text: "Let it pass through you. You remain." },
  ],
  tired: [
    { time: 0,   text: "Lie down if you can. Let gravity hold you." },
    { time: 15,  text: "Release all effort. You don't need to do anything." },
    { time: 30,  text: "Scan from the crown of your head downward..." },
    { time: 50,  text: "Let your face soften. Your jaw. Your eyes." },
    { time: 70,  text: "Feel your chest rise and fall naturally." },
    { time: 90,  text: "Your body knows how to rest. Trust it." },
    { time: 110, text: "Sink a little deeper into stillness." },
    { time: 130, text: "There is nowhere else to be right now." },
  ],
  overwhelmed: [
    { time: 0,   text: "Just stop. Everything can wait." },
    { time: 10,  text: "Place your hand on your heart." },
    { time: 20,  text: "Feel it beating. It hasn't forgotten you." },
    { time: 35,  text: "One breath in. One breath out." },
    { time: 50,  text: "That's all you need to do right now." },
    { time: 65,  text: "The noise outside can wait." },
    { time: 85,  text: "You are one person. That is enough." },
    { time: 110, text: "Return to yourself. The world will be there." },
  ],
  calm: [
    { time: 0,   text: "Settle into awareness. No agenda." },
    { time: 15,  text: "Observe your breath without changing it." },
    { time: 30,  text: "Notice thoughts arising like clouds passing." },
    { time: 50,  text: "Don't chase them. Don't push them away." },
    { time: 70,  text: "Return gently to the breath." },
    { time: 90,  text: "Awareness itself is always calm." },
    { time: 120, text: "Rest in the gap between thoughts." },
    { time: 150, text: "You are the silence beneath the noise." },
  ],
};

export function Meditate() {
  const navigate = useNavigate();
  const {
    moodScore, isAudioPlaying, setAudioPlaying, audioVolume, setAudioVolume, setActiveTrack,
    meditationSession, setMeditationSession, clearMeditationSession,
  } = useStore();

  const [selectedEmotion,     setSelectedEmotion]     = useState(null);
  const [isSessionActive,     setIsSessionActive]     = useState(false);
  const [secondsLeft,         setSecondsLeft]         = useState(0);
  const [totalSeconds,        setTotalSeconds]        = useState(60);
  const [currentInstruction,  setCurrentInstruction]  = useState('');
  const timerRef   = useRef(null);
  const elapsedRef = useRef(0);

  const defaultEmotion = moodScore
    ? (moodScore <= 3 ? 'stressed' : moodScore <= 5 ? 'anxious' : moodScore <= 7 ? 'tired' : 'calm')
    : null;

  // ── Resume persisted session on mount ──────────────────────────────────────
  useEffect(() => {
    if (meditationSession?.startedAt) {
      const { emotionId, totalSecs, startedAt } = meditationSession;
      const elapsed   = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, totalSecs - elapsed);

      if (remaining > 0) {
        setSelectedEmotion(emotionId);
        setTotalSeconds(totalSecs);
        setSecondsLeft(remaining);
        setIsSessionActive(true);
        elapsedRef.current = elapsed;

        const instructions = GUIDED_INSTRUCTIONS[emotionId] || [];
        const matching = instructions.filter(i => i.time <= elapsed);
        if (matching.length > 0) setCurrentInstruction(matching[matching.length - 1].text);
        else if (instructions.length > 0) setCurrentInstruction(instructions[0].text);

        timerRef.current = setInterval(() => {
          elapsedRef.current += 1;
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsSessionActive(false);
              setAudioPlaying(false);
              clearMeditationSession();
              setCurrentInstruction('Session complete. Carry this peace with you. 🙏');
              return 0;
            }
            return prev - 1;
          });
          const el = elapsedRef.current;
          const m  = (GUIDED_INSTRUCTIONS[emotionId] || []).filter(i => i.time <= el);
          if (m.length > 0) setCurrentInstruction(m[m.length - 1].text);
        }, 1000);
      } else {
        clearMeditationSession();
        setAudioPlaying(false);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = (emotionId, durationMin) => {
    const totalSecs = durationMin * 60;
    setTotalSeconds(totalSecs);
    setSecondsLeft(totalSecs);
    setIsSessionActive(true);
    elapsedRef.current = 0;

    setMeditationSession({ emotionId, durationMin, totalSecs, startedAt: Date.now() });

    const track = DURATION_TRACKS[durationMin];
    if (track) setActiveTrack(track);
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
          clearMeditationSession();
          setCurrentInstruction('Session complete. Carry this peace with you. 🙏');
          return 0;
        }
        return prev - 1;
      });
      const elapsed  = elapsedRef.current;
      const matching = instructions.filter(i => i.time <= elapsed);
      if (matching.length > 0) setCurrentInstruction(matching[matching.length - 1].text);
    }, 1000);
  };

  const stopSession = () => {
    clearInterval(timerRef.current);
    setIsSessionActive(false);
    setSecondsLeft(0);
    setAudioPlaying(false);
    clearMeditationSession();
  };

  const formatTime = s => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const selectedEmotionObj = EMOTIONS.find(e => e.id === selectedEmotion);
  const circumference      = 2 * Math.PI * 108;
  const progress           = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    /* ── Root: allow scroll on selection, lock on session ── */
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: isSessionActive ? 'transparent' : 'var(--bg-app)',
      }}
    >

      {/* ══ SESSION BACKGROUND — AI nature image (shown only during session) ══ */}
      {isSessionActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
          }}
        >
          {/* The AI-generated image */}
          <img
            src="/meditation_bg.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'blur(6px) brightness(0.55) saturate(1.3)',
              transform: 'scale(1.08)', // prevents white edges from blur
            }}
          />
          {/* Subtle gradient overlay for readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(10,5,30,0.45) 0%, rgba(5,20,12,0.30) 50%, rgba(10,5,30,0.55) 100%)',
            }}
          />
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '48px',
          paddingBottom: '16px',
          paddingLeft: '24px',
          paddingRight: '24px',
          background: isSessionActive
            ? 'transparent'
            : 'rgba(var(--bg-app-rgb, 255,255,255), 0.85)',
          backdropFilter: isSessionActive ? 'none' : 'blur(10px)',
          WebkitBackdropFilter: isSessionActive ? 'none' : 'blur(10px)',
          borderBottom: isSessionActive ? 'none' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => navigate('/home')}
          style={{
            width: 40, height: 40,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s',
            background: isSessionActive ? 'rgba(255,255,255,0.12)' : 'white',
            border: isSessionActive ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(0,0,0,0.10)',
            color: isSessionActive ? 'white' : '#555',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <h1 style={{
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.3px',
          color: isSessionActive ? 'white' : 'var(--text-main, #111)',
          margin: 0,
        }}>
          Mindful Reset
        </h1>

        <div style={{ width: 40 }} />
      </div>

      {/* ══ CONTENT ══ */}
      <AnimatePresence mode="wait">

        {/* ─── SESSION SCREEN ─── */}
        {isSessionActive ? (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
              paddingTop: 32,
              paddingLeft: 32,
              paddingRight: 32,
              paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))',
              justifyContent: 'center',
              minHeight: 'calc(100dvh - 88px)',
            }}
          >
            {/* Breathing Circle */}
            <div style={{ position: 'relative', width: 256, height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>

              {/* Outer glow */}
              <motion.div
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.2, 0.45, 0.2] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: selectedEmotionObj?.color || '#C2E8D8',
                  filter: 'blur(48px)',
                }}
              />

              {/* Main circle */}
              <motion.div
                animate={{ scale: [0.88, 1.08, 0.88] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                style={{
                  position: 'relative',
                  width: 220, height: 220,
                  borderRadius: '50%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                {/* Progress ring */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="110" cy="110" r="107" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
                  <motion.circle
                    cx="110" cy="110" r="107"
                    fill="none"
                    stroke="rgba(255,255,255,0.72)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 107}
                    animate={{ strokeDashoffset: 2 * Math.PI * 107 * (1 - progress) }}
                    transition={{ ease: 'linear', duration: 1 }}
                  />
                </svg>

                <div style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
                  {formatTime(secondsLeft)}
                </div>

                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 800, marginTop: 8, position: 'relative', zIndex: 1 }}
                >
                  {Math.floor(elapsedRef.current / 4) % 2 === 0 ? 'Inhale' : 'Exhale'}
                </motion.div>
              </motion.div>
            </div>

            {/* Guided instruction */}
            <motion.div
              key={currentInstruction}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '20px 24px',
                borderRadius: 28,
                marginBottom: 40,
                maxWidth: 300,
                background: 'rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.16)',
              }}
            >
              <p style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, margin: 0 }}>
                "{currentInstruction}"
              </p>
            </motion.div>

            {/* Sound bars */}
            {isAudioPlaying && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 24, marginBottom: 32 }}>
                {[1.2, 0.9, 1.4, 1.1, 1.3].map((dur, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [6, 18, 6] }}
                    transition={{ repeat: Infinity, duration: dur, delay: i * 0.1 }}
                    style={{ width: 5, borderRadius: 4, background: 'rgba(255,255,255,0.42)' }}
                  />
                ))}
              </div>
            )}

            {/* End Session */}
            <button
              onClick={stopSession}
              style={{
                padding: '14px 40px',
                borderRadius: 50,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.04em',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.28)',
                color: 'rgba(255,255,255,0.90)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'transform 0.15s, background 0.15s',
              }}
            >
              End Session
            </button>
          </motion.div>

        ) : (

          /* ─── SELECTION SCREEN ─── */
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ flex: 1, position: 'relative', zIndex: 10 }}
          >
            <div style={{ padding: '32px 24px 140px' }}>

              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-main, #111)', lineHeight: 1.25, marginBottom: 8, letterSpacing: '-0.5px' }}>
                How are you<br />feeling right now?
              </h2>
              <p style={{ color: '#888', fontSize: 15, marginBottom: 32, fontWeight: 500 }}>
                Select a state to align the soundscape.
              </p>

              {/* Emotion grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {EMOTIONS.map(emo => {
                  const isSelected    = selectedEmotion === emo.id;
                  const isRecommended = defaultEmotion === emo.id;
                  return (
                    <button
                      key={emo.id}
                      onClick={() => setSelectedEmotion(emo.id)}
                      style={{
                        position: 'relative',
                        padding: 20,
                        borderRadius: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 16,
                        textAlign: 'left',
                        background: 'white',
                        border: isSelected ? '1.5px solid #1A3D2E' : '1px solid #f0f0f0',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.10)' : '0 1px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.25s',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSelected ? emo.color : '#F3F4F6',
                        color: isSelected ? emo.textColor : '#6B7280',
                      }}>
                        {emo.icon}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: isSelected ? '#111' : '#555' }}>
                        {emo.label}
                      </span>
                      {isRecommended && !selectedEmotion && (
                        <div style={{
                          position: 'absolute', top: 14, right: 14,
                          background: '#C2E8D8', color: '#1A3D2E',
                          fontSize: 9, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 6, letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                          For You
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Duration picker */}
              {selectedEmotion && selectedEmotionObj && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 32,
                    background: 'white',
                    border: '1px solid rgba(194,232,216,0.5)',
                    padding: 24,
                    borderRadius: 32,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: -64, right: -64, width: 128, height: 128, background: '#C2E8D8', opacity: 0.18, borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A3D2E', animation: 'pulse 2s infinite' }} />
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#1A3D2E', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Recommended Plan</p>
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 24, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                    {selectedEmotionObj.suggestion}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {selectedEmotionObj.durations.map(d => (
                      <button
                        key={d}
                        onClick={() => startSession(selectedEmotion, d)}
                        style={{
                          padding: '16px 0',
                          borderRadius: 12,
                          background: 'rgba(194,232,216,0.3)',
                          border: '1px solid #C2E8D8',
                          color: '#1A3D2E',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.15s, background 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{d}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, opacity: 0.7 }}>Min</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Audio Controls */}
              <div style={{
                marginTop: 24,
                background: 'white',
                border: '1px solid #f0f0f0',
                borderRadius: 28,
                padding: 20,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button
                    onClick={() => {
                      if (!isAudioPlaying) setActiveTrack(DURATION_TRACKS[5]);
                      setAudioPlaying(!isAudioPlaying);
                    }}
                    style={{
                      width: 56, height: 56, flexShrink: 0,
                      borderRadius: 20,
                      background: '#F9F9F9',
                      border: '1px solid #eee',
                      color: '#444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'transform 0.15s',
                    }}
                  >
                    {isAudioPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                      Ambient Volume
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <VolumeX size={14} style={{ color: '#ccc', flexShrink: 0 }} />
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={audioVolume}
                        onChange={e => setAudioVolume(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#C2E8D8', height: 6, background: '#eee', borderRadius: 4, outline: 'none', cursor: 'pointer' }}
                      />
                      <Volume2 size={14} style={{ color: '#ccc', flexShrink: 0 }} />
                    </div>
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
