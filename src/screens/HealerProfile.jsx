import { useState } from 'react';
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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
        <span className="text-[48px] mb-4">🔍</span>
        <p className="text-white/50 font-medium">Healer not found</p>
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
    <div className="min-h-screen bg-bg pb-nav">
      <PageHeader title={healer.name} subtitle={healer.tagline} />

      {/* ── Hero ── */}
      <div className="relative">
        <div className="h-52 bg-gradient-to-br from-primary/20 via-surface2 to-secondary/10 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/10 backdrop-blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-6 translate-y-1/2 flex items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] bg-white/5 border-4 border-[#120F20] overflow-hidden shadow-2xl transition-transform hover:scale-105">
              <img src={healer.photo} alt={healer.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="hidden w-full h-full items-center justify-center text-[48px] bg-white/5">🧘‍♀️</div>
            </div>
            {healer.isVerified && <div className="absolute -bottom-1 -right-1 scale-125 drop-shadow-xl"><VerifiedBadge /></div>}
            {healer.isAvailableNow && <div className="absolute -top-1 -right-1 z-10"><OnlineDot size="md" /></div>}
          </div>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="px-6 pt-20 pb-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-[36px] font-black text-white tracking-tighter leading-none mb-3">{healer.name}</h1>
            <div className="flex items-center gap-2">
               <Award size={14} className="text-primary-light" />
               <p className="text-white/40 text-[14px] font-bold tracking-tight">{healer.experience} journey in healing</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 bg-white/5 border border-white/10 px-4 py-3 rounded-[20px] backdrop-blur-md">
            <div className="flex items-center gap-1.5">
               <Star size={16} className="text-gold fill-gold" />
               <span className="text-white font-black text-[20px] leading-none tracking-tight">{healer.rating}</span>
            </div>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">{healer.reviewCount} Reviews</span>
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
          <div className="glass border border-white/5 rounded-[24px] p-5 shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl" />
            <Clock size={18} className="text-primary-light mb-4" />
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5 leading-none">Standard Rate</p>
            <p className="text-white font-black text-[24px] tracking-tighter leading-none">₹{healer.priceQuick}</p>
          </div>
          <div className="glass border border-white/5 rounded-[24px] p-5 shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-teal/10 rounded-full blur-2xl" />
            <Globe size={18} className="text-teal mb-4" />
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5 leading-none">Language</p>
            <p className="text-white font-black text-[18px] tracking-tight truncate leading-none">{healer.languages[0]}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-10 lg:px-2">
          <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Biography</h3>
          <p className="text-white/70 text-[17px] leading-[1.7] font-medium tracking-tight whitespace-pre-line">{healer.bio}</p>
        </div>

        {/* Specialties */}
        <div className="mb-12">
          <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Core Methodology</h3>
          <div className="grid grid-cols-1 gap-3">
            {healer.specialties.map(s => (
              <div key={s} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary-light shadow-glow-primary shrink-0" />
                <p className="text-white font-bold text-[15px] tracking-tight">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="mb-12">
          <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Engagement Plans</h3>
          <div className="space-y-3.5">
            {healer.sessionTypes.map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedSession(s)}
                className={`w-full flex items-center justify-between p-6 rounded-[28px] border transition-all duration-300 text-left relative overflow-hidden group ${
                  selectedSession?.type === s.type
                    ? 'bg-primary/10 border-primary/40 shadow-xl'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {selectedSession?.type === s.type && (
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                )}
                
                <div>
                  <p className="text-white font-black text-[18px] tracking-tight">{s.type}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                     <Clock size={12} className="text-white/20" />
                     <p className="text-white/40 text-[12px] font-bold">{s.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-white font-black text-[22px] tracking-tighter">₹{s.price}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    selectedSession?.type === s.type ? 'border-primary bg-primary shadow-glow-primary scale-110' : 'border-white/10'
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
          <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Client Experiences</h3>
          <div className="space-y-4">
            {(showAllReviews ? healer.reviews : healer.reviews.slice(0, 2)).map((r, i) => (
              <div key={i} className="glass border border-white/5 rounded-[24px] p-6 relative overflow-hidden shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-colors" />
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-[14px] bg-primary/10 border border-primary/20 flex items-center justify-center text-[16px] font-black text-primary-light shadow-inner">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-black text-[15px] tracking-tight">{r.name}</p>
                    <div className="flex gap-1 mt-1 text-gold">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={11} className="fill-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/60 text-[14px] leading-relaxed font-medium tracking-tight relative z-10 italic">"{r.text}"</p>
              </div>
            ))}
            {healer.reviews.length > 2 && (
              <button 
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full h-12 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest text-primary-light border border-primary/20 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all active:scale-[0.98]"
              >
                {showAllReviews ? 'Show Focus Reviews' : `Explore ${healer.reviews.length} Experiences`}
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAllReviews ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 p-6 glass-morphism border-t border-white/5 z-30">
        {booked ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/20 border border-primary/30 rounded-[28px] p-5 text-center shadow-glow-primary backdrop-blur-3xl"
          >
            <p className="text-primary-light font-black text-[18px] tracking-tight">Booking Requested Successfully!</p>
            <p className="text-white/40 text-[12px] font-bold mt-1.5 uppercase tracking-widest">{healer.name} will reach out shortly</p>
          </motion.div>
        ) : (
          <button
            onClick={() => {
              if (!selectedSession) { toast.error('Please select an engagement plan'); return; }
              setShowConfirm(true);
            }}
            disabled={booking}
            className="w-full h-18 py-5 rounded-[28px] bg-primary text-white font-black text-[16px] uppercase tracking-[0.2em] shadow-glow-primary btn-glow transform active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3"
          >
            {booking ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {selectedSession ? `Book ${selectedSession.type} · ₹${selectedSession.price}` : 'Select a Plan to Begin'}
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleBook}
        isLoading={booking}
        title="Confirm Booking"
        message={`Book a "${selectedSession?.type}" (${selectedSession?.duration}) with ${healer.name} for ₹${selectedSession?.price}?`}
        confirmLabel={`Confirm · ₹${selectedSession?.price}`}
        confirmVariant="primary"
      />
    </div>
  );
}
