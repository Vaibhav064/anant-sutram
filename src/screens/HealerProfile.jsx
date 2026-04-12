import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Globe, Award, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALERS_DATA } from './Healers';
import { VerifiedBadge, OnlineDot, Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/layout/PageHeader';

import { API_BASE, apiFetch } from '../lib/api';

export function HealerProfile() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const toast = useToast();
  const user = useStore(s => s.user);
  const getAuthHeader = useStore(s => s.getAuthHeader);

  const [selectedSession, setSelectedSession] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const healer = HEALERS_DATA.find(h => h.id === id);

  if (!healer) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <span className="text-[48px] mb-4">🔍</span>
        <p className="text-muted font-bold text-lg tracking-tight">Healer not found</p>
      </div>
    );
  }

  const handleBook = async () => {
    if (!selectedSession) { toast.error('Please select a session type'); return; }
    setShowConfirm(false);
    setBooking(true);

    try {
      if (user) {
        const res = await apiFetch('/api/healers/bookings', {
          method: 'POST',
          body: JSON.stringify({
            healerId: healer.id,
            healerName: healer.name,
            sessionType: selectedSession.type,
            duration: selectedSession.duration,
            price: selectedSession.price,
          }),
        });
        if (!res.ok) throw new Error();
      }

      setBooked(true);
      toast.success(`Session booked with ${healer.name}! 🎉`);
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <PageHeader title={healer.name} subtitle={healer.tagline} />

      {/* ── Hero ── */}
      <div className="relative">
        <div className="h-44 relative overflow-hidden bg-gradient-to-br from-[#E2E8F0] via-[#F8FAFC] to-[#F1F5F9]">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-[60px]" />
          <div className="absolute top-[20%] -right-10 w-40 h-40 bg-secondary/15 rounded-full blur-[50px]" />
          <div className="absolute -bottom-10 left-[40%] w-60 h-60 bg-teal/10 rounded-full blur-[60px]" />
        </div>
        <div className="absolute bottom-0 left-6 translate-y-1/2 flex items-end gap-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-[28px] bg-surface border-4 border-bg overflow-hidden shadow-2xl">
              <img src={healer.photo} alt={healer.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="hidden w-full h-full items-center justify-center text-[48px] bg-surface2">🧘‍♀️</div>
            </div>
            {healer.isVerified && <div className="absolute -bottom-1 -right-1 scale-125 drop-shadow-xl"><VerifiedBadge /></div>}
            {healer.isAvailableNow && <div className="absolute -top-1 -right-1 z-10"><OnlineDot size="md" /></div>}
          </div>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="px-6 pt-20 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-[30px] font-black text-main tracking-tighter leading-none mb-2">{healer.name}</h1>
            <div className="flex items-center gap-2">
               <Award size={13} className="text-primary-light" />
               <p className="text-sub text-[13px] font-bold tracking-tight">{healer.experience} in healing</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 bg-surface border border-subtle px-4 py-3 rounded-[20px] shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1.5">
               <Star size={16} className="text-gold fill-gold" />
               <span className="text-main font-black text-[20px] leading-none tracking-tight">{healer.rating}</span>
            </div>
            <span className="text-muted text-[10px] font-black uppercase tracking-widest">{healer.reviewCount} Reviews</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {healer.specialties.slice(0, 3).map(s => (
            <span key={s} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] font-black uppercase tracking-[0.1em]">
               {s}
            </span>
          ))}
        </div>

        {/* Status Blocks */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-surface border border-subtle rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:border-soft transition-all">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl" />
            <Clock size={18} className="text-primary-light mb-4" />
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1.5 leading-none">Standard Rate</p>
            <p className="text-main font-black text-[24px] tracking-tighter leading-none">₹{healer.priceQuick}</p>
          </div>
          <div className="bg-surface border border-subtle rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:border-soft transition-all">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-teal/10 rounded-full blur-2xl" />
            <Globe size={18} className="text-teal mb-4" />
            <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1.5 leading-none">Language</p>
            <p className="text-main font-black text-[18px] tracking-tight truncate leading-none">{healer.languages[0]}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-10 lg:px-2">
          <h3 className="text-[11px] font-black text-muted/30 uppercase tracking-[0.3em] mb-4">Biography</h3>
          <p className="text-sub text-[17px] leading-[1.7] font-medium tracking-tight whitespace-pre-line">{healer.bio}</p>
        </div>

        {/* Specialties */}
        <div className="mb-12">
          <h3 className="text-[11px] font-black text-muted/30 uppercase tracking-[0.3em] mb-6">Core Methodology</h3>
          <div className="grid grid-cols-1 gap-3">
            {healer.specialties.map(s => (
              <div key={s} className="flex items-center gap-4 bg-surface border border-subtle p-4 rounded-2xl hover:bg-surface2 transition-colors shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary-light shadow-glow-primary shrink-0" />
                <p className="text-main font-bold text-[15px] tracking-tight">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="mb-12">
          <h3 className="text-[11px] font-black text-muted/30 uppercase tracking-[0.3em] mb-6">Engagement Plans</h3>
          <div className="space-y-3.5">
            {healer.sessionTypes.map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedSession(s)}
                className={`w-full flex items-center justify-between p-6 rounded-[28px] border transition-all duration-300 text-left relative overflow-hidden group shadow-sm ${
                  selectedSession?.type === s.type
                    ? 'bg-primary/5 border-primary/40 shadow-xl'
                    : 'bg-surface border-subtle hover:border-soft hover:bg-surface2'
                }`}
              >
                {selectedSession?.type === s.type && (
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                )}
                
                <div>
                  <p className="text-main font-black text-[18px] tracking-tight">{s.type}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                     <Clock size={12} className="text-muted" />
                     <p className="text-sub text-[12px] font-bold">{s.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-main font-black text-[22px] tracking-tighter">₹{s.price}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    selectedSession?.type === s.type ? 'border-primary bg-primary shadow-glow-primary scale-110' : 'border-subtle'
                  }`}>
                    {selectedSession?.type === s.type && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h3 className="text-[11px] font-black text-muted/30 uppercase tracking-[0.3em] mb-6">Client Experiences</h3>
          <div className="space-y-4">
            {(showAllReviews ? healer.reviews : healer.reviews.slice(0, 2)).map((r, i) => (
              <div key={i} className="bg-surface border border-subtle rounded-[24px] p-6 relative overflow-hidden shadow-sm group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-surface2 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/5 transition-colors" />
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-[14px] bg-primary/10 border border-primary/20 flex items-center justify-center text-[16px] font-black text-primary-light shadow-inner">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-main font-black text-[15px] tracking-tight">{r.name}</p>
                    <div className="flex gap-1 mt-1 text-gold">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={11} className="fill-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sub text-[14px] leading-relaxed font-medium tracking-tight relative z-10 italic">"{r.text}"</p>
              </div>
            ))}
            {healer.reviews.length > 2 && (
              <button 
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full h-12 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest text-primary-light border border-primary/20 rounded-2xl bg-surface hover:bg-surface2 transition-all active:scale-[0.98] shadow-sm"
              >
                {showAllReviews ? 'Show Focus Reviews' : `Explore ${healer.reviews.length} Experiences`}
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAllReviews ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* ── Action CTA (At the last of the page) ── */}
        <div className="mt-8 px-2 pb-32">
          {booked ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/10 border border-primary/20 rounded-[28px] p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <p className="text-primary font-black text-[22px] tracking-tight">Booking Requested! 🎉</p>
              <p className="text-sub text-[14px] font-bold mt-2 uppercase tracking-widest leading-relaxed">
                {healer.name} will reach out <br/> to you shortly.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
               <button
                onClick={() => {
                  if (!selectedSession) { toast.error('Please select an engagement plan'); return; }
                  setShowConfirm(true);
                }}
                disabled={booking}
                className="w-full py-4 rounded-[22px] bg-primary text-white font-black text-[14px] uppercase tracking-[0.1em] shadow-sm transform active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {booking ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  selectedSession ? `Book ${selectedSession.type} · ₹${selectedSession.price}` : 'Select a Plan From Above'
                )}
              </button>
              <p className="text-center text-muted text-[11px] font-bold uppercase tracking-widest opacity-60">Secure Payment & Session Guarantee</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleBook}
        isLoading={booking}
        title="Confirm Booking"
        message={`Book a "${selectedSession?.type}" (${selectedSession?.duration}) session with ${healer.name} for ₹${selectedSession?.price}?`}
        confirmLabel={`Unlock for ₹${selectedSession?.price}`}
        confirmVariant="primary"
      />
    </div>
  );
}
