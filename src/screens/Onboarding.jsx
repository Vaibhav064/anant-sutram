import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiFetch } from '../lib/api';

const questions = [
  {
    id: 1,
    title: "What brings you here tonight?",
    options: ["I feel anxious all the time 😰", "I just went through a breakup 💔", "Work stress is overwhelming me 😤", "I feel lost and don't know why 🌀", "✎ Write your own..."]
  },
  {
    id: 2,
    title: "How long have you been feeling this way?",
    options: ["Just started this week", "A few weeks now", "Several months", "Over a year", "I'm not sure"]
  },
  {
    id: 3,
    title: "Have you ever talked to anyone about this?",
    options: ["Never — this is the first time", "Only close friends", "I've tried therapy before", "I talk to family sometimes", "I journal but that's it"]
  },
  {
    id: 4,
    title: "What kind of support feels right for you?",
    options: ["Someone to just listen without judging", "Practical tools and exercises", "Deep spiritual or philosophical guidance", "A mix of all of these", "I honestly don't know yet"]
  },
  {
    id: 5,
    title: "What's your name in this space?",
    isInput: true,
    label: "Choose a name — it can be anything. Real or not.",
    placeholder: "E.g. Arjun, Starfire, Anonymous...",
    subtext: "This is only visible to you and your AI guide."
  }
];

export function Onboarding() {
  const navigate = useNavigate();
  const setNickname = useStore(state => state.setNickname);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [customText, setCustomText] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const currentQ = questions[step - 1];
  const progressPercent = (step / 5) * 100;

  const handleSelect = (idx, text) => {
    setAnswers({ ...answers, [step]: text });
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(prev => prev + 1);
      setCustomText("");
    } else {
      const finalNickname = answers[5] || 'Anonymous';
      setNickname(finalNickname);
      useStore.setState({ onboardingAnswers: answers });
      setIsNavigating(true);
      
      const user = useStore.getState().user;
      const token = localStorage.getItem('token');
      if (token) {
        await apiFetch('/api/user/profile', {
          method: 'PUT',
          body: JSON.stringify({ nickname: finalNickname, onboardingAnswers: answers })
        }).catch(err => console.warn("Failed to save profile:", err));
      }

      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  };

  const handleSkip = () => {
    navigate('/home');
  };

  if (isNavigating) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6"
        >
          <div className="w-8 h-8 rounded-full bg-primary/40" />
        </motion.div>
        <p className="font-semibold text-xl text-white/80 tracking-tight">Getting to know you...</p>
      </div>
    );
  }

  const isNextDisabled = !answers[step] || (currentQ.isInput && answers[step].trim().length === 0);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="pt-safe sticky top-0 ios-glass z-10 pb-4">
        <div className="w-full h-[2px] bg-white/10">
          <motion.div 
            className="h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center px-6 mt-4">
          <div className="w-8">
            {step > 1 && (
              <button onClick={() => setStep(prev => prev - 1)} className="text-white/60 p-2 -ml-2 bg-transparent border-none">
                <ArrowLeft size={20} />
              </button>
            )}
          </div>
          <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Step {step} of 5</p>
          <div className="w-8 flex justify-end">
            <button onClick={handleSkip} className="text-[12px] text-white/40 bg-transparent border-none">Skip</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 mt-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-[32px] font-bold leading-tight mb-2 text-white tracking-tight">
              {currentQ.title}
            </h1>
            {!currentQ.isInput && (
              <p className="text-[15px] text-white/50 mb-8 font-medium tracking-tight">
                No right answer — just how you feel right now
              </p>
            )}

            <div className="space-y-4 mb-10 w-full mt-4">
              {currentQ.isInput ? (
                <div className="flex flex-col space-y-4">
                  <label className="text-sm text-white/70">{currentQ.label}</label>
                  <Input 
                    value={answers[step] || ''} 
                    onChange={e => handleSelect(null, e.target.value)}
                    placeholder={currentQ.placeholder}
                  />
                  <p className="text-xs text-white/40 mt-2">{currentQ.subtext}</p>
                </div>
              ) : (
                currentQ.options.map((opt, idx) => {
                  const isCustom = opt.includes("Write your own");
                  const isSelected = answers[step] === opt || (isCustom && answers[step] && !currentQ.options.slice(0,-1).includes(answers[step]));
                  
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (isCustom) {
                            handleSelect(idx, customText || "custom");
                          } else {
                            handleSelect(idx, opt);
                          }
                        }}
                        className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between
                          ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface2 border-white/5 hover:border-white/20'}
                        `}
                      >
                        <span className="text-[15px] font-medium tracking-tight">{opt}</span>
                        {isSelected && <div className="text-primary ml-3 text-lg">✓</div>}
                      </button>

                      {isCustom && isSelected && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 overflow-hidden"
                        >
                          <Input 
                            value={answers[step] === "custom" ? '' : answers[step]}
                            onChange={e => {
                              setCustomText(e.target.value);
                              handleSelect(idx, e.target.value);
                            }}
                            placeholder="I feel..."
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pb-10">
          <Button 
            className={`w-full ${isNextDisabled ? 'opacity-30' : 'opacity-100'}`} 
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            Continue &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
