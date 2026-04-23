import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { 
  Leaf, User as UserIcon, LogOut, Menu, X, 
  LayoutDashboard, MessageSquare, Package, Search, ShieldCheck 
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-olive/5">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="serif text-2xl font-black text-ink tracking-tight">HEALTHAI</div>
          </Link>
          
          <div className="hidden md:flex gap-4">
            <NavPill to="/products">Library</NavPill>
            <NavPill to="/compare">Research</NavPill>
            <NavPill to="/log-food">Intake</NavPill>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-olive/5 border border-olive/10 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-olive/10 transition-all">
            <Search className="w-4 h-4 text-olive/40 mr-2" />
            <input 
              type="text" 
              placeholder="Search archive..." 
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-olive w-36 uppercase tracking-widest placeholder:text-olive/30"
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${(e.target as HTMLInputElement).value}`)}
            />
          </div>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 bg-paper border border-olive/10 rounded-full hover:shadow-xl transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center text-olive font-black italic border border-olive/20 overflow-hidden">
                   {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.displayName.charAt(0)}
                </div>
                <span className="hidden sm:inline text-[10px] font-black text-olive uppercase tracking-[0.15em]">{user.displayName.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-paper rounded-[32px] shadow-2xl border border-olive/5 p-3 z-50"
                  >
                    <div className="px-5 py-4 border-b border-olive/5 mb-2">
                       <p className="text-[10px] font-black text-olive/40 uppercase tracking-widest mb-1">User Record</p>
                       <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                    </div>
                    <ProfileMenuItem to="/profile" icon={<UserIcon className="w-4 h-4" />} label="Personal Settings" />
                    <ProfileMenuItem to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Personal Lab" />
                    {user.role === 'admin' && (
                      <ProfileMenuItem to="/admin" icon={<ShieldCheck className="w-4 h-4" />} label="System Portal" color="text-purple-600" />
                    )}
                    <div className="h-px bg-olive/5 my-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-6 py-3 text-[10px] font-black text-olive uppercase tracking-[0.2em] border border-olive/20 rounded-full bg-olive/5 hover:bg-olive/10 transition-all">Visit Us</Link>
              <Link to="/register" className="px-8 py-3 bg-olive text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-olive/90 transition-all shadow-xl shadow-olive/10">Register</Link>
            </div>
          )}
          
          <button className="md:hidden p-3 bg-olive/5 rounded-full text-olive" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-cream border-b border-olive/10 p-6 space-y-4 shadow-2xl z-40"
          >
            <div className="flex flex-col gap-4">
              <Link to="/products" className="text-2xl font-light text-ink serif italic border-b border-olive/5 pb-2" onClick={() => setIsOpen(false)}>Library</Link>
              <Link to="/compare" className="text-2xl font-light text-ink serif italic border-b border-olive/5 pb-2" onClick={() => setIsOpen(false)}>Research</Link>
              <Link to="/log-food" className="text-2xl font-light text-ink serif italic border-b border-olive/5 pb-2" onClick={() => setIsOpen(false)}>Intake</Link>
              {!user && (
                <div className="flex flex-col gap-3 pt-6">
                   <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 text-center border-2 border-olive/10 rounded-full font-black text-olive uppercase text-xs tracking-widest">Sign In</Link>
                   <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-4 text-center bg-olive text-white rounded-full font-black uppercase text-xs tracking-widest">Create Account</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavPill({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="bg-olive/5 border border-olive/20 rounded-full px-6 py-2 text-[10px] font-black text-olive uppercase tracking-[0.15em] hover:bg-olive/10 transition-all">
      {children}
    </Link>
  );
}

function ProfileMenuItem({ to, icon, label, color = "text-olive" }: { to: string, icon: any, label: string, color?: string }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-olive/5 transition-all ${color}`}>
       {icon} {label}
    </Link>
  );
}
