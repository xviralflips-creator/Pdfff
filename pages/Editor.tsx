
import React, { useState } from 'react';
import { Project, StoryPage, ArtStyle } from '../types';
import { generateImage } from '../geminiService';
import { Save, Download, Trash2, Edit, RefreshCw, ChevronLeft, ChevronRight, Type, ImageIcon, Layout, Eye } from 'lucide-react';

// Use a simple client-side PDF lib. We'll simulate the download for this demo environment.
const handleExportPDF = (project: Project) => {
  alert(`Exporting "${project.title}" as PDF... In a production environment, this would use jsPDF to bundle the images and text into a high-res PDF.`);
};

interface EditorProps {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: () => void;
}

const Editor: React.FC<EditorProps> = ({ project, onUpdate, onDelete }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const currentPage = project.pages[currentPageIndex];

  const updateCurrentPage = (updates: Partial<StoryPage>) => {
    const newPages = [...project.pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], ...updates };
    onUpdate(project.id, { pages: newPages });
  };

  const regeneratePageImage = async () => {
    setIsRegenerating(true);
    try {
      const newUrl = await generateImage(currentPage.imagePrompt, project.style as ArtStyle);
      updateCurrentPage({ imageUrl: newUrl });
    } catch (e) {
      alert("Failed to regenerate image.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-in fade-in duration-300">
      {/* Sidebar: Navigation & Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Project Pages</h3>
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {project.pages.map((page, idx) => (
              <button 
                key={page.id} 
                onClick={() => setCurrentPageIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  currentPageIndex === idx ? 'border-blue-500 ring-2 ring-blue-100 scale-95' : 'border-slate-100 grayscale hover:grayscale-0'
                }`}
              >
                <img src={page.imageUrl} alt={`Page ${idx+1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => onDelete()}
              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Project"
            >
              <Trash2 size={20} />
            </button>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExportPDF(project)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Download size={18} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Page Editor</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Image Prompt</label>
              <textarea 
                className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                rows={3}
                value={currentPage.imagePrompt}
                onChange={(e) => updateCurrentPage({ imagePrompt: e.target.value })}
              />
              <button 
                onClick={regeneratePageImage}
                disabled={isRegenerating}
                className="w-full mt-2 flex items-center justify-center space-x-2 p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-all"
              >
                {isRegenerating ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                <span>Regenerate Image</span>
              </button>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Caption Text</label>
              <textarea 
                className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                rows={4}
                value={currentPage.caption}
                onChange={(e) => updateCurrentPage({ caption: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-3 flex flex-col h-full space-y-6">
        <div className="flex-1 bg-slate-200 rounded-[3rem] p-12 flex items-center justify-center relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-grid-slate-300/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          
          <div className="relative bg-white w-full max-w-[600px] aspect-[3/4] shadow-2xl rounded-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Page Design Container */}
            <div className="flex-1 relative overflow-hidden bg-slate-100">
              <img 
                src={currentPage.imageUrl} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}
                alt="Main"
              />
              {isRegenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <Loader size={48} />
                </div>
              )}
            </div>
            
            <div className="p-8 h-1/3 flex items-center justify-center text-center">
              <p className="text-xl font-serif leading-relaxed text-slate-800 italic">
                {currentPage.caption}
              </p>
            </div>

            {/* Pagination badge */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
              PAGE {currentPageIndex + 1} / {project.pages.length}
            </div>
          </div>

          {/* Navigation Controls on Canvas */}
          <button 
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex(prev => prev - 1)}
            className="absolute left-4 p-4 rounded-full bg-white shadow-lg text-slate-600 hover:text-blue-600 disabled:opacity-20 transition-all transform active:scale-90"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            disabled={currentPageIndex === project.pages.length - 1}
            onClick={() => setCurrentPageIndex(prev => prev + 1)}
            className="absolute right-4 p-4 rounded-full bg-white shadow-lg text-slate-600 hover:text-blue-600 disabled:opacity-20 transition-all transform active:scale-90"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Editor Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center space-x-8">
           <ToolbarItem icon={Type} label="Text" />
           <ToolbarItem icon={ImageIcon} label="Media" />
           <ToolbarItem icon={Layout} label="Layout" />
           <ToolbarItem icon={Eye} label="Preview" />
        </div>
      </div>
    </div>
  );
};

const ToolbarItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center space-y-1 text-slate-400 hover:text-blue-600 transition-colors">
    <Icon size={24} />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const Loader = ({ size }: { size: number }) => (
  <RefreshCw size={size} className="animate-spin text-blue-600" />
);

export default Editor;
