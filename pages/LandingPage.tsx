
import React from 'react';
import { Sparkles, ArrowRight, Zap, Video, Volume2, Megaphone } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 px-6 py-20 flex flex-col items-center text-center space-y-12">
        <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 animate-float">
          <Sparkles size={40} fill="currentColor" />
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl font-black italic tracking-tighter leading-none">
            Lumina <br /> Studio
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">A Neural Media Suite</p>
          <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg">
            Synthesis for the modern age. Image, Video, Audio, and Ad creation in a single neural relay.
          </p>
        </div>

        <button 
          onClick={onStart}
          className="w-full max-w-sm py-6 bg-cyan-500 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <span>INITIATE STUDIO</span>
          <ArrowRight size={24} />
        </button>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-10">
          <Feature icon={Video} label="Veo Cinema" />
          <Feature icon={Volume2} label="Vocal Synth" />
          <Feature icon={Megaphone} label="UGC Ads" />
          <Feature icon={Zap} label="Fast Gen" />
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, label }: any) => (
  <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center space-y-3">
    <Icon className="text-cyan-400" size={24} />
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default LandingPage;
