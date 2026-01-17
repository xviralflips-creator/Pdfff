
import React from 'react';
import { Zap, BookOpen, Layers, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Zap size={24} fill="white" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic">NANOPDF</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-slate-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <button 
            onClick={onStart}
            className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
          AI-Powered Stories <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Turned into PDFs</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate platform for generating digital e-books, image stories, and professional documents using Gemini Nano Banana and advanced AI models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-5 bg-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-500 shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight size={24} />
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-xl hover:bg-slate-700 transition-all">
            View Sample E-books
          </button>
        </div>

        {/* Mockup Preview */}
        <div className="mt-24 relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/40 border border-slate-700/50 transform rotate-1">
           <img src="https://picsum.photos/seed/dashboard/1200/800" alt="App Dashboard Preview" className="w-full h-auto opacity-80" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 py-24 px-6 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: "Nano Banana", desc: "Fastest text-to-image generation for multi-page consistency." },
            { icon: BookOpen, title: "E-Book Suite", desc: "Chapters, covers, and table of contents generated instantly." },
            { icon: Layers, title: "PDF Engine", desc: "High-resolution print-ready exports and PDF compression." },
            { icon: Shield, title: "Pro Dashboard", desc: "Full control over projects, credits, and version history." }
          ].map((feat, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feat.icon className="text-blue-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t border-slate-800 text-center text-slate-500">
        <p>© 2024 NanoPDF Studio. All rights reserved. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
