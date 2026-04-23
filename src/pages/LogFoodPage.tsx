import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Utensils, Plus, Trash2, Search, Calendar, ChevronRight, Activity } from 'lucide-react';
import { db } from '../lib/firebase';
import { RootState } from '../store';
import { FoodLog, Product } from '../types';

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function LogFoodPage() {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleAiCalculate = async (explicitName?: string) => {
    const targetName = explicitName || foodName;
    if (!targetName.trim()) {
      toast.error('Please enter a food name first');
      return null;
    }

    setCalculating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Expertly estimate the nutritional facts for "${targetName}". If the quantity is specified (e.g. "2 bananas"), calculate for exactly that amount. Provide total values for the entire quantity.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER, description: "Total calories for the entire portion" },
              protein: { type: Type.NUMBER, description: "Total protein in grams" },
              carbohydrates: { type: Type.NUMBER, description: "Total carbohydrates in grams" },
              fat: { type: Type.NUMBER, description: "Total fat in grams" },
            },
            required: ["calories", "protein", "carbohydrates", "fat"],
          }
        }
      });

      const data = JSON.parse(response.text);
      setCalories(data.calories);
      setProtein(data.protein);
      setCarbs(data.carbohydrates);
      setFat(data.fat);
      toast.success('AI Estimates synchronized!');
      return data;
    } catch (error) {
      console.error('AI Calculation error', error);
      toast.error('AI failed to estimate nutritional values');
      return null;
    } finally {
      setCalculating(false);
    }
  };

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
      // Sort by loggedAt (newest first)
      const sortedLogs = [...logs].sort((a, b) => {
        const timeA = a.loggedAt?.seconds || 0;
        const timeB = b.loggedAt?.seconds || 0;
        return timeB - timeA;
      });
      setTodayLogs(sortedLogs);
    }, (error) => {
      console.error("Food logs listener failed:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const q = query(
        collection(db, 'products'),
        where('tags', 'array-contains', searchQuery.toLowerCase())
      );
      const snapshot = await getDocs(q);
      setSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    let currentCalories = calories;
    let currentProtein = protein;
    let currentCarbs = carbs;
    let currentFat = fat;

    // If zero values and name is present, try auto-calculating before saving
    if (foodName.trim() && currentCalories === 0 && currentProtein === 0 && currentCarbs === 0 && currentFat === 0) {
      setLoading(true);
      const aiData = await handleAiCalculate(foodName);
      if (aiData) {
        currentCalories = aiData.calories;
        currentProtein = aiData.protein;
        currentCarbs = aiData.carbohydrates;
        currentFat = aiData.fat;
      }
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'foodLogs'), {
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        mealType,
        foodName,
        calories: currentCalories,
        protein: currentProtein,
        carbs: currentCarbs,
        fat: currentFat,
        loggedAt: new Date(),
      });
      toast.success('Meal logged!');
      setFoodName('');
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
    } catch (error) {
      toast.error('Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (p: Product) => {
    setFoodName(p.name);
    setCalories(p.nutritionFacts.calories);
    setProtein(p.nutritionFacts.protein);
    setCarbs(p.nutritionFacts.carbohydrates);
    setFat(p.nutritionFacts.fat);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'foodLogs', id));
      toast.success('Entry removed');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const totals = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + log.protein,
    carbs: acc.carbs + log.carbs,
    fat: acc.fat + log.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="container mx-auto px-6 py-12 pt-28 bg-cream min-h-screen max-w-5xl">
      <header className="mb-12 bg-olive p-10 rounded-[40px] text-white shadow-2xl shadow-olive/20">
        <h1 className="text-4xl font-light serif italic">Daily Intake Documentation</h1>
        <p className="text-white/60 mt-2 font-bold uppercase tracking-widest text-xs">Precisely catalog your nutritional interactions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Form */}
         <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-green-900/5 border border-gray-100">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Plus className="w-5 h-5 text-green-500" /> Log a New Meal
            </h3>
            
            <div className="mb-6 relative">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Library</label>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search from products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all text-sm"
                  />
               </div>
               {searchResults.length > 0 && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-10 max-h-48 overflow-y-auto p-2">
                    {searchResults.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => selectProduct(p)}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-between group"
                      >
                        {p.name} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                 </div>
               )}
            </div>

            <form onSubmit={handleLogFood} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Meal Type</label>
                    <select 
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                    >
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snack</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Food Name</label>
                      <button 
                        type="button"
                        onClick={handleAiCalculate}
                        disabled={calculating || !foodName.trim()}
                        className="text-[10px] font-black text-green-500 hover:text-green-600 uppercase tracking-widest flex items-center gap-1 transition-all disabled:opacity-30"
                      >
                         <Activity className={`w-3 h-3 ${calculating ? 'animate-pulse' : ''}`} /> {calculating ? 'Analyzing...' : 'Magic AI Calculate'}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      onBlur={() => {
                        if (foodName.trim() && calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
                          handleAiCalculate();
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all"
                      placeholder="e.g. 2 Scrambled Eggs with spinach"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Calories</label>
                    <input 
                      type="number" 
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Protein (g)</label>
                    <input 
                      type="number" 
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carbs (g)</label>
                    <input 
                      type="number" 
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fat (g)</label>
                    <input 
                      type="number" 
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                    />
                  </div>
               </div>
               <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-500 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95 mt-4"
               >
                 {loading ? 'Logging...' : 'Add Engagement Entry'}
               </button>
            </form>
         </div>

         {/* Today's Stats */}
         <div className="space-y-8">
            <div className="bg-gray-900 rounded-[40px] p-8 text-white">
               <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-500" /> Daily Summary
               </h3>
               
               <div className="grid grid-cols-2 gap-8">
                  <StatItem label="Calories" value={totals.calories} goal={profile?.dailyCalorieGoal || 2000} unit="kcal" />
                  <StatItem label="Protein" value={totals.protein} goal={profile?.dailyProteinGoal || 150} unit="g" />
                  <StatItem label="Carbs" value={totals.carbs} goal={profile?.dailyCarbGoal || 200} unit="g" />
                  <StatItem label="Fat" value={totals.fat} goal={profile?.dailyFatGoal || 65} unit="g" />
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-green-900/5">
                <h3 className="text-lg font-bold mb-4">Meal History</h3>
                <div className="space-y-4">
                   {todayLogs.length === 0 ? (
                     <div className="text-center py-10 border-2 border-dashed border-gray-50 rounded-3xl">
                        <Utensils className="w-10 h-10 text-gray-100 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No entries yet</p>
                     </div>
                   ) : (
                     todayLogs.map(log => (
                       <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                          <div>
                             <p className="text-sm font-bold text-gray-900">{log.foodName}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-green-600 uppercase">{log.mealType}</span>
                                <span className="text-[10px] text-gray-400">• {Number(log.calories.toFixed(2))} kcal</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(log.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                     ))
                   )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, goal, unit }: { label: string, value: number, goal: number, unit: string }) {
  const percent = Math.min((value / goal) * 100, 100);
  const displayValue = Number(value.toFixed(2));
  return (
    <div>
       <div className="flex justify-between items-baseline mb-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black">{Math.round(percent)}%</p>
       </div>
       <p className="text-xl font-black mb-2">{displayValue} <span className="text-xs text-gray-500 font-bold tracking-tight">/ {goal} {unit}</span></p>
       <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}
