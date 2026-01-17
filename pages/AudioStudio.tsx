
import React, { useState } from 'react';
import { Project } from '../types';
import { generateSpeech, decodeBase64, decodeAudioData } from '../geminiService';
import { Volume2, Play, Pause, Loader2, Music, Check, Headphones } from 'lucide-react';

interface AudioStudioProps {
  projects: Project[];
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ projects, onUpdate }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState<number | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleTTS = async (idx: number) => {
    if (!selectedProject) return;
    setLoadingPage(idx);
    try {
      const page = selectedProject.pages[idx];
      const base64Audio = await generateSpeech(page.caption);
      const newPages = [...selectedProject.pages];
      newPages[idx] = { ...newPages[idx], audioUrl: base64Audio };
      onUpdate(selectedProject.id, { pages: newPages });
    } catch (e) {
      alert("TTS failed.");
    } finally {
      setLoadingPage(null);
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-6 mb-12">
           <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <Headphones size={40} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white">Narrator Suite</h2>
              <p className="text-slate-400 text-lg">Synthesize professional voiceovers for your stories.</p>
           </div>
        </div>

        <div className="space-y-4 mb-10">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Project</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {selectedProject ? (
          <div className="space-y-6">
            {selectedProject.pages.map((page, idx) => (
              <div key={page.id} className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 flex items-center space-x-6 hover:bg-slate-800 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center font-black text-white">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium line-clamp-2">{page.caption}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {page.audioUrl && (
                    <button 
                      onClick={() => playAudio(page.audioUrl!)}
                      className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleTTS(idx)}
                    disabled={loadingPage !== null}
                    className={`px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all ${
                      page.audioUrl 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    {loadingPage === idx ? <Loader2 size={18} className="animate-spin" /> : page.audioUrl ? <Check size={18} /> : <Volume2 size={18} />}
                    <span>{page.audioUrl ? 'Regenerate' : 'Synthesize'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
            <Music size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold">Choose a story to begin narration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioStudio;
