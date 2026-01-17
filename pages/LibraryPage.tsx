
import React, { useState } from 'react';
import { Project } from '../types';
import { Search, Grid, List, MoreVertical, Trash2, Edit2, Share2 } from 'lucide-react';

interface LibraryPageProps {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ projects, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}>
          {filtered.map(project => (
            viewMode === 'grid' ? (
              <div key={project.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                <div className="h-56 relative overflow-hidden">
                  <img src={project.pages[0]?.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-300">{project.genre}</p>
                    <h3 className="text-xl font-bold truncate">{project.title}</h3>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="text-slate-500 text-sm">
                    {project.pages.length} Pages • {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(project)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDelete(project.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={project.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-4 group hover:border-blue-300 transition-colors">
                <img src={project.pages[0]?.imageUrl} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{project.title}</h3>
                  <p className="text-slate-500 text-sm">{project.genre} • {project.pages.length} Pages</p>
                </div>
                <div className="flex items-center space-x-4 px-4">
                   <button onClick={() => onEdit(project)} className="font-bold text-blue-600 hover:underline">Edit</button>
                   <button onClick={() => onDelete(project.id)} className="font-bold text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-40">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No projects found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or create a new story.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
