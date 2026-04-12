import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, ArrowRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { ASSESSMENT_LIST, ASSESSMENTS } from '../lib/assessmentData';
import { motion } from 'framer-motion';

export function AssessmentList() {
  const navigate = useNavigate();
  const [historySummary, setHistorySummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await apiFetch('/api/assessments/user/summary');
        if (res.ok) {
          const data = await res.json();
          const summaryMap = {};
          data.summary.forEach(item => {
            summaryMap[item._id] = {
              score: item.latestScore,
              date: new Date(item.date),
              severity: item.latestSeverity
            };
          });
          setHistorySummary(summaryMap);
        }
      } catch (err) {
        console.error('Failed to fetch assessment summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="min-h-[100dvh] pb-24 flex flex-col" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 pt-12 pb-4 px-6 flex items-center justify-between bg-bg/90 backdrop-blur-xl">
        <button 
          onClick={() => navigate('/home')} 
          className="w-10 h-10 rounded-xl bg-surface border border-soft flex items-center justify-center text-sub hover:bg-surface2 transition-colors active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-main tracking-tight">Assessments</h1>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Clinically Validated</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="px-5 pt-2">
        {/* Title & Subtitle */}
        <div className="mb-6 px-1 text-center">
          <h2 className="text-[28px] font-bold text-main tracking-tight leading-tight mb-2">Check your mind</h2>
          <p className="text-sub text-[14px] leading-relaxed font-medium">
            Choose a focus area for your clinical check-in. Validated tests take 3-5 minutes.
          </p>
        </div>

        {/* Assessment Grid — MindHealthy style */}
        <div className="grid grid-cols-2 gap-3.5">
          {ASSESSMENT_LIST.map((test, idx) => {
            const summary = historySummary[test.id];
            const testDef = ASSESSMENTS[test.id];
            const severity = summary ? testDef?.getSeverity?.(summary.score) : null;
            
            let availableAgainDays = 0;
            let isLocked = false;

            if (summary && summary.date) {
              const now = new Date();
              const diffTime = Math.abs(now - summary.date);
              const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              availableAgainDays = 14 - daysSince;
              isLocked = availableAgainDays > 0;
            }

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ease: 'easeOut' }}
              >
                <div 
                  onClick={() => navigate(`/assessment/${test.id}`)}
                  className="relative overflow-hidden rounded-[24px] border border-subtle shadow-md cursor-pointer active:scale-[0.96] transition-transform duration-200 h-[220px] flex flex-col group"
                >
                  {/* Full Card Image Background */}
                  <div className="absolute inset-0 w-full h-full bg-[#1E2A4A]">
                    <img 
                      src={test.image} 
                      alt={test.title}
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                  </div>

                  {/* Top Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {summary ? (
                      <div className="relative">
                        <div className="w-3h-3 rounded-full shadow-sm border border-white" style={{ backgroundColor: severity?.color || '#34D399' }} />
                        <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-60" style={{ backgroundColor: severity?.color || '#34D399' }} />
                      </div>
                    ) : (
                      <div className="bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-[8px] border border-white/20 shadow-sm">
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Discover</span>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-5 flex-1 flex flex-col relative z-10 flex-col">
                    <div className="mt-auto">
                      <h3 className="text-white font-bold text-[20px] tracking-tight leading-tight mb-1">
                        {test.title}
                      </h3>
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-3">
                        {test.shortName} Validated
                      </p>

                      {/* Bottom action area */}
                      <div className="pt-3 border-t border-white/10">
                        {isLocked ? (
                          <div className="flex items-center gap-1.5 text-white/50">
                            <Lock size={12} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{availableAgainDays}d Remaining</span>
                          </div>
                        ) : summary ? (
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-0.5">Last Result</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[18px] font-black leading-none" style={{ color: severity?.color || '#FFFFFF' }}>{summary.score}</span>
                                <span className="text-[9px] text-white/50 font-bold uppercase">pts</span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-[12px] flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm">
                              <ArrowRight size={14} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">Start Entry</span>
                            <ArrowRight size={14} className="text-white/90" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
