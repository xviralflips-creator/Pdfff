
import React from 'react';
import { Project } from '../types';
import { Plus, Book, FileText, TrendingUp, Clock, ChevronRight, Video, Zap, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface DashboardProps {
  projects: Project[];
  onNew: () => void;
  onEdit: (p: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onNew, onEdit }) => {
  const stats = [
    { label: "Assets", value: projects.length, icon: Layers, color: "text-cyan-500" },
    { label: "Cinema", value: projects.reduce((acc, p) => acc + p.pages.filter(pg => !!pg.videoUrl).length, 0), icon: Video, color: "text-emerald-500" }
  ];

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="px-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Welcome back, Creator</p>
        <h2 className="text-4xl font-black italic text-white tracking-tighter">My Studio</h2>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between h-32">
            <stat.icon className={stat.color} size={20} />
            <div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <button 
        onClick={onNew}
        className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-[2.5rem] text-left text-white shadow-2xl group active:scale-95 transition-all"
      >
        <div className="relative z-10 space-y-2">
          <h3 className="text-3xl font-black italic tracking-tighter">Initiate Story</h3>
          <p className="text-sm font-medium text-cyan-100 opacity-80 max-w-[200px]">Launch a new multi-page narrative project.</p>
        </div>
        <Plus size={100} className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Recent Syntheses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-white italic tracking-tight">Recent Archives</h3>
          <ChevronRight size={18} className="text-slate-600" />
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => onEdit(project)}
                className="bg-slate-900 border border-white/5 p-4 rounded-[1.5rem] flex items-center space-x-4 active:bg-slate-800 transition-colors"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={project.pages[0]?.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{project.title}</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{project.pages.length} Beats • {project.genre}</p>
                </div>
                <ChevronRight size={16} className="text-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <Sparkles size={40} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-bold text-sm">No syntheses found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
