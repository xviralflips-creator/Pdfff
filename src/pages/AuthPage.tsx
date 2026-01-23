import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut 
} from 'firebase/auth';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage: React.FC<{ needsVerification?: boolean }> = ({ needsVerification = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        // Sign out immediately so they have to verify first
        await signOut(auth);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Email or password is incorrect.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  if (needsVerification || verificationSent) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] text-center space-y-8"
        >
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-500">
             <Mail size={40} />
          </div>
          <h2 className="text-3xl font-black text-white">Verify your Email</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            We have sent you a verification email to <span className="text-white font-bold block mt-1">{email || auth.currentUser?.email}</span>
            Please verify it and log in to access Lumina Studio.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-500 transition-colors text-lg"
            >
              I've Verified, Log In
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-colors text-lg"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-10 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/20 mb-8">
             <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">Lumina Studio</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Enter the Neural Relay</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8">
           <div className="flex p-1.5 bg-slate-950 rounded-2xl">
              <button 
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
           </div>

           {error && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
               <AlertTriangle size={20} className="shrink-0" />
               {error}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Email</label>
                 <div className="relative">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-base"
                     placeholder="creator@lumina.ai"
                   />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Password</label>
                 <div className="relative">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                   <input 
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-base"
                     placeholder="••••••••"
                   />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-black text-xl text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 mt-6"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>{isLogin ? 'Access Studio' : 'Create Account'}</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
           </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;