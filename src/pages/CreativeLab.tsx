import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, ArtStyle } from '../types';
import { generateImage, generateVideo, upscalePrompt } from '../geminiService';
import { 
  Zap, Loader2, Sparkles, Wand2, ImageIcon, Video, 
  RefreshCcw, Download, Trash2, Send, LayoutGrid, 
  History, Info, Key, Film, Play, Image as ImageLucide
} from 'lucide-react';

// Use any to bypass Framer Motion property type errors in this environment
const MotionDiv = motion.div as any;

interface CreativeLabProps {
  assets: Asset[];
  onSaveAsset: (a: Asset) => void;
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
}

const CreativeLab: React.FC<CreativeLabProps> = ({ assets, onSaveAsset, credits, onConsumeCredits, onError }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'gallery'>('image');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.REALISTIC);
  const [loading, setLoading] = useState(false);
  const [upscaling, setUpscaling] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleMagicRefine = async () => {
    if (!prompt) return;
    setUpscaling(true);
    try {
      const refined = await upscalePrompt(prompt);
      setPrompt(refined || prompt);
    } catch (e) {
      onError("Failed to refine prompt.");
    } finally {
      setUpscaling(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    const cost = activeTab === 'image' ? 300 : 1200;
    
    if (credits < cost) {
      onError("Insufficient credits.");
      return;
    }

    setLoading(true);
    try {
      let url = '';
      if (activeTab === 'image') {
        url = await generateImage(prompt, style);
      } else if (activeTab === 'video') {
        // Include the art style in the video generation prompt
        const styledPrompt = `Cinematic Style: ${style}. ${prompt}`;
        url = await generateVideo(styledPrompt);
      }

      setResultUrl(url);
      onConsumeCredits(cost);
      onSaveAsset({
        id: Date.now().toString(),
        type: activeTab as 'image' | 'video',
        url: url,
        prompt: prompt,
        createdAt: Date.now()
      });
    } catch (e: any) {
      onError(e.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: 'image' | 'video' | 'gallery') => {
    setActiveTab(tab);
    setResultUrl(null);
    setPrompt('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-800 w-fit mx-auto">
        <button 
          onClick={() => switchTab('image')}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${activeTab === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <ImageLucide size={18} />
          <span>Image Gen</span>
        </button>
        <button 
          onClick={() => switchTab('video')}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${activeTab === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <Film size={18} />
          <span>Video Gen</span>
        </button>
        <button 
          onClick={() => switchTab('gallery')}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <History size={18} />
          <span>My Assets</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab !== 'gallery' ? (
          /* Fix motion.div error */
          <MotionDiv 
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-2 gap-10"
          >
            {/* Input Side */}
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-10 space-y-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Visual Prompt</label>
                  <button 
                    onClick={handleMagicRefine}
                    disabled={upscaling || !prompt}
                    className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center space-x-1 uppercase tracking-widest disabled:opacity-30"
                  >
                    {upscaling ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>Magic Refine</span>
                  </button>
                </div>
                <textarea 
                  className="w-full h-48 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-lg resize-none"
                  placeholder={activeTab === 'image' ? "Describe your image in vivid detail..." : "Describe a cinematic camera movement or action..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {(activeTab === 'image' || activeTab === 'video') && (
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Artistic Aesthetic</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(ArtStyle).map(s => (
                      <button 
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${style === s ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'}`}
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={24} fill="currentColor" />
                    <span>Generate {activeTab === 'image' ? 'Masterpiece' : 'Cinema Clip'}</span>
                    <span className="ml-4 pl-4 border-l border-white/20 text-sm opacity-60">
                      {activeTab === 'image' ? 300 : 1200} CR
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Result Side */}
            <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-12 min-h-[500px]">
               <AnimatePresence mode="wait">
                  {resultUrl ? (
                    /* Fix motion.div error */
                    <MotionDiv 
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col space-y-6"
                    >
                      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group relative">
                        {activeTab === 'image' ? (
                          <img src={resultUrl} className="w-full h-full object-cover" alt="Generated" />
                        ) : (
                          <video src={resultUrl} controls autoPlay loop className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <a href={resultUrl} download={`nano-${Date.now()}`} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-blue-600 transition-colors">
                              <Download size={20} />
                           </a>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                         <p className="text-slate-400 text-sm font-medium italic">"{prompt}"</p>
                      </div>
                    </MotionDiv>
                  ) : (
                    /* Fix motion.div error */
                    <MotionDiv key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 text-slate-800">
                       <div className="w-32 h-32 bg-slate-950 rounded-[3rem] flex items-center justify-center mx-auto border border-slate-800/50 shadow-inner">
                          {activeTab === 'image' ? <ImageLucide size={64} className="opacity-10" /> : <Film size={64} className="opacity-10" />}
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black italic tracking-tighter text-slate-600 uppercase">Awaiting Neural Uplink</h3>
                          <p className="text-slate-700 text-sm font-bold uppercase tracking-widest">GEMINI NANO BANANA ENGINE</p>
                       </div>
                    </MotionDiv>
                  )}
               </AnimatePresence>
            </div>
          </MotionDiv>
        ) : (
          /* Fix motion.div error */
          <MotionDiv 
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {assets.length > 0 ? assets.map(asset => (
              <div key={asset.id} className="group bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl">
                 <div className="aspect-square relative overflow-hidden">
                    {asset.type === 'image' ? (
                      <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <video src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" muted onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                       <p className="text-xs text-white font-medium line-clamp-2 italic mb-4">"{asset.prompt}"</p>
                       <div className="flex items-center space-x-2">
                          <button className="flex-1 py-2 bg-blue-600 rounded-xl text-white text-xs font-bold hover:bg-blue-500">View</button>
                          <a href={asset.url} download className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700"><Download size={14} /></a>
                       </div>
                    </div>
                    {asset.type === 'video' && (
                      <div className="absolute top-4 left-4 p-2 bg-rose-600 rounded-xl shadow-lg">
                        <Video size={14} className="text-white" />
                      </div>
                    )}
                 </div>
              </div>
            )) : (
              <div className="col-span-full py-40 text-center">
                 <History size={64} className="mx-auto text-slate-800 mb-6" />
                 <p className="text-slate-600 font-bold text-xl">No assets synthesized yet.</p>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeLab;