
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCharacterForge, generateImage } from '../geminiService';
import { Scissors, Zap, Loader2, Sparkles, User, Download, Send, RefreshCcw } from 'lucide-react';
import { ArtStyle, Asset } from '../types';

interface CharacterForgeProps {
  credits: number;
  onConsumeCredits: (amount: number) => boolean;
  onError: (msg: string) => void;
  onSaveAsset: (a: Asset) => void;
}

const CharacterForge: React.FC<CharacterForgeProps> = ({ credits, onConsumeCredits, onError, onSaveAsset }) => {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleForge = async () => {
    if (!desc) return;
    if (!onConsumeCredits(600)) {
      onError("Insufficient credits.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateCharacterForge(desc);
      setCharacter(data);
      const imageUrl = await generateImage(data.image_prompt, ArtStyle.REALISTIC);
      setImage(imageUrl);
      onSaveAsset({
        id: Date.now().toString(),
        type: 'image',
        url: imageUrl,
        prompt: `Character: ${data.name}`,
        createdAt: Date.now()
      });
    } catch (e) {
      onError("Character synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-5">
      <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
        <div className="flex items-center space-x-4">
           <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400">
              <Scissors size={28} />
           </div>
           <div>
              <h2 className="text-2xl font-black italic tracking-tighter">Character Forge</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Neural persona designer</p>
           </div>
        </div>

        <textarea 
          className="w-full h-32 bg-slate-950 border border-white/5 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          placeholder="Describe your character (e.g. A weary time traveler from a rainy futuristic Tokyo...)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button 
          onClick={handleForge}
          disabled={loading || !desc}
          className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          <span>{loading ? 'Synthesizing Persona...' : 'Forge Character'}</span>
          {!loading && <span className="ml-2 pl-4 border-l border-white/20 text-sm opacity-60 font-bold">600 CR</span>}
        </button>
      </div>

      <AnimatePresence>
        {character && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid gap-6">
            <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden p-8 flex flex-col md:flex-row gap-8">
               <div className="w-full md:w-64 aspect-square rounded-[2rem] overflow-hidden bg-slate-950 border border-white/5 shrink-0">
                  {image ? <img src={image} className="w-full h-full object-cover" /> : <Loader2 className="animate-spin m-auto mt-20" />}
               </div>
               <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                     <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">{character.name}</h3>
                     <button className="p-3 bg-white/5 rounded-xl text-slate-400"><Download size={18} /></button>
                  </div>
                  <div className="space-y-4">
                     <p className="text-slate-400 text-sm italic">"{character.backstory}"</p>
                     <div className="flex flex-wrap gap-2">
                        {character.physical_traits?.map((t: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/20">{t}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterForge;
