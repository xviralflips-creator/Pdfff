
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Book, Library, BarChart, Settings, LogOut, 
  Zap, Video, Volume2, ShoppingBag, 
  Menu, X, Loader2, User, Bell, Search, AlertTriangle, CreditCard, Sparkles, FlaskConical,
  LayoutGrid, Home, Scissors, Megaphone, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, View, Asset, Subscription } from './types';
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
import CreativeLab from './pages/CreativeLab';
import Store from './pages/Store';
import AdsGenerator from './pages/AdsGenerator';
import CharacterForge from './pages/CharacterForge';

const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(1000);
  const [subscription, setSubscription] = useState<Subscription>({ tier: 'free' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProjects = await storage.getProjects();
        const savedCredits = localStorage.getItem('lumina_credits');
        const savedAssets = localStorage.getItem('lumina_assets');
        const savedSub = localStorage.getItem('lumina_sub');
        if (savedCredits) setCredits(parseInt(savedCredits));
        if (savedAssets) setAssets(JSON.parse(savedAssets));
        if (savedSub) setSubscription(JSON.parse(savedSub));
        setProjects(savedProjects);
      } catch (err) {
        setError("Failed to initialize storage.");
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
      setError("Failed to save projects.");
    }
  };

  const saveAsset = (asset: Asset) => {
    const updated = [asset, ...assets];
    setAssets(updated);
    localStorage.setItem('lumina_assets', JSON.stringify(updated));
  };

  const consumeCredits = (amount: number) => {
    if (subscription.tier === 'elite') return true;
    const newBalance = credits - amount;
    if (newBalance < 0) return false;
    setCredits(newBalance);
    localStorage.setItem('lumina_credits', newBalance.toString());
    return true;
  };

  const updateSub = (sub: Subscription) => {
    setSubscription(sub);
    localStorage.setItem('lumina_sub', JSON.stringify(sub));
  };

  const addCredits = (amount: number) => {
    const newBalance = credits + amount;
    setCredits(newBalance);
    localStorage.setItem('lumina_credits', newBalance.toString());
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

  if (currentView === 'landing') return <LandingPage onStart={() => setCurrentView('dashboard')} />;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
        <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles size={24} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Lumina Engine Loading</p>
        </MotionDiv>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex flex-col items-center justify-center transition-all duration-300 ${
        active ? 'text-cyan-400' : 'text-slate-500'
      }`}
    >
      <Icon size={22} className={active ? 'scale-110' : ''} />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5" />}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <AnimatePresence>
        {error && (
          <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-6 right-6 z-[100] glass-morphism px-4 py-3 rounded-xl flex items-center space-x-3 border-red-500/30">
            <AlertTriangle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs font-medium text-slate-200 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-1"><X size={14} /></button>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="font-black text-lg tracking-tighter italic">LUMINA</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('store')} className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg flex items-center space-x-2">
            <Zap size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-xs font-black">{credits}</span>
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden safe-bottom bg-[#020617] relative scroll-smooth">
        <div className="p-5 pb-24 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <MotionDiv key={currentView} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              {currentView === 'dashboard' && <Dashboard projects={projects} onNew={() => setCurrentView('creator')} onEdit={(p) => { setActiveProject(p); setCurrentView('editor'); }} />}
              {currentView === 'creator' && <ProjectCreator onCreate={createProject} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'lab' && <CreativeLab assets={assets} onSaveAsset={saveAsset} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'editor' && activeProject && <Editor project={activeProject} onUpdate={updateProject} onDelete={() => { storage.saveProjects(projects.filter(p => p.id !== activeProject.id)); setProjects(projects.filter(p => p.id !== activeProject.id)); setCurrentView('dashboard'); }} />}
              {currentView === 'video-studio' && <VideoStudio projects={projects} onUpdate={updateProject} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'store' && <Store credits={credits} onPurchase={addCredits} onSubscribe={updateSub} sub={subscription} />}
              {currentView === 'ads-gen' && <AdsGenerator credits={credits} onConsumeCredits={consumeCredits} onError={setError} onSaveAsset={saveAsset} />}
              {currentView === 'character-forge' && <CharacterForge credits={credits} onConsumeCredits={consumeCredits} onError={setError} onSaveAsset={saveAsset} />}
              {currentView === 'library' && <LibraryPage projects={projects} onEdit={(p) => { setActiveProject(p); setCurrentView('editor'); }} onDelete={(id) => { storage.saveProjects(projects.filter(p => p.id !== id)); setProjects(projects.filter(p => p.id !== id)); }} />}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-morphism border-t border-white/5 px-6 flex items-center justify-between safe-bottom z-50">
        <NavItem icon={Home} label="Home" view="dashboard" active={currentView === 'dashboard'} />
        <NavItem icon={LayoutGrid} label="Lab" view="lab" active={currentView === 'lab'} />
        <div className="relative -top-6">
          <button 
            onClick={() => setCurrentView('creator')}
            className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/40 active:scale-90 transition-all"
          >
            <Plus size={28} />
          </button>
        </div>
        <NavItem icon={Megaphone} label="Ads" view="ads-gen" active={currentView === 'ads-gen'} />
        <NavItem icon={UserCircle} label="Store" view="store" active={currentView === 'store'} />
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 bottom-0 w-72 bg-[#0f172a] z-[60] p-8 border-l border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <span className="font-black text-xl italic tracking-tighter">STUDIO MENU</span>
                <X onClick={() => setIsSidebarOpen(false)} className="text-slate-500" />
              </div>
              <div className="space-y-4">
                <SidebarBtn icon={FlaskConical} label="Creative Lab" onClick={() => setCurrentView('lab')} />
                <SidebarBtn icon={Video} label="Video Studio" onClick={() => setCurrentView('video-studio')} />
                <SidebarBtn icon={Volume2} label="Audio Studio" onClick={() => setCurrentView('audio-studio')} />
                <SidebarBtn icon={Scissors} label="Character Forge" onClick={() => setCurrentView('character-forge')} />
                <SidebarBtn icon={Library} label="Archive" onClick={() => setCurrentView('library')} />
                <div className="pt-6 border-t border-white/5">
                  <SidebarBtn icon={Settings} label="Preferences" onClick={() => {}} />
                  <SidebarBtn icon={LogOut} label="Sign Out" onClick={() => setCurrentView('landing')} color="text-red-400" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarBtn = ({ icon: Icon, label, onClick, color = 'text-slate-300' }: any) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-all ${color}`}>
    <Icon size={20} />
    <span className="font-bold">{label}</span>
  </button>
);

export default App;
