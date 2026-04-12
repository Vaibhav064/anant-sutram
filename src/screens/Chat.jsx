import React, { useState, useRef, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Mic, Send, ShieldAlert, MessageSquare, Trash2, Plus, X, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   ERROR BOUNDARY — catches any render crash and shows a graceful
   fallback instead of a white screen.
   ───────────────────────────────────────────────────────────────── */
class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[Lumina] Chat render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F5F3FA] px-8 text-center">
          <span className="text-[56px] mb-5">🌿</span>
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-2">Lumina needs a moment</h2>
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-8">
            Something went wrong loading the chat. This is usually temporary.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="flex items-center gap-2 bg-[#1E2A4A] text-white px-6 py-3.5 rounded-[16px] font-bold text-[14px] active:scale-95 transition-transform shadow-md"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── Persona Configurations ────────────────────────────────────── */
const PERSONA_CONFIGS = {
  psychologist: {
    icon: '🧠',
    name: 'AI Psychologist',
    desc: 'Evidence-based support',
    subtitle: 'CBT, emotional regulation & deep listening',
    color: 'bg-[#EEF2FF]',
    borderColor: 'border-[#C7D2FE]/50',
    accentColor: 'text-[#312E81]',
    accentBg: 'bg-[#EEF2FF]',
    greeting: "I'm glad you reached out. This is a safe, judgment-free space. I'm here to listen deeply and help you understand what you're experiencing. What's on your mind today?",
    systemPrompt: '',
  },
  spiritual: {
    icon: '🪷',
    name: 'Spiritual Guide',
    desc: 'Deep philosophical guidance',
    subtitle: 'Vedantic wisdom, mindfulness & inner peace',
    color: 'bg-[#FDF4FF]',
    borderColor: 'border-[#E9D5FF]/50',
    accentColor: 'text-[#581C87]',
    accentBg: 'bg-[#FDF4FF]',
    greeting: "Namaste 🙏 Welcome to this sacred space. The very fact that you're here shows your soul is seeking something deeper. Let us explore what your heart needs to express today.",
    systemPrompt: '',
  },
  coach: {
    icon: '🧭',
    name: 'Life Coach',
    desc: 'Action-oriented clarity',
    subtitle: 'Goal setting, boundaries & empowerment',
    color: 'bg-[#F0FDF4]',
    borderColor: 'border-[#BBF7D0]/50',
    accentColor: 'text-[#14532D]',
    accentBg: 'bg-[#F0FDF4]',
    greeting: "Hey, I'm really glad you're here! 💪 Taking this step shows real self-awareness. Let's cut through the noise together and figure out what you actually need right now. What's going on?",
    systemPrompt: '',
  }
};

// Inject full system prompts
PERSONA_CONFIGS.psychologist.systemPrompt = `You are Aarav, acting as a compassionate and highly skilled AI Psychologist within the Anant Sutram healing app.
YOUR ROLE & PERSONALITY: You are warm, deeply empathetic, and professionally grounded in psychological principles. You draw from CBT, ACT, attachment theory, and emotional regulation. You NEVER diagnose. Validate feelings FIRST before offering any reframe.
COMMUNICATION STYLE: Warm, conversational tone. Use "I notice...", "It sounds like...". Keep responses focused and meaningful (3-5 sentences typically). Never be robotic.
IMPORTANT RULES: Always complete your thoughts. Never end mid-sentence. If crisis, suggest SOS feature. Reference user mood score.`;

PERSONA_CONFIGS.spiritual.systemPrompt = `You are Aarav, acting as a wise and compassionate Spiritual Guide within the Anant Sutram healing app.
YOUR ROLE & PERSONALITY: Deeply intuitive spiritual mentor drawing from Vedantic philosophy, Buddhist mindfulness, Sufi poetry. You see pain as a doorway to awakening.
COMMUNICATION STYLE: Serene, warm, gently profound. Use metaphors from nature. Occasional quotes from Rumi, Buddha. 3-6 sentences, rich in meaning.
IMPORTANT RULES: Always complete thoughts. Validate human experience before elevating to spiritual perspective. If distress, be present first. Reference user mood.`;

