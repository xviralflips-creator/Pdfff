import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Crown, CheckCircle2, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';
import { Subscription } from '../types';
import Modal from '../components/Modal';

interface StoreProps {
  credits: number;
  onPurchase: (amount: number) => void;
  onSubscribe: (sub: Subscription) => void;
  sub: Subscription;
}

const Store: React.FC<StoreProps> = ({ credits, onPurchase, onSubscribe, sub }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simulate Stripe Checkout
  const handleCheckout = (itemId: string, action: () => void) => {
    setProcessing(itemId);
    // Simulate API call and redirect
    setTimeout(() => {
      setProcessing(null);
      action();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const creditPacks = [
    { id: 'pack_500', amount: 500, price: '$4.99', popular: false },
    { id: 'pack_2000', amount: 2000, price: '$14.99', popular: true },
    { id: 'pack_5000', amount: 5000, price: '$29.99', popular: false }
  ];

  const subPlans = [
    { 
      id: 'plan_pro',
      tier: 'pro' as const, 
      name: 'Lumina Pro', 
      price: '$19/mo', 
      features: ['5,000 Monthly Credits', '4K Image Upscaling', 'Faster Gen Times', 'Priority Support'] 
    },
    { 
      id: 'plan_elite',
      tier: 'elite' as const, 
      name: 'Lumina Elite', 
      price: '$49/mo', 
      features: ['Unlimited Credits', 'Commercial Rights', 'Pro Tools Access', 'Early Access Features'] 
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 pb-24">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black italic tracking-tighter text-white">Lumina Store</h2>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Upgrade your creative power</p>
      </div>

      {/* Credit Balance Card */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500 cursor-default">
        <Zap size={180} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" fill="currentColor" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200 opacity-80 mb-3">Current Balance</p>
          <div className="flex items-baseline space-x-3">
            <h3 className="text-7xl font-black tabular-nums tracking-tight">{credits.toLocaleString()}</h3>
            <span className="text-2xl font-bold opacity-60 italic">CR</span>
          </div>
          <div className="mt-8 inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <ShieldCheck size={18} className="mr-3 text-cyan-200" />
            <span className="text-xs font-bold uppercase tracking-widest">Active Tier: {sub.tier.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <section className="space-y-6">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest px-4 flex items-center gap-2">
          <Crown size={16} /> Subscriptions
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          {subPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between h-full ${
                sub.tier === plan.tier 
                ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/10 scale-[1.02]' 
                : 'bg-slate-900 border-white/5 hover:border-white/10 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {plan.tier === 'elite' ? <Crown className="text-yellow-400" size={28} /> : <Zap className="text-cyan-400" size={28} />}
                    <span className="text-2xl font-black italic">{plan.name}</span>
                  </div>
                  <span className="text-xl font-bold text-slate-200">{plan.price}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-300 font-medium">
                      <CheckCircle2 size={18} className="mr-3 text-cyan-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handleCheckout(plan.id, () => onSubscribe({ tier: plan.tier }))}
                disabled={sub.tier === plan.tier || !!processing}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                  sub.tier === plan.tier 
                  ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                  : 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg'
                }`}
              >
                {processing === plan.id ? (
                  <Loader2 className="animate-spin" />
                ) : sub.tier === plan.tier ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Active Plan</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe via Stripe</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Packs */}
      <section className="space-y-6">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest px-4 flex items-center gap-2">
          <CreditCard size={16} /> Top-Up Credits
        </h4>
        <div className="grid gap-4">
          {creditPacks.map((pack) => (
            <button 
              key={pack.id}
              onClick={() => handleCheckout(pack.id, () => onPurchase(pack.amount))}
              disabled={!!processing}
              className={`p-6 rounded-[2.5rem] bg-slate-900 border-2 flex items-center justify-between group transition-all active:scale-[0.98] hover:bg-slate-800 ${
                pack.popular ? 'border-cyan-500/30 ring-4 ring-cyan-500/10' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center space-x-5">
                <div className={`p-4 rounded-2xl transition-colors ${pack.popular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-950 text-slate-600 group-hover:text-cyan-400'}`}>
                  {processing === pack.id ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} fill="currentColor" />}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-black text-white">{pack.amount.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-500 mt-1">CREDITS</span>
                  </div>
                  {pack.popular && <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mt-1">Most Popular</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xl font-black text-white mb-1">{pack.price}</span>
                <span className="inline-block px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase group-hover:bg-cyan-600 group-hover:text-white transition-colors">Buy</span>
              </div>
            </button>
          ))}
        </div>
      </section>
      
      <Modal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)}
        title="Payment Successful"
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Thank you!</h3>
          <p className="text-slate-400">Your credits have been added to your account.</p>
        </div>
      </Modal>

      <div className="py-6 text-center border-t border-white/5 mt-8">
        <p className="text-xs text-slate-600 font-medium flex items-center justify-center gap-2">
          <CreditCard size={12} />
          Payments processed securely by Stripe.
        </p>
      </div>
    </div>
  );
};

export default Store;