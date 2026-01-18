
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Project, ProjectGenre, ArtStyle, StoryPage } from '../types';
import { generateStoryOutline, generateImage } from '../geminiService';
import { Zap, Loader2, Sparkles, Wand2, ChevronRight, Layout, BookOpen, Film, Plus } from 'lucide-react';

// Use any to bypass Framer Motion property type errors in this environment
const MotionDiv = motion.div as any;

interface ProjectCreatorProps {
  onCreate: (p: Project) => void;
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
}

const TEMPLATES = [
  { id: 't1', name: 'Children\'s Picture Book', genre: ProjectGenre.KIDS, style: ArtStyle.COMIC, pages: 8, icon: BookOpen, cost: 2400 },
  { id: 't2', name: 'Cyberpunk Cinematic', genre: ProjectGenre.SCIFI, style: ArtStyle.REALISTIC, pages: 5, icon: Film, cost: 1500 },
  { id: 't3', name: 'Dark Fantasy Tome', genre: ProjectGenre.FANTASY, style: ArtStyle.WATERCOLOR, pages: 6, icon: Sparkles, cost: 1800 }
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
      onError("Insufficient credits. Please top up your balance.");
      return;
    }

    setLoading(true);
    try {
      setLoadingStatus('Architecting narrative structure...');
      const outline = await generateStoryOutline(formData.theme, formData.genre, formData.pageCount);
      
      const newPages: StoryPage[] = [];
      onConsumeCredits(cost);
      
      for (let i = 0; i < outline.pages.length; i++) {
        setLoadingStatus(`Rendering frame ${i + 1} of ${outline.pages.length}...`);
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
          // Placeholder if one image fails to keep project intact
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
      onError("Neural generation failed. Please try a different prompt or genre.");
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white relative">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-3 italic">Creator Wizard</h2>
            <p className="text-blue-100 text-lg opacity-80">Synthesize multi-page narratives with Gemini 3 Pro.</p>
          </div>
          <Zap size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
        </div>

        <div className="p-12">
          {loading ? (
            /* Fix motion.div error */
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <Wand2 className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={32} />
              </div>
              <div className="space-y-4">
                <p className="text-2xl font-black text-white">{loadingStatus}</p>
                <div className="max-w-md mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full animate-progress-indeterminate shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                </div>
                <p className="text-slate-500 text-sm font-medium tracking-wide">GEMINI NANO-BANANA ENGINE • ACTIVE</p>
              </div>
            </MotionDiv>
          ) : (
            <div className="space-y-10">
              {step === 1 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-bold text-slate-300 flex items-center space-x-2">
                    <Layout size={20} className="text-blue-500" />
                    <span>Select a Starting Template</span>
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {TEMPLATES.map((t) => (
                      <button 
                        key={t.id}
                        onClick={() => handleApplyTemplate(t)}
                        className="p-8 rounded-[2rem] bg-slate-800/50 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <t.icon size={24} className="text-blue-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2">{t.name}</h4>
                        <div className="flex items-center space-x-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span>{t.pages} Pages</span>
                          <span className="text-yellow-500 flex items-center">
                            <Zap size={10} className="mr-1" fill="currentColor" />
                            {t.cost}
                          </span>
                        </div>
                      </button>
                    ))}
                    <button 
                      onClick={() => setStep(2)}
                      className="p-8 rounded-[2rem] border-2 border-dashed border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center justify-center space-y-4"
                    >
                      <Plus size={32} className="text-slate-600" />
                      <span className="font-bold text-slate-500">Custom Project</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  {/* Theme Input */}
                  <div className="space-y-4">
                    <label className="text-xl font-bold text-white">Project Objective</label>
                    <textarea 
                      className="w-full h-40 p-6 rounded-3xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 transition-all outline-none text-lg text-slate-200"
                      placeholder="e.g., 'An epic journey across the rings of Saturn where a lone pilot discovers an ancient gateway...'"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Genre</label>
                      <select 
                        className="w-full p-5 rounded-2xl bg-slate-800 border border-slate-700 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value as ProjectGenre })}
                      >
                        {Object.values(ProjectGenre).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Artistic Aesthetic</label>
                      <select 
                        className="w-full p-5 rounded-2xl bg-slate-800 border border-slate-700 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value as ArtStyle })}
                      >
                        {Object.values(ArtStyle).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Narrative Depth</label>
                      <span className="text-sm font-bold text-blue-400">{formData.pageCount} Pages</span>
                    </div>
                    <input 
                      type="range" min="3" max="12" 
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={formData.pageCount}
                      onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-800">
                      Back to Templates
                    </button>
                    <button 
                      onClick={handleGenerate}
                      disabled={!formData.theme}
                      className={`px-12 py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 transition-all ${
                        formData.theme 
                          ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Wand2 size={24} />
                      <span>Synthesize Story</span>
                      <span className="ml-4 pl-4 border-l border-white/20 text-sm font-bold opacity-80 flex items-center">
                        <Zap size={14} className="mr-1" fill="currentColor" />
                        {calculateCost()}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;
