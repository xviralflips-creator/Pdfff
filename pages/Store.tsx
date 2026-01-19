
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Crown, CheckCircle2, ShoppingBag, CreditCard } from 'lucide-react';
import { Subscription } from '../types';

interface StoreProps {
  credits: number;
  onPurchase: (amount: number) => void;
  onSubscribe: (sub: Subscription) => void;
  sub: Subscription;
}

const Store: React.FC<StoreProps> = ({ credits, onPurchase, onSubscribe, sub }) => {
  const creditPacks = [
    { amount: 500, price: '$4.99', popular: false },
    { amount: 2000, price: '$14.99', popular: true },
    { amount: 5000, price: '$29.99', popular: false }
  ];

  const subPlans = [
    { 
      tier: 'pro' as const, 
      name: 'Lumina Pro', 
      price: '$19/mo', 
      features: ['5,000 Monthly Credits', '4K Image Upscaling', 'Veo Fast Access', 'Priority Support'] 
    },
    { 
      tier: 'elite' as const, 
      name: 'Lumina Elite', 
      price: '$49/mo', 
      features: ['Unlimited Credits', 'Commercial Rights', 'VEO Pro High-Res', 'Early Access Tools'] 
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter">Lumina Store</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Upgrade your creative power</p>
      </div>

      {/* Credit Balance Card */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <Zap size={150} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" fill="currentColor" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200 opacity-80 mb-2">Current Balance</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-6xl font-black tabular-nums">{credits.toLocaleString()}</h3>
            <span className="text-xl font-bold opacity-60 italic">CR</span>
          </div>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <ShieldCheck size={16} className="mr-2 text-cyan-200" />
            <span className="text-xs font-bold uppercase tracking-widest">Active Tier: {sub.tier.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <section className="space-y-6">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Subscriptions</h4>
        <div className="grid gap-4">
          {subPlans.map((plan) => (
            <div 
              key={plan.tier}
              className={`p-6 rounded-[2rem] border transition-all ${sub.tier === plan.tier ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-900 border-white/5'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {plan.tier === 'elite' ? <Crown className="text-yellow-400" /> : <Zap className="text-cyan-400" />}
                  <span className="text-xl font-black italic">{plan.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-200">{plan.price}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-xs text-slate-400 font-medium">
                    <CheckCircle2 size={14} className="mr-2 text-cyan-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onSubscribe({ tier: plan.tier })}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${sub.tier === plan.tier ? 'bg-cyan-500 text-white shadow-lg' : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5'}`}
              >
                {sub.tier === plan.tier ? 'Active Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Packs */}
      <section className="space-y-6">
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">One-Time Credits</h4>
        <div className="grid gap-4">
          {creditPacks.map((pack) => (
            <button 
              key={pack.amount}
              onClick={() => onPurchase(pack.amount)}
              className={`p-5 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-between group transition-all hover:border-cyan-500/30 ${pack.popular ? 'ring-2 ring-cyan-500/20' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${pack.popular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-950 text-slate-600'}`}>
                  <Zap size={24} fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-white">{pack.amount.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-500">CREDITS</span>
                  </div>
                  {pack.popular && <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Most Popular</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-white">{pack.price}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">One-time</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="py-10 text-center">
        <p className="text-xs text-slate-600 font-medium">Payments secured by Stripe. All taxes included.</p>
      </div>
    </div>
  );
};

export default Store;
