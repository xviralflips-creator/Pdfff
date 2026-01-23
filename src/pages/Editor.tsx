import React, { useState, useEffect } from 'react';
import { Project, StoryPage, ArtStyle } from '../types';
import { generateImage, generateVideo, generateSpeech, decodeBase64, decodeAudioData, upscalePrompt } from '../geminiService';
import { 
  Save, Download, Trash2, Edit, RefreshCw, ChevronLeft, ChevronRight, 
  Type, ImageIcon, Layout, Eye, Video, Volume2, Sparkles, Wand2, Zap, Play, Loader2,
  Undo, Redo, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface EditorProps {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: () => void;
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
}

const COST_UPSCALE = 500;
const COST_VIDEO = 1200;
const COST_AUDIO = 200;

const Editor: React.FC<EditorProps> = ({ project, onUpdate, onDelete, credits, onConsumeCredits, onError }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // Undo/Redo & Save State
  const [undoStack, setUndoStack] = useState<StoryPage[][]>([]);
  const [redoStack, setRedoStack] = useState<StoryPage[][]>([]);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const currentPage = project.pages[currentPageIndex];

  // Enhanced update function with history tracking
  const updateCurrentPage = (updates: Partial<StoryPage>) => {
    // Push current state to undo stack
    setUndoStack(prev => [...prev, project.pages]);
    setRedoStack([]); // Clear redo stack on new change

    const newPages = [...project.pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], ...updates };
    onUpdate(project.id, { pages: newPages });
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Navigation
      if (e.key === 'ArrowLeft') {
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPageIndex(prev => Math.min(project.pages.length - 1, prev + 1));
      }
      
      // Save (Ctrl/Cmd + S)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }

      // Undo (Ctrl/Cmd + Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undoStack.length === 0) return;
        
        const previousPages = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        
        setRedoStack(prev => [...prev, project.pages]);
        setUndoStack(newUndoStack);
        
        onUpdate(project.id, { pages: previousPages });
      }

      // Redo (Ctrl/Cmd + Shift + Z)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (redoStack.length === 0) return;

        const nextPages = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);

        setUndoStack(prev => [...prev, project.pages]);
        setRedoStack(newRedoStack);

        onUpdate(project.id, { pages: nextPages });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project.pages, undoStack, redoStack, project.id, onUpdate]);

  const regeneratePageImage = async () => {
    setIsRegenerating(true);
    try {
      const newUrl = await generateImage(currentPage.imagePrompt, project.style as ArtStyle);
      updateCurrentPage({ imageUrl: newUrl });
    } catch (e) {
      onError("Failed to regenerate image.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUpscale = async () => {
    if (!onConsumeCredits(COST_UPSCALE)) {
      onError("Insufficient credits for neural upscaling.");
      return;
    }
    setIsUpscaling(true);
    try {
      const refinedPrompt = await upscalePrompt(currentPage.imagePrompt);
      const newUrl = await generateImage(refinedPrompt || currentPage.imagePrompt, project.style as ArtStyle);
      updateCurrentPage({ imageUrl: newUrl, imagePrompt: refinedPrompt || currentPage.imagePrompt });
    } catch (e) {
      onError("Upscaling failed.");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!onConsumeCredits(COST_VIDEO)) {
      onError("Insufficient credits for cinematic synthesis.");
      return;
    }
    setIsGeneratingVideo(true);
    try {
      const videoUrl = await generateVideo(currentPage.imagePrompt, currentPage.imageUrl);
      updateCurrentPage({ videoUrl });
    } catch (e) {
      onError("Video synthesis failed.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!onConsumeCredits(COST_AUDIO)) {
      onError("Insufficient credits for vocal synthesis.");
      return;
    }
    setIsGeneratingAudio(true);
    try {
      const audioBase64 = await generateSpeech(currentPage.caption);
      updateCurrentPage({ audioUrl: audioBase64 });
    } catch (e) {
      onError("Audio synthesis failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = async (base64: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const decodedData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (e) {
      console.error("Playback failed", e);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>${project.title} - Lumina Studio Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Instrument+Serif:ital@1&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
            .page { width: 100%; height: 100vh; page-break-after: always; display: flex; flex-col: column; align-items: center; justify-content: center; position: relative; padding: 40px; box-sizing: border-box; }
            .title-page { text-align: center; }
            .title-page h1 { font-size: 4rem; margin-bottom: 1rem; font-weight: 800; letter-spacing: -2px; }
            .title-page p { font-size: 1.5rem; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 4px; }
            .content-img { width: 100%; max-height: 60vh; object-fit: contain; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 40px; }
            .caption { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 2rem; text-align: center; max-width: 800px; color: #333; }
            .page-num { position: absolute; bottom: 40px; right: 40px; font-weight: 800; color: #ccc; }
          </style>
        </head>
        <body>
          <div class="page title-page">
            <h1>${project.title}</h1>
            <p>${project.genre} • ${project.style}</p>
          </div>
          ${project.pages.map((p, i) => `
            <div class="page">
              <img src="${p.imageUrl}" class="content-img" />
              <div class="caption">"${p.caption}"</div>
              <div class="page-num">${i + 1}</div>
            </div>
          `).join('')}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Save Notification Toast */}
      <AnimatePresence>
        {showSaveIndicator && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-emerald-500 text-white px-6 py-2 rounded-full shadow-2xl flex items-center space-x-2 font-bold backdrop-blur-md"
          >
            <CheckCircle size={18} />
            <span>Project Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">{project.title}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{project.genre} • {project.pages.length} Narrative Beats</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Visual Undo/Redo Buttons for convenience */}
          <div className="flex items-center space-x-1 mr-4 bg-slate-900 border border-white/5 rounded-xl p-1">
             <button 
               onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }))}
               disabled={undoStack.length === 0}
               className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
               title="Undo (Ctrl+Z)"
             >
               <Undo size={18} />
             </button>
             <button 
               onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true }))}
               disabled={redoStack.length === 0}
               className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
               title="Redo (Ctrl+Shift+Z)"
             >
               <Redo size={18} />
             </button>
          </div>

          <button onClick={handleExportPDF} className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl font-bold flex items-center space-x-2 hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20">
            <Download size={18} />
            <span className="text-sm">Export Studio PDF</span>
          </button>
          <button onClick={onDelete} className="p-2.5 bg-slate-900 border border-white/5 text-red-400 rounded-xl hover:bg-red-500/10 transition-all">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 h-full">
        {/* Main Viewport */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[3/4] md:aspect-[4/5] bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden relative shadow-2xl flex flex-col group">
             <div className="flex-1 relative overflow-hidden bg-slate-950">
               {currentPage.videoUrl ? (
                 <video src={currentPage.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
               ) : (
                 <img 
                    src={currentPage.imageUrl} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isRegenerating || isUpscaling ? 'opacity-30' : 'opacity-100'}`}
                    alt="Current frame" 
                 />
               )}
               
               {(isRegenerating || isUpscaling || isGeneratingVideo) && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                    <Loader2 size={48} className="animate-spin text-cyan-400 mb-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural Synthesizer Active</span>
                 </div>
               )}

               <div className="absolute inset-x-6 top-6 flex justify-between items-start">
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                    Frame {currentPageIndex + 1} / {project.pages.length}
                  </div>
                  <div className="flex space-x-2">
                    {currentPage.audioUrl && (
                      <button 
                        onClick={() => playAudio(currentPage.audioUrl!)}
                        className="w-10 h-10 bg-cyan-500 text-white rounded-xl flex items-center justify-center shadow-lg animate-pulse"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                    )}
                  </div>
               </div>

               <div className="absolute bottom-6 inset-x-6 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    disabled={currentPageIndex === 0}
                    onClick={() => setCurrentPageIndex(prev => prev - 1)}
                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white flex items-center justify-center pointer-events-auto active:scale-90 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    disabled={currentPageIndex === project.pages.length - 1}
                    onClick={() => setCurrentPageIndex(prev => prev + 1)}
                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white flex items-center justify-center pointer-events-auto active:scale-90 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
               </div>
             </div>

             <div className="p-8 h-1/4 flex flex-col items-center justify-center text-center bg-[#0f172a] border-t border-white/5">
                <p className="text-xl md:text-2xl font-serif italic text-slate-200 leading-relaxed max-w-lg">
                  "{currentPage.caption}"
                </p>
             </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
             <ToolAction icon={Sparkles} label="Upscale" cost={COST_UPSCALE} onClick={handleUpscale} loading={isUpscaling} />
             <ToolAction icon={Video} label="Veo Cinema" cost={COST_VIDEO} onClick={handleGenerateVideo} loading={isGeneratingVideo} />
             <ToolAction icon={Volume2} label="Narrate" cost={COST_AUDIO} onClick={handleGenerateAudio} loading={isGeneratingAudio} />
             <ToolAction icon={RefreshCw} label="Re-Gen" cost={300} onClick={regeneratePageImage} loading={isRegenerating} />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
              <Edit size={14} />
              <span>Context Editor</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Visual Core Prompt</label>
                <textarea 
                  className="w-full h-32 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  value={currentPage.imagePrompt}
                  onChange={(e) => updateCurrentPage({ imagePrompt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Narration Text</label>
                <textarea 
                  className="w-full h-32 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  value={currentPage.caption}
                  onChange={(e) => updateCurrentPage({ caption: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Beat Selection</h3>
            <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {project.pages.map((p, i) => (
                 <button 
                  key={p.id}
                  onClick={() => setCurrentPageIndex(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${currentPageIndex === i ? 'border-cyan-500 scale-95 ring-4 ring-cyan-500/20' : 'border-white/5 opacity-50'}`}
                 >
                   <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                 </button>
               ))}
            </div>
            
            <div className="text-center pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-medium">
                    Shortcuts: <span className="text-slate-300">Arrows</span> to Navigate • <span className="text-slate-300">Ctrl+S</span> to Save • <span className="text-slate-300">Ctrl+Z</span> to Undo
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolAction = ({ icon: Icon, label, cost, onClick, loading }: any) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className="flex flex-col items-center justify-center space-y-2 p-4 rounded-[2rem] bg-slate-900 border border-white/5 hover:bg-slate-800 transition-all active:scale-95 group relative"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${loading ? 'bg-cyan-500 animate-spin' : 'bg-slate-950 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10'}`}>
       {loading ? <RefreshCw size={20} /> : <Icon size={20} />}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    <div className="flex items-center space-x-1 text-yellow-500/80">
      <Zap size={8} fill="currentColor" />
      <span className="text-[8px] font-black tracking-tighter">{cost}</span>
    </div>
  </button>
);

export default Editor;