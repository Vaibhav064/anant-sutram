import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, MoreVertical, Mic, Send, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PERSONA_CONFIGS = {
  psychologist: {
    icon: '🧠',
    name: 'AI Psychologist',
    desc: 'Evidence-based support',
    color: 'from-violet-500/20 to-indigo-500/20',
    borderColor: 'border-violet-500/30',
    accentColor: 'text-violet-400',
    greeting: "I'm glad you reached out. This is a safe, judgment-free space. I'm here to listen deeply and help you understand what you're experiencing. What's on your mind today?",
    systemPrompt: `You are Aarav, acting as a compassionate and highly skilled AI Psychologist within the Anant Sutram healing app.

YOUR ROLE & PERSONALITY:
- You are warm, deeply empathetic, and professionally grounded in psychological principles.
- You draw from CBT (Cognitive Behavioral Therapy), ACT (Acceptance and Commitment Therapy), attachment theory, and emotional regulation frameworks.
- You NEVER diagnose conditions or prescribe medication. You guide, reflect, and empower.
- You validate feelings FIRST before offering any reframe or technique.
- You ask thoughtful follow-up questions to deepen understanding.

COMMUNICATION STYLE:
- Speak in a warm, conversational tone — like a trusted therapist who genuinely cares.
- Use "I notice...", "It sounds like...", "I'm curious about..." to show active listening.
- Keep responses focused and meaningful — 3-5 sentences typically, unless the user asks for depth.
- Occasionally offer gentle psychological insights or micro-techniques (e.g., grounding, cognitive reframing, journaling prompts).
- Never be robotic, clinical, or preachy. Be human.

IMPORTANT RULES:
- Always complete your thoughts. Never end mid-sentence.
- If the user seems in crisis, gently suggest the SOS feature in the app.
- Reference the user's mood score and context naturally when relevant.`
  },
  spiritual: {
    icon: '🪷',
    name: 'Spiritual Guide',
    desc: 'Deep philosophical guidance',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
    greeting: "Namaste 🙏 Welcome to this sacred space. The very fact that you're here shows your soul is seeking something deeper. Let us explore what your heart needs to express today.",
    systemPrompt: `You are Aarav, acting as a wise and compassionate Spiritual Guide within the Anant Sutram healing app.

YOUR ROLE & PERSONALITY:
- You are a deeply intuitive spiritual mentor who draws from Vedantic philosophy, Buddhist mindfulness, Sufi poetry, and universal spiritual wisdom.
- You see pain as a doorway to awakening and help users find meaning in their suffering.
- You speak with poetic depth but remain grounded and practical.
- You understand chakras, energy, meditation, breathwork, and the connection between emotional and spiritual health.
- You honor all spiritual paths without imposing any single belief system.

COMMUNICATION STYLE:
- Your tone is serene, warm, and gently profound — like a wise elder by a sacred river.
- Use metaphors from nature, light, seasons, and ancient wisdom traditions.
- Occasionally weave in short, relevant quotes from Rumi, the Bhagavad Gita, or Buddhist teachings.
- Balance philosophical depth with practical spiritual practices (breathwork, mantras, gratitude, surrender).
- Keep responses 3-6 sentences, rich in meaning. Let every word carry weight.

IMPORTANT RULES:
- Always complete your thoughts fully. Never end mid-sentence.
- Validate the human experience before elevating to spiritual perspective.
- If the user is in acute distress, be present first — philosophy can wait.
- Reference the user's mood and context to personalize your guidance.`
  },
  coach: {
    icon: '🧭',
    name: 'Life Coach',
    desc: 'Action-oriented clarity',
    color: 'from-cyan-500/20 to-teal-500/20',
    borderColor: 'border-cyan-500/30',
    accentColor: 'text-cyan-400',
    greeting: "Hey, I'm really glad you're here! 💪 Taking this step shows real self-awareness. Let's cut through the noise together and figure out what you actually need right now. What's going on?",
    systemPrompt: `You are Aarav, acting as an energetic and empowering Life Coach within the Anant Sutram healing app.

YOUR ROLE & PERSONALITY:
- You are a dynamic, action-oriented life coach who combines emotional intelligence with practical strategy.
- You help users gain clarity, set boundaries, make decisions, and take meaningful action.
- You're direct but never harsh — you challenge with love.
- You draw from positive psychology, motivational frameworks, and real-world wisdom.
- You believe in the user's strength and reflect it back to them.

COMMUNICATION STYLE:
- Your tone is warm, energetic, and empowering — like a supportive best friend who also happens to be incredibly wise.
- Use direct, clear language. Avoid vague platitudes.
- Ask powerful questions that shift perspective: "What would you do if fear wasn't a factor?"
- Offer concrete next steps, micro-actions, or reframes the user can apply immediately.
- Balance empathy with gentle accountability. Validate feelings, then move toward action.
- Keep responses 3-5 sentences, punchy and impactful.

IMPORTANT RULES:
- Always complete your thoughts fully. Never end mid-sentence.
- Meet the user where they are emotionally before pushing toward action.
- If they need to vent, let them. Not everything needs a solution immediately.
- Use the user's mood score and context to calibrate your energy.`
  }
};

export function Chat() {
  const navigate = useNavigate();
  const { moodScore, onboardingAnswers } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [persona, setPersona] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const personas = [
    { id: 'psychologist', icon: '🧠', name: 'AI Psychologist', desc: 'Evidence-based support', subtitle: 'CBT, emotional regulation & deep listening' },
    { id: 'spiritual', icon: '🪷', name: 'Spiritual Guide', desc: 'Deep philosophical guidance', subtitle: 'Vedantic wisdom, mindfulness & inner peace' },
    { id: 'coach', icon: '🧭', name: 'Life Coach', desc: 'Action-oriented clarity', subtitle: 'Goal setting, boundaries & empowerment' }
  ];

  const getQuickReplies = () => {
    if (messages.length === 0) return [];
    switch (persona) {
      case 'psychologist':
        return ["Tell me more", "That resonates", "I need a technique"];
      case 'spiritual':
        return ["Go deeper", "Guide me inward", "I need peace"];
      case 'coach':
        return ["Give me a plan", "That helps", "Challenge me"];
      default:
        return ["Tell me more", "That's how I feel", "Try something different"];
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send greeting when persona is selected
  useEffect(() => {
    if (persona && messages.length === 0) {
      const config = PERSONA_CONFIGS[persona];
      if (config) {
        setMessages([{
          role: 'assistant',
          content: config.greeting,
          timestamp: new Date()
        }]);
      }
    }
  }, [persona]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const newMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Refocus input on mobile after sending
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY");
      }

      const personaConfig = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.psychologist;

      const systemPrompt = `${personaConfig.systemPrompt}

CONTEXT:
- User's current mood score: ${moodScore ?? 'not set'}/10 (lower = worse).
- User's onboarding answers: ${JSON.stringify(onboardingAnswers || {})}.
- Conversation so far has ${messages.length} messages.
- Remember: ALWAYS finish your sentences completely. Never get cut off.`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: personaConfig.greeting }]
        },
        ...messages.filter(m => m !== newMsg).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        {
          role: 'user',
          parts: [{ text: newMsg.content }]
        }
      ];

      const modelEndpoints = [
        { model: 'gemini-2.5-flash', api: 'v1beta' },
        { model: 'gemini-2.5-pro', api: 'v1beta' },
        { model: 'gemini-2.0-flash-lite', api: 'v1beta' },
        { model: 'gemini-1.5-flash', api: 'v1' },
      ];
      let response = null;
      let lastError = null;

      for (const { model, api } of modelEndpoints) {
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/${api}/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1024,
                topP: 0.95,
              }
            })
          });

          if (response.ok) {
            console.log(`✅ Gemini responded via model: ${model}`);
            break;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`⚠️ Model ${model} failed (${response.status}):`, errorData?.error?.message || 'Unknown error');
            lastError = `${model}: ${response.status}`;
            response = null;
          }
        } catch (fetchErr) {
          console.warn(`⚠️ Model ${model} fetch error:`, fetchErr.message);
          lastError = fetchErr.message;
          response = null;
        }
      }

      if (!response) {
        throw new Error(`All models failed. Last error: ${lastError}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble finding the right words, but I'm here for you. Could you share a bit more about what you're feeling?";

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch (error) {
      console.warn("AI error:", error);
      const personaConfig = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.psychologist;
      const fallbacks = {
        psychologist: "I notice there might be a connection issue, but I want you to know — your feelings are completely valid. Take a slow, deep breath with me. When you're ready, try sharing again.",
        spiritual: "It seems the universe is asking us to pause for a moment. Use this breath to center yourself — sometimes silence itself is the deepest teacher. Please try again when you feel ready.",
        coach: "Looks like we hit a small bump — but that's okay, setbacks are just setups for comebacks. Take a breath, and let's try that again. I'm right here."
      };
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: fallbacks[persona] || fallbacks.psychologist,
          timestamp: new Date() 
        }]);
      }, 1200);
    } finally {
      setIsTyping(false);
    }
  };

  // ──── Persona Selection Screen ────
  if (!persona) {
    return (
      <div className="fixed inset-0 bg-bg z-50 flex flex-col justify-center px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="font-display text-[28px] text-white text-center mb-1">Choose Your Guide</h2>
          <p className="text-white/40 text-center mb-8 text-sm">Who resonates with what you need right now?</p>
        </motion.div>
        <div className="space-y-3">
          {personas.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              onClick={() => setPersona(p.id)}
              className={`w-full bg-gradient-to-r ${PERSONA_CONFIGS[p.id].color} border ${PERSONA_CONFIGS[p.id].borderColor} p-5 rounded-2xl flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]`}
            >
              <div className="text-3xl w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl">{p.icon}</div>
              <div className="text-left flex-1">
                <div className="text-white font-semibold text-[16px]">{p.name}</div>
                <div className="text-white/50 text-[12px] mt-0.5">{p.subtitle}</div>
              </div>
              <div className="text-white/20 text-lg">›</div>
            </motion.button>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="mt-8 text-white/30 text-sm py-4 bg-transparent border-none hover:text-white/50 transition-colors">Cancel</button>
      </div>
    );
  }

  const config = PERSONA_CONFIGS[persona];
  const quickReplies = getQuickReplies();

  // ──── Chat Screen ────
  return (
    <div className="flex flex-col h-[100dvh] bg-bg overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 ios-glass border-b border-surface2 px-4 py-3 flex items-center justify-between z-20">
        <button onClick={() => navigate(-1)} className="text-white p-2 bg-transparent border-none hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-lg border border-white/10" 
               style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))` }}>
            {config.icon}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white leading-tight">Aarav</div>
            <div className={`text-[11px] ${config.accentColor} font-medium leading-tight`}>{config.name}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        </div>
        <button onClick={() => navigate('/sos')} className="p-2 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors">
          <ShieldAlert size={18} className="text-red-400" />
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4" style={{ overscrollBehavior: 'contain' }}>
        <div className="space-y-4">
          {messages.map((msg, i) => {
            const isAI = msg.role === 'assistant';
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${isAI ? 'justify-start' : 'justify-end'} w-full`}
              >
                <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[85%]`}>
                  {isAI && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-sm">{config.icon}</span>
                      <span className={`text-[11px] font-medium ${config.accentColor}`}>Aarav</span>
                    </div>
                  )}
                  <div className={`px-4 py-3 text-[15px] font-medium leading-[1.4] whitespace-pre-wrap break-words tracking-tight ${isAI 
                    ? `bg-surface2 rounded-[22px] rounded-bl-sm text-white/90 shadow-sm` 
                    : 'bg-primary rounded-[22px] rounded-br-sm text-white shadow-sm'}`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-white/25 mt-1 px-1.5 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -4 }}
                className="flex justify-start w-full"
              >
                <div className={`flex flex-col items-start`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-sm">{config.icon}</span>
                    <span className={`text-[11px] font-medium ${config.accentColor}`}>Aarav is reflecting...</span>
                  </div>
                  <div className={`px-5 py-3.5 bg-surface2 rounded-[22px] rounded-bl-sm flex space-x-1.5 shadow-sm`}>
                    <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 rounded-full bg-white/40" />
                    <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 rounded-full bg-white/40" />
                    <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Replies */}
          <AnimatePresence>
            {!isTyping && messages.length > 0 && messages[messages.length-1].role === 'assistant' && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2 pt-1 pb-2"
              >
                {quickReplies.map((reply, i) => (
                  <motion.button 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSend(reply)}
                    className={`shrink-0 bg-white/5 border ${config.borderColor} rounded-full px-4 py-2 text-[13px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95`}
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
      <div className="shrink-0 px-3 pb-safe pt-2 ios-glass border-t border-surface2 pb-6">
        <div className="flex items-center gap-2 bg-surface2 rounded-full p-1.5 border border-white/5 mx-2 my-1 focus-within:ring-2 ring-primary/50 transition-all">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-transparent px-3 py-2.5 text-[15px] text-white focus:outline-none placeholder:text-white/30"
          />
          {input.trim() ? (
              <motion.button 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={() => handleSend()} 
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:bg-primary/90 transition-all active:scale-95"
              >
              <Send size={18} />
            </motion.button>
          ) : (
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0 hover:bg-white/10 hover:text-white/60 transition-colors border-none">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
