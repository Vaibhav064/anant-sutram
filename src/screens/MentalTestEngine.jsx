import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, ShieldCheck, Phone, AlertCircle, MessageCircle, Star } from 'lucide-react';
import { ASSESSMENTS } from '../lib/assessmentData';
import { apiFetch } from '../lib/api';
import { SmoothAreaChart, ScoreGauge, SeverityBar, SmoothAreaChartLight } from '../components/ui/SmoothAreaChart';
import { Card } from '../components/ui/Card';
import { HEALERS_DATA } from './Healers'; // Import healer data
import { OnlineDot } from '../components/ui/Badge';

const STAGE_INTRO = 'intro';
const STAGE_QUESTIONS = 'questions';
const STAGE_LOADING = 'loading';
const STAGE_RESULTS = 'results';

export function MentalTestEngine() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const test = ASSESSMENTS[testId];

  const [stage, setStage] = useState(STAGE_INTRO);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [history, setHistory] = useState([]);
  const [showMicrocopy, setShowMicrocopy] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [daysUntilUnlock, setDaysUntilUnlock] = useState(0);
  const [showCrisisNet, setShowCrisisNet] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!test) {
      navigate('/home');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/api/assessments/${testId}`);
        if (res.ok) {
          const data = await res.json();
          const mappedHistory = data.history.map(item => ({
            score: item.score,
            date: item.createdAt,
            label: item.severity,
            color: test.getSeverity(item.score).color,
            isNew: false
          })).reverse(); 

          setHistory(mappedHistory);

          if (data.history.length > 0) {
            const mostRecent = data.history[0]; 
            const now = new Date();
            const diffTime = Math.abs(now - new Date(mostRecent.createdAt));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 14) {
              setIsLocked(true);
              setDaysUntilUnlock(14 - diffDays);
              setStage(STAGE_RESULTS); 
            }
          }
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    fetchHistory();
  }, [testId, test, navigate]);

  useEffect(() => {
    if (stage === STAGE_QUESTIONS) {
      setShowMicrocopy(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowMicrocopy(true);
      }, 10000);
    }
    return () => clearTimeout(timerRef.current);
  }, [currentQIndex, stage]);

  if (!test) return null;

  const handleStart = () => {
    setStage(STAGE_QUESTIONS);
  };

  const handleAnswerSelect = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = score;
    setAnswers(newAnswers);

    if (currentQIndex < test.questions.length - 1) {
      setTimeout(() => setCurrentQIndex(prev => prev + 1), 300); 
    } else {
      finishTest(newAnswers);
    }
  };

  const handleGoBack = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else {
      setStage(STAGE_INTRO);
    }
  };

  const finishTest = async (finalAnswers) => {
    setStage(STAGE_LOADING);
    setSaveError(null);
    
    const totalScore = finalAnswers.reduce((a, b) => a + b, 0);
    const severityObj = test.getSeverity(totalScore);

    if (severityObj.level === 'severe') {
      setShowCrisisNet(true);
    }

    try {
      const res = await apiFetch(`/api/assessments`, {
        method: 'POST',
        body: JSON.stringify({
          testId: test.id,
          score: totalScore,
          severity: severityObj.label,
          answers: finalAnswers
        })
      });

      if (res.ok) {
        const newEntry = {
          score: totalScore,
          date: new Date().toISOString(),
          label: severityObj.label,
          color: severityObj.color,
          isNew: true
        };
        setHistory(prev => [...prev, newEntry]);
        setIsLocked(true);
        setDaysUntilUnlock(14);
        
        // Success! Final transition
        setTimeout(() => {
          setStage(STAGE_RESULTS);
        }, 1500);
      } else {
        const errData = await res.json();
        setSaveError(errData.error || 'Failed to save results. Please check your connection.');
        setStage(STAGE_INTRO); // Fallback to intro so they can retry or see error
      }
    } catch(e) {
      console.error(e);
      setSaveError('Network error. Could not save your results.');
      setStage(STAGE_INTRO);
    }
  };

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-[100dvh] relative bg-[#0F172A]"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <img src={test.image} className="w-full h-full object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/30" />
      </div>

      <button 
        onClick={() => navigate('/assessments')} 
        className="absolute top-12 left-6 z-20 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-sm"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="px-8 flex-1 flex flex-col pt-[30vh] pb-nav relative z-10 justify-end">
        <div className="mb-10 mt-auto">
           <p className="text-[11px] text-[#34D399] font-black uppercase tracking-[0.3em] mb-3">{test.shortName} Validated Protocol</p>
           <h2 className="text-[40px] font-bold text-white mb-4 leading-[1.05] tracking-tight">{test.title}<br/>Check-in</h2>
        </div>

        {saveError && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center gap-3">
             <AlertCircle className="text-red-400" size={20} />
             <p className="text-red-300 text-[13px] font-bold">{saveError}</p>
          </div>
        )}

        <p className="text-[16px] text-white/70 leading-relaxed font-medium mb-12">
          {test.introMessage}
        </p>

        <div>
          <button 
            onClick={handleStart}
            className="w-full bg-white text-[#0F172A] h-16 rounded-[24px] font-bold text-[17px] shadow-lg flex items-center justify-center gap-2 group active:scale-95 transition-transform"
          >
            Start Assessment
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-center text-[11px] text-white/40 mt-5 font-medium italic">
            Your results are private and not visible to anyone else.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderQuestions = () => {
    const q = test.questions[currentQIndex];
    const prevAnswer = answers[currentQIndex];

    return (
      <div className="flex flex-col h-full px-6 py-6" style={{ background: 'var(--bg-app)' }}>
        <div className="flex items-center justify-between mt-10 mb-12">
          <button onClick={handleGoBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50"><ChevronLeft size={20} /></button>
          <div className="flex flex-col items-center">
             <span className="text-main font-bold text-[14px] tracking-tight">Question {currentQIndex + 1}</span>
             <span className="text-muted text-[10px] uppercase tracking-widest font-bold">Of {test.questions.length}</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="mb-10 min-h-[100px] flex items-center">
          <h2 className="text-[24px] font-bold text-main leading-tight">
            {q.text}
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {q.options.map((opt, i) => (
              <motion.button
                key={`${currentQIndex}-${i}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAnswerSelect(opt.score)}
                className={`w-full p-6 rounded-2xl text-left font-bold transition-all duration-200 border outline-none flex justify-between items-center
                  ${prevAnswer === opt.score 
                    ? 'bg-primary border-primary text-white shadow-glow-sm' 
                    : 'bg-surface border-soft text-sub hover:bg-surface2'
                  }`}
              >
                <span className="text-[15px]">{opt.text}</span>
                {prevAnswer === opt.score && <div className="w-2 h-2 rounded-full bg-primary-light" />}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8">
           <AnimatePresence>
             {showMicrocopy && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-center mb-6 text-[13px] text-muted font-medium italic"
               >
                 Take your time. Choose what feels most true for you.
               </motion.div>
             )}
           </AnimatePresence>

           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-primary"
               initial={{ width: `${(currentQIndex / test.questions.length) * 100}%` }}
               animate={{ width: `${((currentQIndex + 1) / test.questions.length) * 100}%` }}
             />
           </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full px-10 text-center" style={{ background: 'var(--bg-app)' }}
    >
      <div className="relative w-24 h-24 flex items-center justify-center mb-10">
         <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
         <motion.div 
           className="absolute inset-0 rounded-full border-t-2 border-primary"
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
         />
         <ShieldCheck size={32} className="text-primary animate-pulse" />
      </div>
      <h3 className="font-bold text-[20px] tracking-tight" style={{ color: 'var(--text-main)' }}>Locking in your insights...</h3>
      <p className="text-[13px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>This typically takes a few seconds.</p>
    </motion.div>
  );

  const renderResults = () => {
    const listHistory = [...history].reverse();
    const latestScore = listHistory.length > 0 ? listHistory[0] : null;
    const prevScore = listHistory.length > 1 ? listHistory[1] : null;
    const severity = latestScore ? test.getSeverity(latestScore.score) : null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-screen"
        style={{ background: 'var(--bg-app)' }}
      >
        {/* ── Light-themed Header ── */}
        <div className="sticky top-0 z-30 pt-12 pb-4 px-6 flex items-center gap-4" style={{ background: 'var(--bg-app)' }}>
          <button onClick={() => navigate('/assessments')} className="w-9 h-9 rounded-xl bg-surface border border-soft flex items-center justify-center text-sub hover:bg-surface2 transition-colors active:scale-90 shadow-sm">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-[18px] font-bold text-main tracking-tight">Test for {test.title.toLowerCase()} levels</h1>
        </div>

        <div className="px-6 pb-10">

          {/* ── Graph Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-[16px] font-bold text-main mb-4">Graph Analysis</h2>
            <div className="bg-surface rounded-[24px] p-5 shadow-sm border border-soft">
              <SmoothAreaChartLight data={history} maxScore={test.maxScore} />
            </div>
          </motion.div>

          {/* ── Test History ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold text-main">Test History</h2>
              <button className="text-[13px] font-semibold text-primary">View All</button>
            </div>

            <div className="space-y-1">
              {listHistory.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  key={i}
                  className="flex items-center gap-5 py-4 border-b border-soft last:border-0"
                >
                  <span className="text-[32px] font-black tracking-tighter min-w-[50px]" style={{ color: item.color || '#7C6AF5' }}>
                    {item.score}
                  </span>
                  <div>
                    <p className="text-[14px] font-black text-main">{item.label}</p>
                    <p className="text-[12px] text-muted font-bold uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Description ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="text-[16px] font-bold text-main mb-3">Understanding Your Score</h2>
            <p className="text-[14px] leading-[1.7] text-sub font-medium">
              {test.description}
            </p>
          </motion.div>

          {/* ── Crisis Safety Net ── */}
          <AnimatePresence>
            {showCrisisNet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-violet-50 border border-violet-200 rounded-[20px] p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Phone size={16} className="text-violet-500" />
                    <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">Support Available</span>
                  </div>
                  <p className="text-main text-[14px] font-medium mb-4">
                    Healing begins with shared strength. Reach out when you're ready.
                  </p>
                  <a href="tel:9152987821" className="flex items-center justify-center gap-3 bg-violet-500 hover:bg-violet-600 text-white font-bold px-5 py-3.5 rounded-2xl transition-all active:scale-95">
                    <Phone size={16} />
                    <span>Call Helpline: 9152987821</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Take the Test / Retake Button (MindHealthy purple) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button 
              disabled={isLocked}
              onClick={() => setStage(STAGE_INTRO)}
              className={`w-full py-4.5 rounded-2xl font-bold text-[15px] transition-all shadow-lg
                ${isLocked 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-[0_8px_24px_rgba(124,106,245,0.35)]'}`
              }
              style={{ paddingTop: '18px', paddingBottom: '18px' }}
            >
              {isLocked ? '🔒 Assessment Locked' : 'Take the test'}
            </button>
            
            {isLocked && (
              <p className="text-center text-[11px] font-medium text-gray-400 mt-3">
                Unlock again in {daysUntilUnlock} days to maintain accuracy
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };



  return (
    <div className="h-[100dvh] overflow-y-auto overflow-x-hidden no-scrollbar" style={{ background: 'var(--bg-app)' }}>
      <AnimatePresence mode="wait">
        {stage === STAGE_INTRO && <motion.div key="intro" className="min-h-full">{renderIntro()}</motion.div>}
        {stage === STAGE_QUESTIONS && <motion.div key="questions" className="h-full">{renderQuestions()}</motion.div>}
        {stage === STAGE_LOADING && <motion.div key="loading" className="h-full">{renderLoading()}</motion.div>}
        {stage === STAGE_RESULTS && <motion.div key="results" className="min-h-full">{renderResults()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
