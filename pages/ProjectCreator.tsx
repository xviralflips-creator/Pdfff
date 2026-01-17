
import React, { useState } from 'react';
import { Project, ProjectGenre, ArtStyle, StoryPage } from '../types';
import { generateStoryOutline, generateImage } from '../geminiService';
import { Zap, Loader2, Sparkles, Wand2 } from 'lucide-react';

interface ProjectCreatorProps {
  onCreate: (p: Project) => void;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    theme: '',
    genre: ProjectGenre.KIDS,
    style: ArtStyle.COMIC,
    pageCount: 5
  });
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      setLoadingStatus('Weaving your story with AI...');
      const outline = await generateStoryOutline(formData.theme, formData.genre, formData.pageCount);
      
      const newPages: StoryPage[] = [];
      
      for (let i = 0; i < outline.pages.length; i++) {
        setLoadingStatus(`Painting scene ${i + 1} of ${outline.pages.length}...`);
        const pageData = outline.pages[i];
        const imageUrl = await generateImage(pageData.imagePrompt, formData.style as ArtStyle);
        
        newPages.push({
          id: Math.random().toString(36).substr(2, 9),
          imagePrompt: pageData.imagePrompt,
          caption: pageData.caption,
          imageUrl: imageUrl
        });
      }

      const newProject: Project = {
        id: Date.now().toString(),
        title: outline.title || formData.theme,
        genre: formData.genre,
        style: formData.style,
        pages: newPages,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      onCreate(newProject);
    } catch (error) {
      console.error(error);
      alert('Generation failed. Please check your API Key or try again.');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Project Wizard</h2>
          <p className="text-blue-100">Tell us your idea, and Nano Banana will do the rest.</p>
        </div>

        <div className="p-10 space-y-8">
          {loading ? (
            <div className="text-center py-20 space-y-6">
              <div className="flex justify-center">
                <Loader2 size={64} className="text-blue-600 animate-spin" />
              </div>
              <p className="text-xl font-bold text-slate-700">{loadingStatus}</p>
              <div className="max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full animate-progress-indeterminate"></div>
              </div>
              <p className="text-slate-400 text-sm">This may take 1-2 minutes depending on page count.</p>
            </div>
          ) : (
            <>
              {/* Theme Input */}
              <div className="space-y-3">
                <label className="text-lg font-bold text-slate-800">What's the story about?</label>
                <textarea 
                  className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-lg"
                  placeholder="Example: A young robot who discovers a magic garden in a futuristic city..."
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>

              {/* Genre & Style */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Genre</label>
                  <select 
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value as ProjectGenre })}
                  >
                    {Object.values(ProjectGenre).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Art Style</label>
                  <select 
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value as ArtStyle })}
                  >
                    {Object.values(ArtStyle).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Page Count */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                  <span>Number of Pages</span>
                  <span className="text-blue-600">{formData.pageCount} Pages</span>
                </label>
                <input 
                  type="range" min="3" max="10" 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) })}
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!formData.theme}
                className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all ${
                  formData.theme ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Wand2 size={24} />
                <span>Generate Image Story</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;
