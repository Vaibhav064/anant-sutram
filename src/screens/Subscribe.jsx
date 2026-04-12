import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Subscribe() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const setSubscription = useStore(state => state.setSubscription);
  const currentTier = useStore(state => state.subscriptionTier);

  const handleSubscribe = (tier) => {
    // Mock Razorpay / payment success
    setSubscription(tier);
    navigate('/home');
  };

  return (
    <div className="min-h-[100dvh] bg-bg pb-24 flex flex-col pt-safe">
      <div className="px-6 mt-8 mb-6 text-center">
        <h1 className="text-[32px] font-display font-bold text-main leading-tight tracking-tight">
          Unlock Unlimited<br/>Healing
        </h1>
        <p className="text-sub text-[14px] mt-3 max-w-xs mx-auto font-medium">
          Your patterns are becoming clearer. Continue your journey without limits.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-surface2 p-1 rounded-full border border-soft flex shadow-sm">
          <button 
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${!isYearly ? 'bg-surface text-main shadow-md' : 'text-sub hover:text-main'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center ${isYearly ? 'bg-surface text-main shadow-md' : 'text-sub hover:text-main'}`}
          >
            Yearly <span className="ml-2 text-gold text-[9px] bg-gold/10 font-black px-2 py-0.5 rounded-[6px] uppercase tracking-wider">Save 30%</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* FREE TIER */}
        <div className="bg-surface2 border border-subtle rounded-3xl p-6 opacity-70">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-main font-bold tracking-widest text-[14px]">AURA</h2>
            <span className="text-sub font-bold text-[13px]">Free</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="text-[13px] text-sub flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-muted shrink-0" /> 5 AI sessions/month</li>
            <li className="text-[13px] text-sub flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-muted shrink-0" /> Basic mood tracking</li>
            <li className="text-[13px] text-sub flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-muted shrink-0" /> Community reading</li>
          </ul>
          <button disabled className="w-full py-4 rounded-full bg-surface border border-subtle text-muted font-bold text-[14px] mt-2 shadow-sm">
            {currentTier === 'aura' ? 'Your current plan' : 'Downgrade'}
          </button>
        </div>

        {/* SHAKTI TIER */}
        <div className="bg-surface bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 rounded-3xl p-7 relative overflow-hidden shadow-glow-primary">
          <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg border border-white/20 z-10">
            MOST POPULAR
          </div>
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-primary font-display font-bold text-[26px] tracking-tight">SHAKTI</h2>
            <div className="text-right">
              <span className="text-main font-bold text-[24px]">₹{isYearly ? '999' : '99'}</span>
              <span className="text-sub text-[14px] font-medium">/{isYearly ? 'yr' : 'mo'}</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0 transition-transform hover:scale-110" /> Unlimited AI chat & Panic SOS</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0 transition-transform hover:scale-110" /> Smart journaling + insights</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0 transition-transform hover:scale-110" /> 2 free healer sessions/month</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0 transition-transform hover:scale-110" /> Includes 1 Anxiety Reset Plan</li>
          </ul>
          <button onClick={() => handleSubscribe('shakti')} className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.6)] transition-all active:scale-95">
            Start Healing — ₹{isYearly ? '999/yr' : '99/mo'}
          </button>
        </div>

        {/* MOKSHA TIER */}
        <div className="bg-surface bg-gradient-to-b from-gold/10 to-transparent border border-gold/30 rounded-3xl p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6 mt-1">
            <h2 className="text-gold font-display font-bold text-[26px] tracking-tight">MOKSHA</h2>
            <div className="text-right">
              <span className="text-main font-bold text-[24px]">₹{isYearly ? '2,499' : '499'}</span>
              <span className="text-sub text-[14px] font-medium">/{isYearly ? 'yr' : 'mo'}</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0 transition-transform hover:scale-110" /> Everything in Shakti</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0 transition-transform hover:scale-110" /> Voice AI healer</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0 transition-transform hover:scale-110" /> 5 free healer sessions/month</li>
            <li className="text-[14px] text-main flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0 transition-transform hover:scale-110" /> All Anxiety Reset Plans Included</li>
          </ul>
          <button onClick={() => handleSubscribe('moksha')} className="w-full py-4 rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_4px_25px_rgba(217,119,6,0.5)] transition-all active:scale-95">
            Unlock Deep Healing
          </button>
        </div>
      </div>

      <div className="mt-10 mb-8 flex flex-col items-center px-6 text-center text-muted">
        <ShieldCheck size={24} className="mb-3 opacity-60" />
        <p className="text-[12px] mb-1.5 font-bold tracking-wide">7-day money-back guarantee • Cancel anytime</p>
        <p className="text-[11px] font-medium">Secure payment via Razorpay</p>
      </div>
    </div>
  );
}
