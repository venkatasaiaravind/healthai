import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { User, Mail, Calendar, Target, Activity, Settings, Save, ShieldAlert, LogOut } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { RootState } from '../store';
import { setProfile } from '../store/slices/authSlice';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    age: profile?.age || 0,
    weight: profile?.weightKg || 0,
    height: profile?.heightCm || 0,
    dailyCalorieGoal: profile?.dailyCalorieGoal || 2000,
    healthConditions: profile?.healthConditions.join(', ') || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const updatedProfile = {
        ...profile,
        age: formData.age,
        weightKg: formData.weight,
        heightCm: formData.height,
        dailyCalorieGoal: formData.dailyCalorieGoal,
        healthConditions: formData.healthConditions.split(',').map(s => s.trim()).filter(Boolean),
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'userProfiles', user.uid), updatedProfile as any);
      dispatch(setProfile(updatedProfile as any));
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
     await signOut(auth);
     navigate('/');
  };

  if (!user || !profile) return null;

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
       <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="md:w-80 space-y-8">
             <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-green-900/5 text-center border border-gray-100">
                <div className="w-24 h-24 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black">
                   {user.displayName.charAt(0)}
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{user.displayName}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                
                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-6">
                   <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase">Weight</p>
                      <p className="text-lg font-black text-gray-900">{profile.weightKg}kg</p>
                   </div>
                   <div className="h-10 w-px bg-gray-50"></div>
                   <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase">Age</p>
                      <p className="text-lg font-black text-gray-900">{profile.age}y</p>
                   </div>
                </div>
             </div>

             <div className="bg-gray-900 rounded-[40px] p-6 text-white space-y-2">
                <AdminNavLink icon={<User className="w-4 h-4" />} label="Personal Info" active />
                <AdminNavLink icon={<Activity className="w-4 h-4" />} label="Engagement History" />
                <AdminNavLink icon={<Target className="w-4 h-4" />} label="Health Goals" />
                <AdminNavLink icon={<Settings className="w-4 h-4" />} label="Privacy" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-white/5 transition-all mt-6"
                >
                   <LogOut className="w-4 h-4" /> Sign Out
                </button>
             </div>
          </aside>

          {/* Main Form */}
          <div className="flex-grow">
             <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-green-900/5 border border-gray-100">
                <header className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 italic capitalize">
                      <Settings className="w-6 h-6 text-green-500" /> Account Settings
                   </h3>
                   <button 
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs font-black text-green-500 uppercase tracking-widest hover:underline"
                   >
                     {editMode ? 'Cancel' : 'Edit Profile'}
                   </button>
                </header>

                <form onSubmit={handleUpdate} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ProfileField 
                        label="Full Name" value={formData.displayName} disabled={!editMode} 
                        onChange={v => setFormData({...formData, displayName: v})} 
                      />
                      <ProfileField 
                        label="Email Address" value={user.email} disabled={true} 
                        onChange={() => {}} 
                      />
                      <ProfileField 
                        label="Age" value={formData.age.toString()} disabled={!editMode} type="number"
                        onChange={v => setFormData({...formData, age: Number(v)})} 
                      />
                      <ProfileField 
                        label="Daily Calorie Goal" value={formData.dailyCalorieGoal.toString()} disabled={!editMode} type="number"
                        onChange={v => setFormData({...formData, dailyCalorieGoal: Number(v)})} 
                      />
                      <ProfileField 
                        label="Weight (kg)" value={formData.weight.toString()} disabled={!editMode} type="number"
                        onChange={v => setFormData({...formData, weight: Number(v)})} 
                      />
                      <ProfileField 
                        label="Height (cm)" value={formData.height.toString()} disabled={!editMode} type="number"
                        onChange={v => setFormData({...formData, height: Number(v)})} 
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Health Conditions</label>
                      <textarea 
                        disabled={!editMode}
                        value={formData.healthConditions}
                        onChange={e => setFormData({...formData, healthConditions: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/10 font-bold text-sm"
                        placeholder="Diabetes, Thyroid (separate with commas)"
                      ></textarea>
                   </div>

                   {editMode && (
                     <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-green-500 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                     >
                       <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Profile Changes'}
                     </button>
                   )}
                </form>

                {!editMode && (
                   <div className="mt-12 p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-start gap-4">
                      <ShieldAlert className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                         <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Dietary Precision</p>
                         <p className="text-xs text-blue-700 font-medium leading-relaxed">Your profile is currently optimized for <span className="underline decoration-2">{profile.dietaryPreference}</span> dietary preferences. This influences your personalized AI Health Scores across our catalog.</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

function ProfileField({ label, value, disabled, onChange, type = "text" }: { label: string, value: string, disabled: boolean, onChange: (v: string) => void, type?: string }) {
  return (
    <div>
       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{label}</label>
       <input 
        type={type}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none font-bold text-sm transition-all ${disabled ? 'border-transparent text-gray-400' : 'border-gray-100 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 text-gray-900'}`}
       />
    </div>
  );
}

function AdminNavLink({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
       {icon} {label}
    </button>
  );
}
