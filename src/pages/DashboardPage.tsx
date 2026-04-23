import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, ArrowRight, Calendar, Plus, Trash2, 
  Zap, TrendingUp, ShoppingBag, MessageSquare, Info,
  Flame, History, ChevronRight, Star, Leaf, ShieldCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { RootState } from '../store';
import { FoodLog, Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function DashboardPage() {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'foodLogs'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodLog));
      setTodayLogs(logs);
      setLoading(false);
    }, (error) => {
      console.error("Food logs listener failed:", error);
      setLoading(false);
    });

    const fetchDashboardData = async () => {
      try {
        const prodQ = query(collection(db, 'products'), where('healthScore', '>=', 70), limit(6));
        const prodSnapshot = await getDocs(prodQ);
        setRecommendations(prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (err) {
        console.error('Data fetch error', err);
      }
    };
    fetchDashboardData();

    return () => unsubscribe();
  }, [user]);

  const stats = {
    calories: todayLogs.reduce((acc, log) => acc + log.calories, 0),
    protein: todayLogs.reduce((acc, log) => acc + log.protein, 0),
    carbs: todayLogs.reduce((acc, log) => acc + log.carbs, 0),
    fat: todayLogs.reduce((acc, log) => acc + log.fat, 0),
  };

  if (!profile && !loading) {
    return (
      <div className="container mx-auto px-6 py-24 bg-cream min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-olive/5 rounded-full flex items-center justify-center mb-8 border border-olive/10 shadow-inner">
           <Leaf className="w-10 h-10 text-olive" />
        </div>
        <h1 className="text-4xl font-light text-ink serif italic mb-4">Laboratory Initialization Required</h1>
        <p className="text-olive/60 max-w-md mx-auto mb-10 font-medium leading-relaxed">Your personal health lab requires initialization to track biometrics and analyze nutritional lineages.</p>
        <Link 
          to="/setup-profile" 
          className="bg-olive text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-olive/20 hover:bg-ink transition-all flex items-center gap-3"
        >
          Initialize Profile <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-cream min-h-screen">
      <header className="mb-16 flex justify-between items-end bg-olive p-10 rounded-[48px] text-white shadow-2xl shadow-olive/20">
        <div>
          <h1 className="text-5xl font-light serif italic capitalize tracking-tight">Health Lab Overview</h1>
          <p className="text-white/60 mt-3 font-bold uppercase tracking-[0.2em] text-[10px]">Registry Status: Secure & Synchronized</p>
        </div>
        {user?.role === 'admin' && (
          <Link 
            to="/admin" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-olive rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sand transition-all shadow-xl"
          >
            <ShieldCheck className="w-4 h-4" /> System Portal
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Daily Stats */}
        <div className="lg:col-span-2 space-y-12">
           <div className="bg-sand p-10 rounded-[40px] shadow-xl border border-olive/10 transition-all hover:shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-light text-ink serif flex items-center gap-3">
                   <Activity className="w-6 h-6 text-olive" /> Biometric Rhythm
                 </h2>
                 <Link to="/log-food" className="text-[10px] font-black text-white uppercase tracking-widest bg-olive px-6 py-2.5 rounded-full hover:bg-olive/90 transition-all shadow-lg shadow-olive/20">
                   Log New Intake
                 </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                 <IntakeStat label="Calories" current={stats.calories} goal={profile.dailyCalorieGoal} unit="kcal" />
                 <IntakeStat label="Protein" current={stats.protein} goal={profile.dailyProteinGoal} unit="g" />
                 <IntakeStat label="Carbs" current={stats.carbs} goal={profile.dailyCarbGoal} unit="g" />
                 <IntakeStat label="Fat" current={stats.fat} goal={profile.dailyFatGoal} unit="g" />
              </div>
           </div>

           {/* Today's Log as a Table */}
           <div className="bg-paper p-8 rounded-[40px] border border-olive/5 shadow-xl shadow-ink/5 overflow-hidden">
              <h3 className="text-xl serif text-ink mb-6">Today's Log Entries</h3>
              {todayLogs.length === 0 ? (
                <div className="py-12 text-center bg-sand rounded-[32px] border border-dashed border-olive/20">
                   <Calendar className="w-10 h-10 text-olive/20 mx-auto mb-4" />
                   <p className="text-olive/40 text-xs font-black uppercase tracking-widest leading-loose">No documentation has been<br /> recorded for today's intake cycle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {todayLogs.map(log => (
                     <div key={log.id} className="flex items-center justify-between p-5 bg-sand rounded-3xl group border border-transparent hover:border-olive/10 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-paper rounded-full flex items-center justify-center font-black serif italic text-olive border border-olive/5">
                              {log.mealType.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-ink">{log.foodName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[9px] font-black text-olive/50 uppercase tracking-widest">{log.mealType}</span>
                                 <span className="w-1 h-1 bg-olive/20 rounded-full"></span>
                                 <span className="text-[9px] font-black text-olive/50 uppercase tracking-widest">{Number(log.calories.toFixed(2))} kcal</span>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => deleteDoc(doc(db, 'foodLogs', log.id))}
                          className="p-3 text-olive/20 hover:text-red-500 hover:bg-white rounded-full transition-all"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                </div>
              )}
           </div>

           <div>
              <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-2xl font-light text-ink serif italic">Featured Lineages</h2>
                 <Link to="/products" className="text-xs font-black text-olive uppercase tracking-widest hover:underline">Full Archive</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.slice(0, 3).map(p => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-paper p-8 rounded-[40px] shadow-2xl shadow-olive/5 border border-olive/10 group overflow-hidden relative">
              <div className="absolute -right-8 -top-8 bg-sand w-32 h-32 rounded-full opacity-50 transition-transform group-hover:scale-125 duration-700"></div>
              <h3 className="text-xl serif text-olive mb-6 relative z-10 flex items-center gap-2">
                 <Info className="w-5 h-5" /> Neural Analysis
              </h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-8 relative z-10 font-medium">Your current metabolic score is <span className="text-olive font-black">9.2/10</span>. Focus on botanical variety to optimize your rhythm.</p>
              <div className="space-y-4 relative z-10">
                 <Recommendation icon={<Leaf className="w-3 h-3" />} text="Recommended: Alpine Flora Supplement" />
                 <Recommendation icon={<Zap className="w-3 h-3" />} text="Target: Higher evening focus" />
              </div>
           </div>

           <div className="bg-ink rounded-[40px] p-8 text-white shadow-2xl shadow-olive/20 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <History className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-light serif text-cream mb-6 relative z-10">Study Registry</h3>
              <p className="text-cream/60 text-xs leading-relaxed mb-8 relative z-10 font-medium">Your research archive currently holds information on <span className="text-olive font-black">{recommendations.length}</span> prime nutritional lineages.</p>
              <Link to="/products" className="block mt-10 text-center text-[10px] font-black text-olive uppercase tracking-[0.2em] border border-white/10 rounded-full py-4 hover:bg-white/5 transition-all">
                 Browse Full Archive
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function IntakeStat({ label, current, goal, unit }: { label: string, current: number, goal: number, unit: string }) {
  const percent = Math.min((current / goal) * 100, 100);
  const displayValue = Number(current.toFixed(2));
  return (
    <div className="group">
       <div className="flex justify-between items-baseline mb-3">
          <p className="text-[10px] font-black text-olive/40 uppercase tracking-widest group-hover:text-olive transition-colors">{label}</p>
          <p className="text-sm font-bold text-ink">{Math.round(percent)}%</p>
       </div>
       <p className="text-2xl font-light text-ink serif leading-none mb-4">{displayValue} <span className="text-[10px] text-olive/40 uppercase font-black">/ {goal} {unit}</span></p>
       <div className="h-1 w-full bg-sand rounded-full overflow-hidden">
          <div className="h-full bg-olive rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}

function Recommendation({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-bold text-ink/80 hover:text-olive transition-colors cursor-pointer group">
       <div className="bg-sand p-1.5 rounded-lg text-olive group-hover:scale-110 transition-transform">{icon}</div>
       <span>{text}</span>
    </div>
  );
}
