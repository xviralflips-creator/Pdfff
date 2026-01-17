
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Book, Library, BarChart, Settings, LogOut, 
  Zap, Video, Volume2, ShoppingBag, 
  Menu, X, Loader2, User, Bell, Search, AlertTriangle, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, View } from './types';
import { storage } from './storage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectCreator from './pages/ProjectCreator';
import Editor from './pages/Editor';
import AdminDashboard from './pages/AdminDashboard';
import LibraryPage from './pages/LibraryPage';
import VideoStudio from './pages/VideoStudio';
import AudioStudio from './pages/AudioStudio';
import Marketplace from './pages/Marketplace';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [credits, setCredits] = useState(15000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProjects = await storage.getProjects();
        const savedCredits = localStorage.getItem('nano_credits');
        if (savedCredits) setCredits(parseInt(savedCredits));
        setProjects(savedProjects);
      } catch (err) {
        setError("Failed to initialize storage. Some features may be unavailable.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveToStorage = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      await storage.saveProjects(updatedProjects);
    } catch (err) {
      setError("Failed to save changes. Your work might not be persistent.");
    }
  };

  const consumeCredits = (amount: number) => {
    const newBalance = Math.max(0, credits - amount);
    setCredits(newBalance);
    localStorage.setItem('nano_credits', newBalance.toString());
    return newBalance > 0;
  };

  const addCredits = (amount: number) => {
    const newBalance = credits + amount;
    setCredits(newBalance);
    localStorage.setItem('nano_credits', newBalance.toString());
  };

  const createProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    saveToStorage(updated);
    setActiveProject(newProject);
    setCurrentView('editor');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p);
    saveToStorage(updated);
    if (activeProject?.id === id) {
      setActiveProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveToStorage(updated);
    if (activeProject?.id === id) setActiveProject(null);
  };

  const navigateToEditor = (project: Project) => {
    setActiveProject(project);
    setCurrentView('editor');
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  if (currentView === 'landing') return <LandingPage onStart={() => setCurrentView('dashboard')} />;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <Zap size={40} className="absolute inset-0 m-auto text-blue-400 animate-pulse" />
          </div>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs">Initializing Neural Engine...</p>
        </motion.div>
      </div>
    );
  }

  const SidebarItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
      {isSidebarOpen && <span className="font-semibold">{label}</span>}
      {active && (
        <motion.div 
          layoutId="active-sidebar"
          className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
        />
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Global Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] glass-panel px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border-red-500/30"
          >
            <AlertTriangle className="text-red-500" size={24} />
            <p className="font-medium text-slate-200">{error}</p>
            <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 border-r border-slate-800 p-6 transition-all duration-500 ease-out flex flex-col z-40`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
              <Zap size={28} fill="currentColor" />
            </div>
            {isSidebarOpen && <span className="font-black text-2xl tracking-tighter italic">NANOVERSE</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4 ${!isSidebarOpen && 'hidden'}`}>Platform</p>
          <SidebarItem icon={BarChart} label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
          <SidebarItem icon={Library} label="My Library" view="library" active={currentView === 'library'} />
          
          <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-8 mb-4 px-4 ${!isSidebarOpen && 'hidden'}`}>Creation</p>
          <SidebarItem icon={Plus} label="New Story" view="creator" active={currentView === 'creator'} />
          <SidebarItem icon={Video} label="Video Studio" view="video-studio" active={currentView === 'video-studio'} />
          <SidebarItem icon={Volume2} label="Audio Studio" view="audio-studio" active={currentView === 'audio-studio'} />
          
          <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-8 mb-4 px-4 ${!isSidebarOpen && 'hidden'}`}>Growth</p>
          <SidebarItem icon={ShoppingBag} label="Marketplace" view="marketplace" active={currentView === 'marketplace'} />
          <SidebarItem icon={Settings} label="Admin" view="admin" active={currentView === 'admin'} />
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
           <SidebarItem icon={Bell} label="Notifications" view="dashboard" active={false} />
           <button onClick={() => setCurrentView('landing')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-10 py-6 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white">
              {currentView === 'dashboard' && 'Control Center'}
              {currentView === 'creator' && 'Imagine a New World'}
              {currentView === 'editor' && `Sculpting: ${activeProject?.title}`}
              {currentView === 'library' && 'Archive'}
              {currentView === 'video-studio' && 'Veo Cinematic Studio'}
              {currentView === 'audio-studio' && 'Vocal Synthesis'}
              {currentView === 'marketplace' && 'Creator Storefront'}
              {currentView === 'admin' && 'Enterprise Governance'}
            </h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-8 relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search across all projects, videos, and scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => addCredits(1000)}
              className="flex items-center space-x-3 px-4 py-2.5 bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all group"
            >
              <Zap size={16} className="text-yellow-400 group-hover:scale-125 transition-transform" fill="currentColor" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">Credits</span>
                <span className="text-sm font-bold text-slate-200">{credits.toLocaleString()}</span>
              </div>
              <Plus size={14} className="ml-1 text-blue-400" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer">
              <img src="https://picsum.photos/seed/user-pro/200" alt="Avatar" className="w-full h-full rounded-[14px] object-cover" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (activeProject?.id || '')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "circOut" }}
            >
              {currentView === 'dashboard' && (
                <Dashboard 
                  projects={filteredProjects} 
                  onNew={() => setCurrentView('creator')} 
                  onEdit={navigateToEditor} 
                />
              )}
              {currentView === 'creator' && (
                <ProjectCreator 
                  onCreate={createProject} 
                  credits={credits} 
                  onConsumeCredits={consumeCredits} 
                  onError={setError}
                />
              )}
              {currentView === 'editor' && activeProject && (
                <Editor 
                  project={activeProject} 
                  onUpdate={updateProject} 
                  onDelete={() => { deleteProject(activeProject.id); setCurrentView('dashboard'); }} 
                />
              )}
              {currentView === 'library' && (
                <LibraryPage 
                  projects={filteredProjects} 
                  onEdit={navigateToEditor} 
                  onDelete={deleteProject} 
                />
              )}
              {currentView === 'video-studio' && (
                <VideoStudio 
                  projects={filteredProjects} 
                  onUpdate={updateProject} 
                  credits={credits}
                  onConsumeCredits={consumeCredits}
                  onError={setError}
                />
              )}
              {currentView === 'audio-studio' && (
                <AudioStudio 
                  projects={filteredProjects} 
                  onUpdate={updateProject} 
                  credits={credits}
                  onConsumeCredits={consumeCredits}
                  onError={setError}
                />
              )}
              {currentView === 'marketplace' && <Marketplace projects={projects} />}
              {currentView === 'admin' && <AdminDashboard projects={projects} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