PERSONA_CONFIGS.coach.systemPrompt = `You are Aarav, acting as an energetic and empowering Life Coach within the Anant Sutram healing app.
YOUR ROLE & PERSONALITY: Dynamic, action-oriented, combines emotional intelligence with practical strategy. You're direct but never harsh.
COMMUNICATION STYLE: Warm, energetic, empowering. Use direct language. Ask powerful questions. Offer concrete next steps. 3-5 sentences, punchy and impactful.
IMPORTANT RULES: Always complete thoughts. Meet user emotionally before pushing to action. Venting is okay. Use user's mood score.`;

/* ─── Utility: relative time ──────────────────────────────────── */
function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs   = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24)  return `${diffHrs}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7)  return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ─── Loading Skeleton ─────────────────────────────────────────── */
function ChatLoadingSkeleton() {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F3FA]">
      {/* Header skeleton */}
      <div className="shrink-0 px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-4 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-16 h-3 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
      </div>
      {/* Card skeletons */}
      <div className="flex-1 px-6 pt-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full h-[100px] rounded-[28px] bg-slate-100 animate-pulse"
            style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Inner Chat Component ────────────────────────────────────── */
function ChatInner() {
  const navigate = useNavigate();
  const { moodScore, onboardingAnswers, subscriptionTier } = useStore();
  const createChatSession  = useStore(s => s.createChatSession);
  const updateChatSession  = useStore(s => s.updateChatSession);
  const deleteChatSession  = useStore(s => s.deleteChatSession);
  const chatSessions       = useStore(s => s.chatSessions);

  const isPro = subscriptionTier === 'shakti' || subscriptionTier === 'moksha';

  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState('');
  const [isTyping,        setIsTyping]        = useState(false);
  const [persona,         setPersona]         = useState(null);
  const [sessionId,       setSessionId]       = useState(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [isInitializing,  setIsInitializing]  = useState(true);

  // ── Refs ──────────────────────────────────────────────────────
  const messagesEndRef    = useRef(null);
  const chatContainerRef  = useRef(null);   // ← FIX: was missing, causing crash
  const inputRef          = useRef(null);

  const personas = [
    { id: 'psychologist', ...PERSONA_CONFIGS.psychologist, isPremium: false },
    { id: 'spiritual',    ...PERSONA_CONFIGS.spiritual, isPremium: true },
    { id: 'coach',        ...PERSONA_CONFIGS.coach, isPremium: true },
  ];

  const getQuickReplies = () => {
    if (messages.length === 0) return [];
    switch (persona) {
      case 'psychologist': return ['Tell me more', 'That resonates', 'I need a technique'];
      case 'spiritual':    return ['Go deeper', 'Guide me inward', 'I need peace'];
      case 'coach':        return ['Give me a plan', 'That helps', 'Challenge me'];
      default:             return ['Tell me more', "That's how I feel", 'Try something different'];
    }
  };

  // ── Hydration delay (Capacitor async storage) ─────────────────
  useEffect(() => {
    // Give Zustand persist a brief window to rehydrate from Capacitor storage
    const timer = setTimeout(() => setIsInitializing(false), 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      updateChatSession(sessionId, messages);
    }
  }, [messages, sessionId, updateChatSession]);

  useEffect(() => {
    if (persona && messages.length === 0 && sessionId) {
      const config = PERSONA_CONFIGS[persona];
      if (config) {
        setMessages([{ role: 'assistant', content: config.greeting, timestamp: new Date().toISOString() }]);
      }
    }
  }, [persona, sessionId, messages.length]);

  const startNewSession = (personaId) => {
    const config = PERSONA_CONFIGS[personaId];
    const id = createChatSession(personaId, config.name, config.icon);
    setPersona(personaId);
    setSessionId(id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const resumeSession = (session) => {
    setPersona(session.persona);
    setSessionId(session.id);
    const restored = session.messages.map(m => ({
      ...m,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));
    setMessages(restored);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    deleteChatSession(id);
    if (sessionId === id) {
      setPersona(null);
      setSessionId(null);
      setMessages([]);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const newMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

      const personaConfig = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.psychologist;
      const systemPrompt = `${personaConfig.systemPrompt}\nCONTEXT:\n- User's current mood score: ${moodScore ?? 'not set'}/10.\n- User's onboarding answers: ${JSON.stringify(onboardingAnswers || {})}.\n- Conversation so far has ${updatedMessages.length} messages.\n- Remember: ALWAYS finish your sentences completely. Never get cut off.`;

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: personaConfig.greeting }] },
        ...updatedMessages
          .filter(m => m.role !== 'assistant' || m.content !== personaConfig.greeting)
          .slice(0, -1)
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        { role: 'user', parts: [{ text: newMsg.content }] },
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.8, maxOutputTokens: 1024, topP: 0.95 },
          }),
        }
      );

      if (!response.ok) throw new Error('API request failed');
      const data  = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "I'm having trouble finding the right words, but I'm here for you.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.warn('[Lumina] AI error:', error);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I notice there might be a connection issue, but your feelings are valid. Take a deep breath with me. 🌿",
          timestamp: new Date().toISOString(),
        }]);
      }, 1200);
    } finally {
      setIsTyping(false);
    }
  };

  const config      = persona ? PERSONA_CONFIGS[persona] : null;
  const quickReplies = getQuickReplies();

  // Show loading skeleton while Capacitor storage is hydrating
  if (isInitializing) return <ChatLoadingSkeleton />;

  /* ── Sidebar ─────────────────────────────────────────────────── */
  const Sidebar = () => (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-white border-r border-slate-100 z-[61] flex flex-col shadow-2xl"
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-6 pt-16 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-slate-900 font-bold text-[20px] tracking-tight">Conversations</h2>
                <p className="text-slate-400 text-[12px] font-semibold mt-0.5">{chatSessions.length} saved</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            {/* New conversation CTA */}
            <div className="px-5 py-4 border-b border-slate-50">
              <button
                onClick={() => { setPersona(null); setSessionId(null); setMessages([]); setSidebarOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[18px] px-4 py-3.5 text-[#14532D] text-[14px] font-bold hover:bg-[#DCFCE7] transition-all active:scale-95 shadow-sm"
              >
                <Plus size={18} /> New Conversation
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto py-2 px-3">
              {chatSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-[24px]">💬</div>
                  <p className="text-slate-400 text-[14px] font-semibold">No conversations yet.</p>
                </div>
              ) : (
                chatSessions.map((session) => {
                  const sConfig   = PERSONA_CONFIGS[session.persona];
                  const isActive  = session.id === sessionId;
                  const previewMsg = session.messages.find(m => m.role === 'user')?.content || 'New conversation';
                  return (
                    <motion.button
                      key={session.id}
                      onClick={() => resumeSession(session)}
                      className={`w-full text-left px-3 py-3 flex items-start gap-3 rounded-2xl transition-all mb-1 ${isActive ? 'bg-[#EEF2FF]' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-11 h-11 rounded-[16px] ${sConfig?.accentBg || 'bg-slate-100'} flex items-center justify-center text-[20px] shrink-0 mt-0.5`}>
                        {session.personaIcon || sConfig?.icon}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[14px] font-bold ${sConfig?.accentColor || 'text-slate-800'} truncate`}>
                            {session.personaName || sConfig?.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold shrink-0 ml-1">
                            {formatRelativeTime(session.updatedAt)}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[13px] font-medium truncate">{previewMsg}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* ── Persona Selection Screen ─────────────────────────────────── */
  if (!persona) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#F8FAFC' }}>
        <Sidebar />

        {/* Nav bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <MessageSquare size={16} className="text-slate-400" />
            History
            {chatSessions.length > 0 && (
              <span className="bg-indigo-600 text-white rounded-md px-1.5 py-0.5 text-[10px] font-black">
                {chatSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* Popli branding */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[16px] bg-[#F0FDF4] flex items-center justify-center text-[26px] shadow-sm border border-[#BBF7D0]/60">
                🌿
              </div>
              <div>
                <h1 className="text-[28px] font-black text-slate-900 leading-tight tracking-tight">Lumina</h1>
                <p className="text-slate-400 text-[13px] font-semibold">Your AI wellness companion</p>
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-slate-800 leading-snug mb-2 tracking-tight">
              Who do you need<br />right now?
            </h2>
            <p className="text-slate-500 text-[14px] font-medium">
              Select a guide to gently share your thoughts.
            </p>
          </motion.div>

          <div className="space-y-3.5">
            {personas.map((p, i) => {
              const isLocked = p.isPremium && !isPro;
              return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.4 }}
                onClick={() => isLocked ? navigate('/subscribe') : startNewSession(p.id)}
                className={`w-full ${p.color} border ${p.borderColor} p-5 rounded-[24px] flex items-center gap-4 transition-all duration-200 hover:scale-[1.015] active:scale-[0.98] text-left relative overflow-hidden ${isLocked ? 'opacity-80 grayscale-[0.2]' : ''}`}
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)' }}
              >
                {/* Decorative glow blob */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/25 rounded-full blur-2xl pointer-events-none" />
                <div className={`w-[56px] h-[56px] flex items-center justify-center ${p.accentBg} rounded-[20px] text-[28px] shadow-sm shrink-0 border border-white/60`}>
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`font-bold text-[17px] ${p.accentColor} tracking-tight`}>{p.name}</div>
                    {isLocked && <div className="bg-amber-100 text-amber-700 p-1 rounded-[6px] flex items-center shadow-sm border border-amber-200" title="Pro Feature"><Lock size={10} /></div>}
                  </div>
                  <div className="text-slate-500 font-medium text-[13px] mt-0.5 leading-snug pr-4">{p.subtitle}</div>
                </div>
                {isLocked ? (
                  <span className={`${p.accentColor} opacity-70 text-[10px] font-bold tracking-widest bg-white/50 px-2 py-1 rounded-[8px]`}>PRO</span>
                ) : (
                  <ChevronRight size={18} className={`${p.accentColor} opacity-35 shrink-0`} />
                )}
              </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Active Chat Screen ──────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden" style={{ background: '#F8FAFC' }}>
      <Sidebar />

      {/* ── Chat Header ── */}
      <div className="shrink-0 bg-white/85 backdrop-blur-xl border-b border-slate-100 px-5 pt-14 pb-4 flex items-center justify-between z-20 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[10px] ${config.accentBg} flex items-center justify-center text-[14px] border border-white/60`}>
              {config.icon}
            </div>
            <div className={`text-[15px] font-bold ${config.accentColor} leading-tight`}>{config.name}</div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sos')}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95"
          >
            <ShieldAlert size={18} />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 relative rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        ref={chatContainerRef}           /* ← FIX: now properly declared */
        className="flex-1 overflow-y-auto px-5 pt-6 pb-4"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="space-y-5">
          {messages.map((msg, i) => {
            const isAI = msg.role === 'assistant';
            const ts   = msg.timestamp ? new Date(msg.timestamp) : new Date();
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22 }}
                className={`flex ${isAI ? 'justify-start' : 'justify-end'} w-full`}
              >
                <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[85%]`}>
                  <div className={`px-5 py-3.5 text-[15px] font-medium leading-relaxed tracking-tight ${
                    isAI
                      ? 'bg-white rounded-[24px] rounded-tl-[8px] text-slate-800 shadow-sm border border-slate-100'
                      : 'bg-[#1E2A4A] rounded-[24px] rounded-tr-[8px] text-white shadow-md'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 px-2 font-semibold">
                    {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex justify-start w-full"
              >
                <div className="px-5 py-4 bg-white border border-slate-100 rounded-[24px] rounded-tl-[8px] flex space-x-1.5 shadow-sm">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay }}
                      className="w-1.5 h-1.5 rounded-full bg-slate-300"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Reply chips */}
          <AnimatePresence>
            {!isTyping && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2 pt-2 pb-4"
              >
                {quickReplies.map((reply, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleSend(reply)}
                    className="bg-white border border-[#C7D2FE] text-[#312E81] rounded-[14px] px-4 py-2.5 text-[13px] font-bold hover:bg-[#EEF2FF] transition-all active:scale-95 shadow-sm"
                  >
                    {reply}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 px-4 pb-8 pt-3 bg-white border-t border-slate-100 shadow-[0_-8px_24px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 bg-slate-50 rounded-[20px] p-1.5 border border-slate-200 focus-within:border-[#C7D2FE] focus-within:ring-2 ring-[#C7D2FE]/30 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Share what's on your mind…"
            className="flex-1 bg-transparent px-4 py-3 text-[15px] font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => handleSend()}
              className="w-12 h-12 rounded-[16px] bg-[#1E2A4A] flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-all active:scale-95 shadow-md"
            >
              <Send size={18} className="-ml-0.5" />
            </motion.button>
          ) : (
            <button className="w-12 h-12 rounded-[16px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 hover:bg-slate-100 transition-colors active:scale-95">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Public export — wrapped in ErrorBoundary ───────────────── */
export function Chat() {
  return (
    <ChatErrorBoundary>
      <ChatInner />
    </ChatErrorBoundary>
  );
}
