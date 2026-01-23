import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { generateVideo } from '../geminiService';
import { Play, Video as VideoIcon, Loader2, Sparkles, Film, CheckCircle, Zap, AlertCircle, Key, Info } from 'lucide-react';

// Use any to bypass Framer Motion property type errors in this environment
const MotionDiv = motion.div as any;

interface VideoStudioProps {
  projects: Project[];
  onUpdate: (id: string, updates: Partial<Project>) => void;
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
}

const VIDEO_CREDIT_COST = 1200;

// Correctly augment the global Window interface to match existing internal declarations
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const VideoStudio: React.FC<VideoStudioProps> = ({ projects, onUpdate, credits, onConsumeCredits, onError }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [generatingPageIdx, setGeneratingPageIdx] = useState<number | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleGenerateVideo = async (pageIdx: number) => {
    if (!selectedProject) return;
    
    if (credits < VIDEO_CREDIT_COST) {
      onError("Credit balance too low for Veo cinematic synthesis.");
      return;
    }

    setGeneratingPageIdx(pageIdx);
    setStatusMessage('Analyzing scene composition...');
    
    try {
      const page = selectedProject.pages[pageIdx];
      
      // Use the static image as a starting frame for the video for visual consistency
      const videoUrl = await generateVideo(page.imagePrompt, page.imageUrl);
      
      onConsumeCredits(VIDEO_CREDIT_COST);
      
      const newPages = [...selectedProject.pages];
      newPages[pageIdx] = { ...newPages[pageIdx], videoUrl };
      onUpdate(selectedProject.id, { pages: newPages });
      setStatusMessage('');
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        onError("Your API key session has expired. Please re-select your key.");
      } else {
        onError("Veo generation encountered a neural relay error. Please check your billing or quota.");
      }
    } finally {
      setGeneratingPageIdx(null);
    }
  };

  // Status message rotation for long-running video generations
  useEffect(() => {
    if (generatingPageIdx !== null) {
      const messages = [
        "Analyzing scene composition...",
        "Simulating camera kinetics...",
        "Synthesizing temporal pixel flows...",
        "Applying cinematic lighting...",
        "Finalizing VEO render..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setStatusMessage(messages[i]);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [generatingPageIdx]);

  if (hasKey === false) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
          <Key size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white italic">Premium Access Required</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
            Veo Cinematic generation requires a paid API key. 
            Connect your <span className="text-white font-bold">Google Cloud Project</span> with billing enabled to continue.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <button 
            onClick={handleOpenKeySelector}
            className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-500 shadow-2xl shadow-blue-600/40 transition-all flex items-center space-x-3 active:scale-95"
          >
            <Zap size={24} fill="currentColor" />
            <span>Select Paid API Key</span>
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 text-sm font-bold flex items-center space-x-2">
            <Info size={14} />
            <span>Learn about billing requirements</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2">Narrative Archive</h3>
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full p-6 rounded-[2.5rem] border transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                  selectedProjectId === p.id 
                    ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/30 ring-2 ring-blue-400/20' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-left relative z-10 overflow-hidden">
                  <p className="font-bold truncate text-white text-lg">{p.title}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider ${selectedProjectId === p.id ? 'text-blue-100' : 'text-slate-500'}`}>{p.pages.length} Keyframes</p>
                </div>
                <Film size={20} className={`relative z-10 transition-transform group-hover:rotate-12 ${selectedProjectId === p.id ? 'text-white' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 min-h-[600px]">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              /* Fix motion.div error by adding MotionDiv alias and proper initialization */
              <MotionDiv 
                key={selectedProject.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-[0.03] -z-10 text-white pointer-events-none">
                    <VideoIcon size={400} />
                  </div>

                  <div className="flex items-center justify-between mb-16 relative z-10">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">{selectedProject.title}</h2>
                      <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                         <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-[10px]">Neural Cinema Pipeline Engine</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 shadow-inner">
                        <Zap size={16} className="text-yellow-400" fill="currentColor" />
                        <span className="text-sm font-black text-slate-100">{VIDEO_CREDIT_COST} CR</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-20">
                    {selectedProject.pages.map((page, idx) => (
                      <div key={page.id} className="grid lg:grid-cols-2 gap-12 group">
                        <div className="space-y-8">
                           <div className="flex items-center space-x-5">
                              <span className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-lg font-black text-blue-400 border border-blue-500/20 shadow-lg">
                                {idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <h4 className="font-black text-xl text-white tracking-tight uppercase">Cinematic Sequence {idx + 1}</h4>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Veo 3.1 Pro Engine</span>
                              </div>
                           </div>
                           
                           <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 backdrop-blur-sm group-hover:border-blue-500/20 transition-all">
                             <p className="text-slate-300 text-base leading-relaxed italic font-medium">"{page.imagePrompt}"</p>
                           </div>

                           <button
                            disabled={generatingPageIdx !== null}
                            onClick={() => handleGenerateVideo(idx)}
                            className={`w-full flex items-center justify-center space-x-4 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-[0.98] ${
                              page.videoUrl 
                                ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10' 
                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/30'
                            }`}
                          >
                            {generatingPageIdx === idx ? (
                              <>
                                <Loader2 size={24} className="animate-spin" />
                                <span className="animate-pulse">{statusMessage}</span>
                              </>
                            ) : page.videoUrl ? (
                              <>
                                <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                                <span>Regenerate Sequence</span>
                              </>
                            ) : (
                              <>
                                <Film size={24} />
                                <span>Synthesize Cinema Clip</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="aspect-video bg-black rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group-hover:border-blue-500/40 transition-all duration-500 ring-4 ring-black">
                          {page.videoUrl ? (
                            <video 
                              src={page.videoUrl} 
                              controls 
                              className="w-full h-full object-cover" 
                              poster={page.imageUrl}
                              autoPlay
                              loop
                              muted
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-slate-950 relative overflow-hidden">
                               <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                               <img src={page.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-xl" alt="Preview" />
                               <div className="relative z-10 flex flex-col items-center">
                                 <VideoIcon size={80} className="mb-6 opacity-5 relative" />
                                 {generatingPageIdx === idx ? (
                                   <div className="text-center">
                                      <div className="flex justify-center space-x-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/80">Vectorizing Pixels</p>
                                   </div>
                                 ) : (
                                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Awaiting Neural Uplink</p>
                                 )}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            ) : (
              /* Fix motion.div error by using MotionDiv alias */
              <MotionDiv 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-800 group"
              >
                 <div className="w-40 h-40 bg-slate-800 rounded-[3rem] flex items-center justify-center mb-10 text-slate-700 shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <Film size={80} className="opacity-40 group-hover:text-blue-500/40 transition-colors" />
                 </div>
                 <h3 className="text-4xl font-black text-white italic tracking-tighter">Cinema Director Console</h3>
                 <p className="text-slate-500 mt-4 font-bold text-xl opacity-80">Select a static narrative to initiate cinematic metamorphosis.</p>
                 <div className="grid grid-cols-3 gap-10 mt-16">
                    <FeatureBadge label="Resolution" val="1080P PRO" />
                    <FeatureBadge label="Frame Rate" val="60 FPS" />
                    <FeatureBadge label="Model" val="VEO 3.1" />
                 </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FeatureBadge = ({ label, val }: { label: string, val: string }) => (
  <div className="flex flex-col items-center">
     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">{label}</span>
     <span className="px-6 py-2.5 bg-slate-800 rounded-2xl text-xs font-black text-slate-300 border border-slate-700/50 shadow-lg">
        {val}
     </span>
  </div>
);

const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default VideoStudio;