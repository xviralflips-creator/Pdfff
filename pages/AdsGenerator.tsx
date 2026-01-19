
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAdCopy, generateImage } from '../geminiService';
import { Megaphone, Zap, Loader2, Rocket, Share2, Download, Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { ArtStyle, Asset } from '../types';

interface AdsGeneratorProps {
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
  onSaveAsset: (a: Asset) => void;
}

const AdsGenerator: React.FC<AdsGeneratorProps> = ({ credits, onConsumeCredits, onError, onSaveAsset }) => {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [adData, setAdData] = useState<any>(null);
  const [adImage, setAdImage] = useState<string | null>(null);

  const handleGenerateAd = async () => {
    if (!product || !audience) return;
    if (!onConsumeCredits(800)) {
      onError("Insufficient credits.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateAdCopy(product, audience);
      setAdData(data);
      const imageUrl = await generateImage(data.visual_prompt || data.background_prompt, ArtStyle.UGC_AD);
      setAdImage(imageUrl);
      
      onSaveAsset({
        id: Date.now().toString(),
        type: 'image',
        url: imageUrl,
        prompt: `Ad: ${product} for ${audience}`,
        createdAt: Date.now()
      });
    } catch (e) {
      onError("Ad synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-5">
      <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
        <div className="flex items-center space-x-4 mb-4">
           <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400">
              <Megaphone size={28} />
           </div>
           <div>
              <h2 className="text-2xl font-black italic tracking-tighter">UGC Ad Forge</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Viral marketing engine</p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Product / Service</label>
            <input 
              className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="e.g. Eco-friendly sneakers"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Target Audience</label>
            <input 
              className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="e.g. Gen-Z hikers in Oregon"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleGenerateAd}
          disabled={loading || !product}
          className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/20'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
          <span>{loading ? 'Synthesizing Ad...' : 'Forge Campaign'}</span>
          {!loading && <span className="ml-2 pl-4 border-l border-white/20 text-sm opacity-60 font-bold">800 CR</span>}
        </button>
      </div>

      <AnimatePresence>
        {adData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
               <div className="aspect-[4/5] relative bg-slate-200">
                  {adImage ? (
                    <img src={adImage} className="w-full h-full object-cover" alt="Ad Visual" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                  )}
                  {/* Ad Overlay Mockup */}
                  <div className="absolute inset-x-6 bottom-10 space-y-4">
                     <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-white">
                        <h4 className="font-black text-xl mb-2">"{adData.hook}"</h4>
                        <p className="text-sm opacity-90 leading-relaxed line-clamp-3">{adData.body}</p>
                     </div>
                     <button className="w-full py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl">
                        {adData.cta || 'SHOP NOW'}
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
               <h3 className="font-black italic text-xl">Campaign Breakdown</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">The Hook</span>
                     <p className="text-slate-300 font-bold">{adData.hook}</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">The Body</span>
                     <p className="text-slate-300 text-sm leading-relaxed">{adData.body}</p>
                  </div>
               </div>
               <div className="flex space-x-3 pt-4">
                  <button className="flex-1 py-3 bg-slate-800 rounded-xl font-bold flex items-center justify-center space-x-2 text-slate-300">
                     <Share2 size={16} />
                     <span>Share</span>
                  </button>
                  <button className="flex-1 py-3 bg-slate-800 rounded-xl font-bold flex items-center justify-center space-x-2 text-slate-300">
                     <Download size={16} />
                     <span>Export</span>
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdsGenerator;
