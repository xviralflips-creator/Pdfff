
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Project, ProjectGenre, ArtStyle, StoryPage } from '../types';
import { generateStoryOutline, generateImage } from '../geminiService';
import { Zap, Loader2, Sparkles, Wand2, ChevronRight, Layout, BookOpen, Film, Plus, Rocket, Heart, Ghost } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ProjectCreatorProps {
  onCreate: (p: Project) => void;
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
}

const TEMPLATES = [
  { id: 't1', name: 'Kids Fable', genre: ProjectGenre.KIDS, style: ArtStyle.COMIC, pages: 6, icon: BookOpen, cost: 1800 },
  { id: 't2', name: 'Sci-Fi Epic', genre: ProjectGenre.SCIFI, style: ArtStyle.REALISTIC, pages: 8, icon: Rocket, cost: 2400 },
  { id: 't3', name: 'Dark Grimoire', genre: ProjectGenre.HORROR, style: ArtStyle.WATERCOLOR, pages: 5, icon: Ghost, cost: 1500 },
  { id: 't4', name: 'UGC Campaign', genre: ProjectGenre.MARKETING, style: ArtStyle.UGC_AD, pages: 4, icon: Zap, cost: 1200 },
  { id: 't5', name: 'Fantasy Lore', genre: ProjectGenre.FANTASY, style: ArtStyle.REALISTIC, pages: 10, icon: Heart, cost: 3000 }
];

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onCreate, credits, onConsumeCredits, onError }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    theme: '',
    genre: ProjectGenre.KIDS,
    style: ArtStyle.COMIC,
    pageCount: 5
  });
  const [loadingStatus, setLoadingStatus] = useState('');

  const calculateCost = () => formData.pageCount * 300;

  const handleApplyTemplate = (t: typeof TEMPLATES[0]) => {
    setFormData({
      ...formData,
      genre: t.genre,
      style: t.style,
      pageCount: t.pages
    });
    setStep(2);
  };

  const handleGenerate = async () => {
    const cost = calculateCost();
    if (credits < cost) {
      onError("Insufficient credits. Purchase a pack to continue.");
      return;
    }

    setLoading(true);
    try {
      setLoadingStatus('Architecting narrative structure...');
      const outline = await generateStoryOutline(formData.theme, formData.genre, formData.pageCount);
      
      const newPages: StoryPage[] = [];
      onConsumeCredits(cost);
      
      for (let i = 0; i < outline.pages.length; i++) {
        setLoadingStatus(`Synthesizing frame ${i + 1} of ${outline.pages.length}...`);
        const pageData = outline.pages[i];
        try {
          const imageUrl = await generateImage(pageData.imagePrompt, formData.style as ArtStyle);
          newPages.push({
            id: Math.random().toString(36).substr(2, 9),
            imagePrompt: pageData.imagePrompt,
            caption: pageData.caption,
            imageUrl: imageUrl
          });
        } catch (imgErr) {
          console.error("Image gen failed for frame", i);
          newPages.push({
            id: Math.random().toString(36).substr(2, 9),
            imagePrompt: pageData.imagePrompt,
            caption: pageData.caption,
            imageUrl: "https://picsum.photos/seed/failed/800"
          });
        }
      }

      const newProject: Project = {
        id: Date.now().toString(),
        title: outline.title || formData.theme,
        genre: formData.genre,
        style: formData.style,
        type: 'story',
        pages: newPages,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      onCreate(newProject);
    } catch (error) {
      onError("Lumina engine failed to bridge current reality.");
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
      <div className="px-2">
        <h2 className="text-4xl font-black italic tracking-tighter text-white">Synthesizer Wizard</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Harnessing Gemini 3.1 Pro Engine</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 bg-slate-900/50 rounded-[3rem] border border-white/5 p-10">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white italic">{loadingStatus}</h3>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
              <motion.div 
                className="h-full bg-cyan-500" 
                initial={{ width: 0 }} 
                animate={{ width: "100%" }} 
                transition={{ duration: 30 }} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {step === 1 ? (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Select a Narrative Matrix</h3>
              <div className="grid grid-cols-1 gap-4">
                {TEMPLATES.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => handleApplyTemplate(t)}
                    className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-between group active:scale-95 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <t.icon size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-white text-lg leading-tight">{t.name}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.pages} BEATS • {t.style}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-yellow-500">
                      <Zap size={14} fill="currentColor" />
                      <span className="font-black text-sm">{t.cost}</span>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => setStep(2)}
                  className="p-6 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center space-y-2 text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                >
                  <Plus size={32} />
                  <span className="font-black text-xs uppercase tracking-widest">Custom Matrix</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Core Objective</label>
                <textarea 
                  className="w-full h-40 bg-slate-950 border border-white/5 rounded-[2.5rem] p-6 text-lg font-medium text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder="Describe the story, character, or marketing campaign core..."
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Genre</label>
                    <select 
                      className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl font-bold text-white outline-none"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value as ProjectGenre })}
                    >
                      {Object.values(ProjectGenre).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Aesthetic</label>
                    <select 
                      className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl font-bold text-white outline-none"
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value as ArtStyle })}
                    >
                      {Object.values(ArtStyle).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Narrative Depth</label>
                  <span className="text-xs font-black text-cyan-400">{formData.pageCount} Pages</span>
                </div>
                <input 
                  type="range" min="3" max="15" 
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) })}
                />
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-xs font-black text-slate-500 uppercase tracking-widest">Back</button>
                <button 
                  onClick={handleGenerate}
                  disabled={!formData.theme}
                  className={`px-12 py-5 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 transition-all ${
                    formData.theme 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-xl shadow-cyan-600/20' 
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Wand2 size={24} />
                  <span>Synthesize</span>
                  <div className="ml-4 pl-4 border-l border-white/20 flex items-center space-x-1 text-yellow-400">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-sm">{calculateCost()}</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCreator;
