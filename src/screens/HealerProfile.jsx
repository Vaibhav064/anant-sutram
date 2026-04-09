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
        <div className="h-36 bg-gradient-to-br from-primary/20 via-surface2 to-secondary/10" />
        <div className="absolute bottom-0 left-5 translate-y-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-bg overflow-hidden shadow-card">
              <img src={healer.photo} alt={healer.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            {healer.isVerified && <div className="absolute -bottom-1 -right-1"><VerifiedBadge /></div>}
            {healer.isAvailableNow && <div className="absolute -top-1 -right-1"><OnlineDot size="md" /></div>}
          </div>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="px-5 pt-16 pb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">{healer.name}</h1>
            <p className="text-white/40 text-[13px] mt-0.5">{healer.experience} experience</p>
          </div>
          <div className="flex items-center gap-1">
            <Star size={15} className="text-gold fill-gold" />
            <span className="text-gold font-bold text-[16px]">{healer.rating}</span>
            <span className="text-white/30 text-[12px] ml-1">({healer.reviewCount})</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {healer.specialties.slice(0, 3).map(s => (
            <Badge key={s} variant="primary" size="sm">{s}</Badge>
          ))}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface2 border border-white/6 rounded-2xl p-4">
            <Clock size={16} className="text-primary mb-2" />
            <p className="text-white/40 text-[11px] uppercase tracking-wider mb-1">Session from</p>
            <p className="text-white font-bold text-[16px]">₹{healer.priceQuick}</p>
          </div>
          <div className="bg-surface2 border border-white/6 rounded-2xl p-4">
            <Globe size={16} className="text-teal mb-2" />
            <p className="text-white/40 text-[11px] uppercase tracking-wider mb-1">Languages</p>
            <p className="text-white font-semibold text-[14px]">{healer.languages.join(', ')}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-[13px] font-bold text-white/50 uppercase tracking-widest mb-3">About</h3>
          <p className="text-white/75 text-[15px] leading-[1.7] font-medium">{healer.bio}</p>
        </div>

        {/* Specialties */}
        <div className="mb-6">
          <h3 className="text-[13px] font-bold text-white/50 uppercase tracking-widest mb-3">Specialties</h3>
          <div className="space-y-2">
            {healer.specialties.map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-white/75 text-[14px] font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="mb-6">
          <h3 className="text-[13px] font-bold text-white/50 uppercase tracking-widest mb-3">Choose a Session</h3>
          <div className="space-y-2.5">
            {healer.sessionTypes.map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedSession(s)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${
                  selectedSession?.type === s.type
                    ? 'bg-primary/20 border-primary/40'
                    : 'bg-surface2 border-white/6 hover:border-white/15'
                }`}
              >
                <div>
                  <p className="text-white font-semibold text-[15px]">{s.type}</p>
                  <p className="text-white/40 text-[12px] mt-0.5">{s.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white font-bold text-[16px]">₹{s.price}</p>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedSession?.type === s.type ? 'border-primary bg-primary' : 'border-white/20'
                  }`}>
                    {selectedSession?.type === s.type && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-white/50 uppercase tracking-widest mb-3">Reviews</h3>
          <div className="space-y-3">
            {(showAllReviews ? healer.reviews : healer.reviews.slice(0, 2)).map((r, i) => (
              <div key={i} className="bg-surface2 border border-white/6 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-[12px] font-bold text-white">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-[13px]">{r.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={10} className="text-gold fill-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/65 text-[13px] leading-relaxed">{r.text}</p>
              </div>
            ))}
            {healer.reviews.length > 2 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-primary text-[13px] font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
                {showAllReviews ? 'Show less' : `See all ${healer.reviews.length} reviews`}
                <ChevronDown size={14} className={`transition-transform ${showAllReviews ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 p-5 ios-glass border-t border-white/5 z-30">
        {booked ? (
          <div className="bg-success/15 border border-success/25 rounded-2xl p-4 text-center">
            <p className="text-success font-bold text-[16px]">✓ Session Requested!</p>
            <p className="text-success/70 text-[12px] mt-1">{healer.name} will confirm shortly</p>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!selectedSession) { toast.error('Please select a session type first'); return; }
              setShowConfirm(true);
            }}
            disabled={booking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-[16px] btn-glow hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {booking ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {selectedSession ? `Book ${selectedSession.type} · ₹${selectedSession.price}` : 'Select a Session to Book'}
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
