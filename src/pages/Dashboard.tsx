import React, { useState, useEffect, useRef } from 'react';
import { Project, FileDoc, FolderDoc, NoteDoc, TeamMemberDoc } from '../types';
import { 
  Plus, TrendingUp, ChevronRight, Sparkles, Folder, File, Trash2, 
  Download, HardDrive, FileText, Users, UploadCloud, Crown, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage, auth } from '../firebase';
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import Modal from '../components/Modal';

interface DashboardProps {
  projects: Project[];
  onNew: () => void;
  onEdit: (p: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onNew, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'notes' | 'team'>('overview');
  
  // Data State
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [folders, setFolders] = useState<FolderDoc[]>([]);
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [members, setMembers] = useState<TeamMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<'upload' | 'folder' | 'note' | 'member' | 'upgrade' | null>(null);
  
  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = auth.currentUser;

  // Real-time Listeners
  useEffect(() => {
    if (!currentUser) return;

    const qFiles = query(collection(db, `users/${currentUser.uid}/files`), orderBy('createdAt', 'desc'));
    const qFolders = query(collection(db, `users/${currentUser.uid}/folders`), orderBy('createdAt', 'desc'));
    const qNotes = query(collection(db, `users/${currentUser.uid}/notes`), orderBy('createdAt', 'desc'));
    const qMembers = query(collection(db, `users/${currentUser.uid}/teamMembers`), orderBy('createdAt', 'desc'));

    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      setFiles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FileDoc)));
    });
    const unsubFolders = onSnapshot(qFolders, (snapshot) => {
      setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FolderDoc)));
    });
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      setNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NoteDoc)));
    });
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamMemberDoc)));
      setLoading(false);
    });

    return () => {
      unsubFiles(); unsubFolders(); unsubNotes(); unsubMembers();
    };
  }, [currentUser]);

  // Actions
  const handleCreateFolder = async () => {
    if (!newItemName || !currentUser) return;
    await addDoc(collection(db, `users/${currentUser.uid}/folders`), {
      name: newItemName,
      createdAt: serverTimestamp()
    });
    closeModal();
  };

  const handleCreateNote = async () => {
    if (!newItemName || !currentUser) return;
    await addDoc(collection(db, `users/${currentUser.uid}/notes`), {
      title: newItemName,
      content: newItemContent,
      createdAt: serverTimestamp()
    });
    closeModal();
  };

  const handleAddMember = async () => {
    if (!newItemName || !currentUser) return;
    await addDoc(collection(db, `users/${currentUser.uid}/teamMembers`), {
      name: newItemName,
      role: newItemContent || 'Member',
      createdAt: serverTimestamp()
    });
    closeModal();
  };

  const handleDelete = async (collectionName: string, id: string, storagePath?: string) => {
    if (!currentUser) return;
    
    // Delete from Storage first if applicable
    if (storagePath) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (e) {
        console.error("Storage delete error:", e);
      }
    }

    // Delete Firestore Doc
    await deleteDoc(doc(db, `users/${currentUser.uid}/${collectionName}`, id));
  };

  const handleUploadClick = () => {
    if (files.length >= 5) {
      setModalType('upgrade');
    } else {
      setModalType('upload');
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !currentUser) return;
    setIsUploading(true);

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const storageRef = ref(storage, `user_uploads/${currentUser.uid}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error(error);
        setIsUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, `users/${currentUser.uid}/files`), {
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.type,
          storagePath: uploadTask.snapshot.ref.fullPath,
          downloadURL,
          createdAt: serverTimestamp()
        });
        setIsUploading(false);
        closeModal();
      }
    );
  };

  const closeModal = () => {
    setModalType(null);
    setNewItemName('');
    setNewItemContent('');
    setFileToUpload(null);
    setUploadProgress(0);
  };

  const stats = [
    { label: "Total Assets", value: projects.length, icon: Layers, color: "text-cyan-500" },
    { label: "Storage Used", value: `${files.length}/5`, icon: HardDrive, color: "text-emerald-500" }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="px-2 flex justify-between items-end">
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Welcome back, Creator</p>
          <h2 className="text-5xl font-black italic text-white tracking-tighter">My Studio</h2>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between h-40">
            <stat.icon className={stat.color} size={28} />
            <div>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <button 
        onClick={onNew}
        className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700 p-8 rounded-[2.5rem] text-left text-white shadow-2xl group active:scale-95 transition-all"
      >
        <div className="relative z-10 space-y-3">
          <h3 className="text-4xl font-black italic tracking-tighter">Initiate Story</h3>
          <p className="text-base font-medium text-cyan-100 opacity-90 max-w-[200px]">Launch a new multi-page narrative project.</p>
        </div>
        <Plus size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Cloud Workspace Section */}
      <div className="pt-6">
        <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
           {[
             { id: 'overview', label: 'Projects', icon: Sparkles },
             { id: 'files', label: 'Files', icon: HardDrive },
             { id: 'notes', label: 'Notes', icon: FileText },
             { id: 'team', label: 'Team', icon: Users },
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center space-x-2.5 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-xl scale-105' 
                  : 'bg-slate-900 border border-white/5 text-slate-500 hover:text-slate-300'
              }`}
             >
               <tab.icon size={16} />
               <span>{tab.label}</span>
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => onEdit(project)}
                  className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex items-center space-x-5 active:bg-slate-800 transition-colors"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                    <img src={project.pages[0]?.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white truncate mb-1">{project.title}</h4>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{project.pages.length} Beats • {project.genre}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-700" />
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-medium bg-slate-900/50 rounded-[2rem] border border-white/5 text-lg">No recent projects</div>
              )}
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex gap-4">
                <button onClick={() => setModalType('folder')} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold text-slate-300 text-sm flex items-center justify-center gap-2 hover:bg-slate-700">
                   <Folder size={18} /> New Folder
                </button>
                <button onClick={handleUploadClick} className="flex-1 py-4 bg-cyan-600 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:bg-cyan-500">
                   <UploadCloud size={18} /> Add File
                </button>
              </div>
              
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/30">
                   <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Storage</span>
                   <span className={`text-xs font-bold ${files.length >= 5 ? 'text-red-400' : 'text-emerald-400'}`}>{files.length} / 5 Used</span>
                </div>
                {files.length === 0 && folders.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-lg">No files uploaded yet.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                     {folders.map(f => (
                       <div key={f.id} className="p-5 flex items-center justify-between hover:bg-white/5">
                          <div className="flex items-center gap-4">
                             <Folder className="text-yellow-500" size={24} />
                             <span className="font-bold text-slate-200 text-base">{f.name}</span>
                          </div>
                          <button onClick={() => handleDelete('folders', f.id)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={18}/></button>
                       </div>
                     ))}
                     {files.map(f => (
                       <div key={f.id} className="p-5 flex items-center justify-between hover:bg-white/5">
                          <div className="flex items-center gap-4 overflow-hidden">
                             <File className="text-cyan-500 shrink-0" size={24} />
                             <div className="min-w-0">
                               <p className="font-bold text-slate-200 truncate text-base">{f.name}</p>
                               <p className="text-xs text-slate-500 font-mono mt-0.5">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                             <a href={f.downloadURL} target="_blank" rel="noreferrer" className="p-3 text-slate-400 hover:text-white"><Download size={18}/></a>
                             <button onClick={() => handleDelete('files', f.id, f.storagePath)} className="p-3 text-slate-600 hover:text-red-400"><Trash2 size={18}/></button>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <button onClick={() => setModalType('note')} className="w-full py-4 bg-slate-800 rounded-2xl font-bold text-slate-300 text-sm flex items-center justify-center gap-2 hover:bg-slate-700">
                 <Plus size={18} /> New Note
              </button>
              <div className="grid grid-cols-2 gap-4">
                 {notes.map(n => (
                   <div key={n.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between h-48 group hover:border-cyan-500/30 transition-all">
                      <div>
                        <h4 className="font-bold text-white line-clamp-1 text-lg">{n.title}</h4>
                        <p className="text-sm text-slate-400 mt-2 line-clamp-4">{n.content}</p>
                      </div>
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete('notes', n.id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 ))}
                 {notes.length === 0 && (
                   <div className="col-span-2 py-16 text-center text-slate-500 bg-slate-900/50 rounded-[2rem] border border-white/5 text-lg">
                     Your mind is empty... for now.
                   </div>
                 )}
              </div>
            </motion.div>
          )}

          {activeTab === 'team' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
               <button onClick={() => setModalType('member')} className="w-full py-4 bg-slate-800 rounded-2xl font-bold text-slate-300 text-sm flex items-center justify-center gap-2 hover:bg-slate-700">
                 <Plus size={18} /> Add Member
               </button>
               <div className="space-y-3">
                 {members.map(m => (
                   <div key={m.id} className="bg-slate-900 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
                            {m.name.charAt(0)}
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-lg">{m.name}</h4>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{m.role}</p>
                         </div>
                      </div>
                      <button onClick={() => handleDelete('teamMembers', m.id)} className="p-3 text-slate-600 hover:text-red-400"><Trash2 size={18}/></button>
                   </div>
                 ))}
                 {members.length === 0 && (
                   <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-[2rem] border border-white/5 text-lg">
                     You are a solo creator.
                   </div>
                 )}
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={modalType === 'folder'} 
        onClose={closeModal} 
        title="Create Folder"
        footer={
          <>
            <button onClick={closeModal} className="px-5 py-3 text-slate-400 font-bold text-sm">Cancel</button>
            <button onClick={handleCreateFolder} disabled={!newItemName} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-500 disabled:opacity-50">Create</button>
          </>
        }
      >
        <input 
          autoFocus
          className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-cyan-500 text-lg"
          placeholder="Folder Name"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
        />
      </Modal>

      <Modal 
        isOpen={modalType === 'upload'} 
        onClose={closeModal} 
        title="Upload File"
        isLoading={isUploading}
        footer={
          <>
            <button onClick={closeModal} className="px-5 py-3 text-slate-400 font-bold text-sm">Cancel</button>
            <button onClick={handleFileUpload} disabled={!fileToUpload || isUploading} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-500 disabled:opacity-50">Upload</button>
          </>
        }
      >
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={e => setFileToUpload(e.target.files?.[0] || null)} />
          {fileToUpload ? (
            <div className="text-cyan-400 font-bold flex flex-col items-center">
              <File size={40} className="mb-3" />
              <span className="text-lg">{fileToUpload.name}</span>
              <span className="text-sm text-slate-500 mt-1">{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          ) : (
            <div className="text-slate-500 font-bold flex flex-col items-center">
              <UploadCloud size={40} className="mb-3" />
              <span className="text-lg">Tap to browse files</span>
            </div>
          )}
        </div>
        {uploadProgress > 0 && <div className="w-full bg-slate-800 h-2 mt-6 rounded-full overflow-hidden"><div className="bg-cyan-500 h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div></div>}
      </Modal>

      <Modal 
        isOpen={modalType === 'note'} 
        onClose={closeModal} 
        title="New Note"
        footer={
          <>
            <button onClick={closeModal} className="px-5 py-3 text-slate-400 font-bold text-sm">Cancel</button>
            <button onClick={handleCreateNote} disabled={!newItemName} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-500 disabled:opacity-50">Save Note</button>
          </>
        }
      >
        <div className="space-y-4">
          <input 
            autoFocus
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-cyan-500 font-bold text-lg"
            placeholder="Title"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
          />
          <textarea 
            className="w-full h-40 bg-slate-950 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-cyan-500 resize-none text-base"
            placeholder="Write your thoughts..."
            value={newItemContent}
            onChange={e => setNewItemContent(e.target.value)}
          />
        </div>
      </Modal>

      <Modal 
        isOpen={modalType === 'member'} 
        onClose={closeModal} 
        title="Add Team Member"
        footer={
          <>
            <button onClick={closeModal} className="px-5 py-3 text-slate-400 font-bold text-sm">Cancel</button>
            <button onClick={handleAddMember} disabled={!newItemName} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-500 disabled:opacity-50">Add</button>
          </>
        }
      >
        <div className="space-y-4">
          <input 
            autoFocus
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-cyan-500 text-lg"
            placeholder="Name"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
          />
          <input 
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-cyan-500 text-lg"
            placeholder="Role (e.g. Editor)"
            value={newItemContent}
            onChange={e => setNewItemContent(e.target.value)}
          />
        </div>
      </Modal>

      <Modal 
        isOpen={modalType === 'upgrade'} 
        onClose={closeModal} 
        title="Limit Reached"
        footer={
          <button onClick={closeModal} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm">Close</button>
        }
      >
        <div className="text-center space-y-6 py-6">
           <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-500">
              <Crown size={40} />
           </div>
           <div>
             <h4 className="text-2xl font-black text-white">Free Plan Limit</h4>
             <p className="text-slate-400 mt-2 text-base">You have reached the maximum of 5 files on the free tier.</p>
           </div>
           <button className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl font-black text-white shadow-lg text-lg">Upgrade to Pro</button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;