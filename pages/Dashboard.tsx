
import React from 'react';
import { Project } from '../types';
import { Plus, Book, FileText, TrendingUp, Clock, ChevronRight, Video, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

// Use any to bypass Framer Motion property type errors in this environment
const MotionDiv = motion.div as any;

interface DashboardProps {
  projects: Project[];
  onNew: () => void;
  onEdit: (p: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onNew, onEdit }) => {
  const stats = [
    { label: "Total Projects", value: projects.length, icon: Layers, color: "blue" },
    { label: "AI Graphics", value: projects.reduce((acc, p) => acc + p.pages.length, 0), icon: FileText, color: "indigo" },
    { label: "Cinema Clips", value: projects.reduce((acc, p) => acc + p.pages.filter(pg => !!pg.videoUrl).length, 0), icon: Video, color: "rose" },
    { label: "Network Credits", value: "12.4k", icon: Zap, color: "amber" }
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          /* Fix motion.div error */
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex items-center space-x-6 hover:border-slate-700 transition-all group"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
              <stat.icon size={28} className={`text-${stat.color}-500`} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
            </div>
          </MotionDiv>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Call to Action Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3.5rem] p-16 text-white shadow-2xl shadow-blue-900/40 group">
          <div className="relative z-10 max-w-lg space-y-8">
            <h2 className="text-5xl font-black leading-none italic tracking-tighter">Forge your <br /> next legacy.</h2>
            <p className="text-blue-100 text-xl font-medium opacity-90 leading-relaxed">Synthesize multi-page narratives, cinematic video clips, and professional vocal narration in one unified neural studio.</p>
            <button 
              onClick={onNew}
              className="px-10 py-5 bg-white text-blue-800 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition-all flex items-center space-x-4 group/btn shadow-xl"
            >
              <span>Initiate Project</span>
              <Plus size={24} className="group-hover/btn:rotate-90 transition-transform" />
            </button>
          </div>
          <Book size={450} className="absolute -right-24 -bottom-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
        </div>

        {/* Quick Tools */}
        <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 p-10 shadow-xl flex flex-col">
          <h3 className="text-xl font-black text-white italic mb-8 px-2 tracking-tight">Rapid Assets</h3>
          <div className="space-y-4 flex-1">
            {[
              { name: "Bulk PDF Export", desc: "Print-ready CMYK" },
              { name: "Scene Upscaler", desc: "4K Neural Resolution" },
              { name: "Script Synthesis", desc: "AI Writing Assistant" },
              { name: "Asset Protection", desc: "Encrypted Watermark" }
            ].map((tool, i) => (
              <button key={i} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all group">
                <div className="text-left">
                  <span className="font-bold text-slate-200 block text-lg">{tool.name}</span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{tool.desc}</span>
                </div>
                <ChevronRight size={20} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-3xl font-black text-white italic tracking-tighter">Recent Syntheses</h3>
          <button className="text-blue-500 font-black uppercase text-xs tracking-widest hover:text-blue-400 transition-colors">View Complete Archive</button>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentProjects.map((project, i) => (
              /* Fix motion.div error */
              <MotionDiv 
                key={project.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-xl hover:border-blue-500/40 transition-all cursor-pointer relative" 
                onClick={() => onEdit(project)}
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={project.pages[0]?.imageUrl || "https://picsum.photos/seed/placeholder/400/300"} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest border border-slate-800">
                    {project.genre}
                  </div>
                  {project.pages.some(p => !!p.videoUrl) && (
                    <div className="absolute top-6 left-6 bg-rose-600 px-3 py-1.5 rounded-xl shadow-lg">
                      <Video size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-white truncate leading-none mb-1">{project.title}</h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{project.pages.length} Narrative Beats • {project.style}</p>
                  </div>
                  <div className="flex items-center text-blue-500 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                    <span>Resume Studio</span>
                    <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-800">
            <Layers size={64} className="mx-auto text-slate-800 mb-6" />
            <p className="text-slate-500 text-xl font-bold">The archive is empty. Initiate your first synthesis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
