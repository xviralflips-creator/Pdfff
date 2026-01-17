
import React from 'react';
import { Project } from '../types';
import { Plus, Book, FileText, TrendingUp, Clock, ChevronRight } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onNew: () => void;
  onEdit: (p: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onNew, onEdit }) => {
  const stats = [
    { label: "Total Projects", value: projects.length, icon: Book, color: "blue" },
    { label: "AI Images Used", value: projects.reduce((acc, p) => acc + p.pages.length, 0), icon: FileText, color: "indigo" },
    { label: "Credits Burned", value: "3.2k", icon: TrendingUp, color: "emerald" },
    { label: "Storage Used", value: "142MB", icon: Clock, color: "amber" }
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Call to Action Card */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200">
          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-bold mb-4">Start your next <br /> masterpiece.</h2>
            <p className="text-blue-100 text-lg mb-8">Generate an entire story book in minutes with AI magic. Covers, text, and images included.</p>
            <button 
              onClick={onNew}
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center space-x-2 group"
            >
              <span>Create New Project</span>
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
          <Book size={300} className="absolute -right-20 -bottom-20 text-white/10 rotate-12" />
        </div>

        {/* Quick Tools */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Quick Tools</h3>
          <div className="space-y-4">
            {[
              "PDF Compressor",
              "Image to PDF",
              "PDF Merger",
              "Extract Images"
            ].map((tool, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                <span className="font-semibold text-slate-700">{tool}</span>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Recent Projects</h3>
          <button className="text-blue-600 font-bold hover:underline">View All</button>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <div key={project.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => onEdit(project)}>
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={project.pages[0]?.imageUrl || "https://picsum.photos/seed/placeholder/400/300"} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                    {project.genre}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold mb-1 truncate">{project.title}</h4>
                  <p className="text-slate-500 text-sm mb-4">{project.pages.length} Pages • {project.style}</p>
                  <div className="flex items-center text-blue-600 font-bold text-sm">
                    <span>Continue Editing</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Book size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No projects yet. Create your first AI story!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
