import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, ShieldCheck, Phone, AlertCircle, MessageCircle, Star } from 'lucide-react';
import { ASSESSMENTS } from '../lib/assessmentData';
import { apiFetch } from '../lib/api';
import { SmoothAreaChartLight } from '../components/ui/SmoothAreaChart';
import { Card } from '../components/ui/Card';
import { HEALERS_DATA } from './Healers';
import { OnlineDot } from '../components/ui/Badge';
import { useStore } from '../store/useStore';

const STAGE_INTRO = 'intro';
const STAGE_QUESTIONS = 'questions';
const STAGE_LOADING = 'loading';
const STAGE_RESULTS = 'results';

// ── Speedometer Gauge Component ───────────────────────────────────────────────
function SpeedometerGauge({ score, maxScore, severity }) {
  // For ALL our tests: lower score = better mental health.
  // pct=0 → worst (needle left), pct=1 → best (needle right)
  const pct = 1 - Math.min(Math.max(score / maxScore, 0), 1);

  // Needle angle in our custom space: -90°=left(worst), 0°=up(fair), +90°=right(best)
  const needleAngleDeg = pct * 180 - 90;

  // SVG layout constants
  const cx = 100, cy = 100, R = 62, sw = 18;
  const gapDeg = 4;
  const segCount = 5;
  const segDeg = (180 - (segCount - 1) * gapDeg) / segCount; // ≈ 32.8°
  const labelR = R + sw / 2 + 14;
  const needleLen = R - 6;

  // Convert "math angle" (0=right, 90=up, 180=left) to SVG coords
  const toRad = (d) => d * Math.PI / 180;
  const svgPt = (mathA, radius = R) => ({
    x: cx + radius * Math.cos(toRad(mathA)),
    y: cy - radius * Math.sin(toRad(mathA)), // SVG y is inverted
  });

  // 5 segments from left (180°) to right (0°) going through the top
  const segConfigs = [
    { color: '#EF4444', lines: ['VERY', 'POOR'] },
    { color: '#F97316', lines: ['POOR']         },
    { color: '#FBBF24', lines: ['FAIR']         },
    { color: '#84CC16', lines: ['GOOD']         },
    { color: '#10B981', lines: ['EXCELLENT']    },
  ];

  const segments = segConfigs.map((cfg, i) => {
    const startA = 180 - i * (segDeg + gapDeg);
    const endA   = startA - segDeg;
    const midA   = (startA + endA) / 2;
    const s = svgPt(startA);
    const e = svgPt(endA);
    const lp = svgPt(midA, labelR);
    return {
      ...cfg,
      // sweep=1 traces the upper arc (clockwise in SVG = counterclockwise in math)
      d: `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,
      lx: lp.x, ly: lp.y,
      textRot: 90 - midA, // rotate label to be tangent to arc
    };
  });

  // Needle tip position (no SVG transform needed — just animate x2,y2 directly)
  const nx = cx + needleLen * Math.sin(toRad(needleAngleDeg));
  const ny = cy - needleLen * Math.cos(toRad(needleAngleDeg));

  return (
    <div className="w-full flex flex-col items-center py-2">
      <svg
        viewBox="5 5 190 115"
        width="100%"
        style={{ maxWidth: 340, overflow: 'visible' }}
      >
        {/* Gray background track */}
        <path
          d={`M ${svgPt(180).x} ${svgPt(180).y} A ${R} ${R} 0 0 1 ${svgPt(0).x} ${svgPt(0).y}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={sw + 3}
          strokeLinecap="butt"
        />

        {/* Colored segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw}
            strokeLinecap="butt"
          />
        ))}

        {/* Labels (radially positioned + rotated) */}
        {segments.map((seg, i) => (
          <text
            key={'lbl' + i}
            fontSize="5.5"
            fontWeight="800"
            fill="#9CA3AF"
            textAnchor="middle"
            transform={`rotate(${seg.textRot.toFixed(1)}, ${seg.lx.toFixed(1)}, ${seg.ly.toFixed(1)})`}
          >
            {seg.lines.map((line, li) => (
              <tspan
                key={li}
                x={seg.lx.toFixed(1)}
                y={(seg.ly + (li - (seg.lines.length - 1) / 2) * 7).toFixed(1)}
              >
                {line}
              </tspan>
            ))}
          </text>
        ))}

        {/* Needle — starts pointing straight up, animates to target position */}
        <motion.line
          x1={cx} y1={cy}
          x2={cx} y2={cy - needleLen}
          animate={{ x2: nx, y2: ny }}
          transition={{ type: 'spring', stiffness: 55, damping: 14, delay: 0.2 }}
          stroke="#111827"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={10} fill="#111827" />
        <circle cx={cx} cy={cy} r={4}  fill="white"   />
      </svg>

      {/* Score + label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center mt-1"
      >
        <span
          className="text-[56px] font-black leading-none tracking-tighter"
          style={{ color: severity.color }}
        >
          {score}
          <span className="text-[20px] text-gray-300 font-bold ml-1">/ {maxScore}</span>
        </span>
        <span
          className="px-7 py-2.5 rounded-full text-[12px] font-black tracking-[0.15em] uppercase mt-3 border border-black/5"
          style={{ backgroundColor: severity.color + '18', color: severity.color }}
        >
          {severity.label}
        </span>
      </motion.div>
    </div>
  );
}

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
          const mappedHistory = data.history.map(item => {
            const sev = test.getSeverity(item.score);
            return {
              score: item.score,
              date: item.createdAt,
              label: sev.label,   // always re-derive from current scoring logic
              color: sev.color,
              isNew: false,
            };
          }).reverse();

          setHistory(mappedHistory);

          if (data.history.length > 0) {
            const mostRecent = data.history[0]; 
            const now = new Date();
            const diffTime = Math.abs(now - new Date(mostRecent.createdAt));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
              setIsLocked(true);
              setDaysUntilUnlock(7 - diffDays);
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
        setDaysUntilUnlock(7);
        
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
      <div className="flex flex-col min-h-full overflow-y-auto px-6 py-6" style={{ background: 'var(--bg-app)' }}>
        <div className="flex items-center justify-between mt-10 mb-12">
          <button onClick={handleGoBack} className="w-10 h-10 rounded-full bg-surface border border-soft flex items-center justify-center text-sub active:scale-90"><ChevronLeft size={20} /></button>
          <div className="flex flex-col items-center">
             <span className="text-main font-bold text-[14px] tracking-tight">Question {currentQIndex + 1}</span>
             <span className="text-muted text-[10px] uppercase tracking-widest font-bold">Of {test.questions.length}</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="mb-8 min-h-[100px] flex items-center">
          <h2 className="text-[26px] font-bold text-main leading-tight tracking-tight">
            {q.text}
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-3 pb-10">
          <AnimatePresence mode="popLayout">
            {q.options.map((opt, i) => (
              <motion.button
                key={`${currentQIndex}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAnswerSelect(opt.score)}
                className={`w-full p-6 rounded-2xl text-left font-bold transition-all duration-200 border outline-none flex justify-between items-center
                  ${prevAnswer === opt.score 
                    ? 'bg-primary border-primary text-white shadow-lg scale-[1.02]' 
                    : 'bg-surface border-soft text-sub hover:bg-surface2 hover:border-gray-300'
                  }`}
              >
                <span className="text-[15px]">{opt.text}</span>
                {prevAnswer === opt.score && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 mb-4">
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

           <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
      <h3 className="font-bold text-[20px] tracking-tight text-main">Locking in your insights...</h3>
      <p className="text-[13px] mt-2 font-medium text-muted">This typically takes a few seconds.</p>
    </motion.div>
  );

  const renderResults = () => {
    const listHistory = [...history].reverse();
    const latestScore = listHistory.length > 0 ? listHistory[0] : null;
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

        <div className="px-6 pb-24">

          {/* ── Speedometer Score Gauge ── */}
          {latestScore && severity && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <h2 className="text-[17px] font-bold text-main mb-6 px-1">Current Assessment</h2>
              <div className="bg-surface rounded-[32px] p-8 shadow-sm border border-subtle flex flex-col items-center">
                <SpeedometerGauge
                  score={latestScore.score}
                  maxScore={test.maxScore}
                  severity={severity}
                />
              </div>
            </motion.div>
          )}

          {/* ── Graph Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-[17px] font-bold text-main mb-4 px-1">Progress History</h2>
            <div className="bg-surface rounded-[32px] p-6 shadow-sm border border-subtle">
              <SmoothAreaChartLight data={history} maxScore={test.maxScore} />
            </div>
          </motion.div>

          {/* ── Crisis / Urgent Support — visible if score is severe ── */}
          {(severity.level === 'severe' || showCrisisNet) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-10"
            >
              <div 
                className="p-8 rounded-[32px] border border-red-100 flex flex-col gap-6"
                style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)' }}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <AlertCircle size={20} />
                   </div>
                   <h3 className="text-[18px] font-bold text-red-900">Crisis Support</h3>
                </div>
                
                <p className="text-[15px] font-medium text-red-700/80 leading-relaxed">
                  Your current results suggest you might be going through a very difficult time. Remember, you don't have to face this alone.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => navigate('/chat', { state: { autoPersona: 'psychologist', preMessage: `My assessment for ${test.title} shows I'm in a severe state. I need someone to talk to.` } })}
                    className="w-full flex items-center justify-center gap-2.5 bg-red-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-transform"
                  >
                    <MessageCircle size={18} />
                    Chat with AI Psychologist
                  </button>
                  
                  <a 
                    href="tel:9152987821" 
                    className="w-full flex items-center justify-center gap-2.5 bg-white border-2 border-red-100 text-red-600 font-bold h-14 rounded-2xl active:scale-95 transition-transform"
                  >
                    <Phone size={18} />
                    Call Helpline: 9152987821
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Description ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10 bg-surface/50 border border-soft p-8 rounded-[32px]"
          >
            <h2 className="text-[17px] font-bold text-main mb-3">Understanding Results</h2>
            <p className="text-[15px] leading-[1.7] text-sub font-medium">
              {test.description}
            </p>
          </motion.div>

          {/* ── Take the Test / Retake Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pb-12"
          >
            <div 
              className={`w-full py-7 rounded-[32px] font-black text-[17px] tracking-tight transition-all flex flex-col items-center justify-center gap-1
                ${isLocked 
                  ? 'bg-gray-50 text-gray-400 border border-gray-100' 
                  : 'bg-primary text-white hover:opacity-95 active:scale-[0.98] shadow-xl shadow-primary/20'}`
              }
              onClick={() => !isLocked && setStage(STAGE_INTRO)}
            >
              <div className="flex items-center gap-3">
                {isLocked && <ShieldCheck size={20} className="text-gray-300" />}
                <span>{isLocked ? 'Assessment Locked' : 'Retake Assessment'}</span>
              </div>
            </div>
            
            {isLocked && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <p className="text-center text-[15px] font-bold text-gray-400">
                  Retake unlocks in <span className="text-primary-light font-black underline decoration-2 underline-offset-4">{daysUntilUnlock} days</span>
                </p>
                <p className="text-[11px] text-gray-300 font-extrabold uppercase tracking-widest">To maintain clinical accuracy</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[100dvh] overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <AnimatePresence mode="wait">
        {stage === STAGE_INTRO && <motion.div key="intro" className="h-full overflow-y-auto">{renderIntro()}</motion.div>}
        {stage === STAGE_QUESTIONS && <motion.div key="questions" className="h-full overflow-y-auto">{renderQuestions()}</motion.div>}
        {stage === STAGE_LOADING && <motion.div key="loading" className="h-full overflow-y-auto">{renderLoading()}</motion.div>}
        {stage === STAGE_RESULTS && <motion.div key="results" className="h-full overflow-y-auto">{renderResults()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
