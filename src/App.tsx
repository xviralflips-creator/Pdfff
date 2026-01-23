import React, { useState, useEffect } from 'react';
import { 
  Plus, Library, Settings, LogOut, 
  Zap, Volume2, 
  Menu, X, Sparkles, FlaskConical,
  LayoutGrid, Home, Scissors, Megaphone, UserCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, View, Asset, Subscription } from './types';
import { storage } from './storage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectCreator from './pages/ProjectCreator';
import Editor from './pages/Editor';
import LibraryPage from './pages/LibraryPage';
import AudioStudio from './pages/AudioStudio';
import CreativeLab from './pages/CreativeLab';
import Store from './pages/Store';
import AdsGenerator from './pages/AdsGenerator';
import CharacterForge from './pages/CharacterForge';
import AuthPage from './pages/AuthPage';

const MotionDiv = motion.div as any;

const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading, logout } = useAuth();
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

  // Auth Protection Logic
  if (authLoading || isLoading) {
     return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
        <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles size={24} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-xs">Lumina Engine Loading</p>
        </MotionDiv>
      </div>
    );
  }

  // Not logged in -> Show Auth or Landing
  if (!currentUser) {
    // If user clicks start on landing page, show AuthPage
    if (currentView === 'dashboard') {
      return <AuthPage />;
    }
    // Otherwise show Landing Page
    return <LandingPage onStart={() => setCurrentView('dashboard')} />;
  }

  // Logged in but not verified -> Show Verify
  if (currentUser && !currentUser.emailVerified) {
    return <AuthPage needsVerification={true} />;
  }

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

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
  };

  const NavItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex flex-col items-center justify-center transition-all duration-300 py-2 ${
        active ? 'text-cyan-400' : 'text-slate-500'
      }`}
    >
      <Icon size={24} className={active ? 'scale-110' : ''} />
      <span className="text-xs mt-1 font-bold">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1" />}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans text-base">
      <AnimatePresence>
        {error && (
          <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-6 right-6 z-[100] glass-morphism px-6 py-4 rounded-xl flex items-center space-x-3 border-red-500/30 shadow-2xl">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-slate-200 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-2 bg-white/5 rounded-full"><X size={16} /></button>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter italic">LUMINA</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('store')} className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl flex items-center space-x-2 active:scale-95 transition-transform">
            <Zap size={16} className="text-yellow-400" fill="currentColor" />
            <span className="text-sm font-black">{credits}</span>
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 active:scale-95 transition-transform">
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden safe-bottom bg-[#020617] relative scroll-smooth">
        <div className="p-6 pb-32 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <MotionDiv key={currentView} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              {currentView === 'dashboard' && <Dashboard projects={projects} onNew={() => setCurrentView('creator')} onEdit={(p) => { setActiveProject(p); setCurrentView('editor'); }} />}
              {currentView === 'creator' && <ProjectCreator onCreate={createProject} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'lab' && <CreativeLab assets={assets} onSaveAsset={saveAsset} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'editor' && activeProject && <Editor project={activeProject} onUpdate={updateProject} onDelete={() => { storage.saveProjects(projects.filter(p => p.id !== activeProject.id)); setProjects(projects.filter(p => p.id !== activeProject.id)); setCurrentView('dashboard'); }} credits={credits} onConsumeCredits={consumeCredits} onError={setError} />}
              {currentView === 'audio-studio' && <AudioStudio projects={projects} onUpdate={updateProject} />}
              {currentView === 'store' && <Store credits={credits} onPurchase={addCredits} onSubscribe={updateSub} sub={subscription} />}
              {currentView === 'ads-gen' && <AdsGenerator credits={credits} onConsumeCredits={consumeCredits} onError={setError} onSaveAsset={saveAsset} />}
              {currentView === 'character-forge' && <CharacterForge credits={credits} onConsumeCredits={consumeCredits} onError={setError} onSaveAsset={saveAsset} />}
              {currentView === 'library' && <LibraryPage projects={projects} onEdit={(p) => { setActiveProject(p); setCurrentView('editor'); }} onDelete={(id) => { storage.saveProjects(projects.filter(p => p.id !== id)); setProjects(projects.filter(p => p.id !== id)); }} />}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Increased height for better touch targets */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 glass-morphism border-t border-white/5 px-6 flex items-center justify-between safe-bottom z-50">
        <NavItem icon={Home} label="Home" view="dashboard" active={currentView === 'dashboard'} />
        <NavItem icon={LayoutGrid} label="Lab" view="lab" active={currentView === 'lab'} />
        <div className="relative -top-8">
          <button 
            onClick={() => setCurrentView('creator')}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/40 active:scale-90 transition-all border-4 border-[#020617]"
          >
            <Plus size={32} />
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
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 bottom-0 w-80 bg-[#0f172a] z-[60] p-8 border-l border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <span className="font-black text-2xl italic tracking-tighter text-white">STUDIO MENU</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <SidebarBtn icon={FlaskConical} label="Creative Lab" onClick={() => { setCurrentView('lab'); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={Volume2} label="Audio Studio" onClick={() => { setCurrentView('audio-studio'); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={Scissors} label="Character Forge" onClick={() => { setCurrentView('character-forge'); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={Library} label="Archive" onClick={() => { setCurrentView('library'); setIsSidebarOpen(false); }} />
                <div className="pt-8 mt-4 border-t border-white/5">
                  <SidebarBtn icon={Settings} label="Preferences" onClick={() => {}} />
                  <SidebarBtn icon={LogOut} label="Sign Out" onClick={handleLogout} color="text-red-400" />
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
  <button onClick={onClick} className={`w-full flex items-center space-x-4 p-5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 ${color}`}>
    <Icon size={24} />
    <span className="font-bold text-lg">{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;