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
    <div className="min-h-screen bg-[#0F0A1E] pb-24 flex flex-col pt-safe">
      <div className="px-6 mt-8 mb-6 text-center">
        <h1 className="text-[32px] font-display font-bold text-white leading-tight">
          Unlock Unlimited<br/>Healing
        </h1>
        <p className="text-white/60 text-[14px] mt-3 max-w-xs mx-auto">
          Your patterns are becoming clearer. Continue your journey without limits.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-[#0D0D1E] p-1 rounded-full border border-white/10 flex">
          <button 
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${!isYearly ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center ${isYearly ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
          >
            Yearly <span className="ml-2 text-gold text-[9px] bg-gold/20 font-black px-2 py-0.5 rounded uppercase tracking-wider">Save 30%</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-5">
        <div className="bg-[#0D0D1E] border border-white/10 rounded-3xl p-6 opacity-70">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white/80 font-bold tracking-widest text-[14px]">AURA</h2>
            <span className="text-white/80 font-bold">Free</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="text-[13px] text-white/50 flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-white/30" /> 5 AI sessions/month</li>
            <li className="text-[13px] text-white/50 flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-white/30" /> Basic mood tracking</li>
            <li className="text-[13px] text-white/50 flex items-center font-medium"><CheckCircle2 size={16} className="mr-3 text-white/30" /> Community reading</li>
          </ul>
          <button disabled className="w-full py-4 rounded-full bg-white/5 text-white/30 font-bold text-[14px] border border-white/10 mt-2">
            {currentTier === 'aura' ? 'Your current plan' : 'Downgrade'}
          </button>
        </div>

        <div className="bg-gradient-to-b from-primary/20 to-[#0D0D1E] border border-primary/50 rounded-3xl p-7 relative overflow-hidden shadow-[0_10px_30px_rgba(124,58,237,0.1)]">
          <div className="absolute top-0 right-0 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl tracking-widest shadow-md">
            MOST POPULAR
          </div>
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-primary font-display font-bold text-[26px]">SHAKTI</h2>
            <div className="text-right">
              <span className="text-white font-bold text-[24px]">₹{isYearly ? '999' : '99'}</span>
              <span className="text-white/50 text-[14px] font-medium">/{isYearly ? 'yr' : 'mo'}</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0" /> Unlimited AI chat</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0" /> Panic SOS 24/7</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0" /> Smart journaling + insights</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-primary shrink-0" /> 1 healer session credit/month</li>
          </ul>
          <button onClick={() => handleSubscribe('shakti')} className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.6)] transition-all">
            Start Healing — ₹{isYearly ? '999/yr' : '99/mo'}
          </button>
        </div>

        <div className="bg-gradient-to-b from-gold/20 to-[#0D0D1E] border border-gold/40 rounded-3xl p-7 shadow-[0_10px_30px_rgba(217,119,6,0.1)]">
          <div className="flex justify-between items-center mb-6 mt-1">
            <h2 className="text-gold font-display font-bold text-[26px]">MOKSHA</h2>
            <div className="text-right">
              <span className="text-white font-bold text-[24px]">₹{isYearly ? '2,499' : '499'}</span>
              <span className="text-white/50 text-[14px] font-medium">/{isYearly ? 'yr' : 'mo'}</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0" /> Everything in Shakti</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0" /> Voice AI healer</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0" /> 3 healer sessions/month</li>
            <li className="text-[14px] text-white/90 flex items-start font-medium leading-normal"><CheckCircle2 size={18} className="mr-3 text-gold shrink-0" /> 21-day transformation programs</li>
          </ul>
          <button onClick={() => handleSubscribe('moksha')} className="w-full py-4 rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#0D0D1E] font-bold text-[15px] shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_4px_25px_rgba(217,119,6,0.5)] transition-all">
            Unlock Deep Healing
          </button>
        </div>
      </div>

      <div className="mt-10 mb-8 flex flex-col items-center opacity-40 px-6 text-center">
        <ShieldCheck size={24} className="mb-3" />
        <p className="text-[12px] mb-1.5 font-medium tracking-wide">7-day money-back guarantee • Cancel anytime</p>
        <p className="text-[11px]">Secure payment via Razorpay</p>
      </div>
    </div>
  );
}
