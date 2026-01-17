
import React, { useState, useEffect } from 'react';
import { Layout, Grid, Plus, Book, Library, BarChart, Settings, LogOut, ChevronRight, Image as ImageIcon, Download, Trash2, Edit, Save, Zap, AlertCircle } from 'lucide-react';
import { Project, View, StoryPage } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectCreator from './pages/ProjectCreator';
import Editor from './pages/Editor';
import AdminDashboard from './pages/AdminDashboard';
import LibraryPage from './pages/LibraryPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nano_pdf_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('nano_pdf_projects', JSON.stringify(updatedProjects));
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
      setActiveProject({ ...activeProject, ...updates });
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

  if (currentView === 'landing') {
    return <LandingPage onStart={() => setCurrentView('dashboard')} />;
  }

  const SidebarItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 p-4 transition-all duration-300 flex flex-col`}>
        <div className="flex items-center space-x-3 px-2 mb-10 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Zap size={24} fill="currentColor" />
          </div>
          {isSidebarOpen && <span className="font-extrabold text-xl tracking-tight text-slate-800">NanoPDF</span>}
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={BarChart} label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
          <SidebarItem icon={Plus} label="New Story" view="creator" active={currentView === 'creator'} />
          <SidebarItem icon={Library} label="Library" view="library" active={currentView === 'library'} />
          <SidebarItem icon={Settings} label="Admin" view="admin" active={currentView === 'admin'} />
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">
            {currentView === 'dashboard' && 'Welcome back!'}
            {currentView === 'creator' && 'Create AI Story'}
            {currentView === 'editor' && `Editing: ${activeProject?.title}`}
            {currentView === 'library' && 'Your Projects'}
            {currentView === 'admin' && 'Admin Overview'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              45 Credits Left
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/user/200" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard projects={projects} onNew={() => setCurrentView('creator')} onEdit={navigateToEditor} />}
          {currentView === 'creator' && <ProjectCreator onCreate={createProject} />}
          {currentView === 'editor' && activeProject && <Editor project={activeProject} onUpdate={updateProject} onDelete={() => { deleteProject(activeProject.id); setCurrentView('dashboard'); }} />}
          {currentView === 'library' && <LibraryPage projects={projects} onEdit={navigateToEditor} onDelete={deleteProject} />}
          {currentView === 'admin' && <AdminDashboard projects={projects} />}
        </div>
      </main>
    </div>
  );
};

export default App;
