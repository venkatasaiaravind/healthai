import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, Target, ShieldAlert, Calculator, ArrowRight, ArrowLeft, Save, HeartPulse } from 'lucide-react';
import { db } from '../lib/firebase';
import { RootState } from '../store';
import { setProfile } from '../store/slices/authSlice';
import { UserProfile } from '../types';

export default function SetupProfilePage() {
  const [step, setStep] = useState(1);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    uid: user?.uid,
    age: 25,
    gender: 'male',
    weightKg: 70,
    heightCm: 170,
    activityLevel: 'moderate',
    goalType: 'maintain',
    healthConditions: [],
    allergies: [],
    dietaryPreference: 'none',
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbGoal: 200,
    dailyFatGoal: 65,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const calculateGoals = () => {
    // Simplified Mifflin-St Jeor Equation
    let bmr = 10 * (formData.weightKg || 70) + 6.25 * (formData.heightCm || 170) - 5 * (formData.age || 25);
    bmr = formData.gender === 'male' ? bmr + 5 : bmr - 161;

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * (multipliers[formData.activityLevel || 'moderate']);

    if (formData.goalType === 'lose_weight') tdee -= 500;
    if (formData.goalType === 'gain_muscle') tdee += 500;

    const calorieGoal = Math.round(tdee);
    const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
    const carbGoal = Math.round((calorieGoal * 0.4) / 4);
    const fatGoal = Math.round((calorieGoal * 0.3) / 9);

    setFormData(prev => ({
      ...prev,
      dailyCalorieGoal: calorieGoal,
      dailyProteinGoal: proteinGoal,
      dailyCarbGoal: carbGoal,
      dailyFatGoal: fatGoal,
    }));
    
    toast.success('Goals calculated based on your profile!');
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const fullProfile = {
        ...formData,
        uid: user.uid, // Explicitly ensure UID is correct
        updatedAt: new Date(),
      } as UserProfile;
      
      await setDoc(doc(db, 'userProfiles', user.uid), fullProfile);
      dispatch(setProfile(fullProfile));
      toast.success('Health profile saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to save profile: ' + error.message);
    }
  };

  const toggleSelection = (field: 'healthConditions' | 'allergies', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-green-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <HeartPulse className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-gray-900">Set Up Your Health Profile</h1>
          <p className="text-gray-500 mt-2">This helps us personalize recommendations and scores for you.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2 flex-grow rounded-full transition-all duration-500 ${step >= i ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 md:p-12 min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formData.weightKg}
                      onChange={(e) => setFormData({...formData, weightKg: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Height (cm)</label>
                    <input 
                      type="number" 
                      value={formData.heightCm}
                      onChange={(e) => setFormData({...formData, heightCm: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Activity Level</label>
                    <select 
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({...formData, activityLevel: e.target.value as any})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none"
                    >
                      <option value="sedentary">Sedentary (Little/no exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very_active">Very Active (Physical job/2x day)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['lose_weight', 'maintain', 'gain_muscle'].map(goal => (
                         <button 
                          key={goal}
                          onClick={() => setFormData({...formData, goalType: goal as any})}
                          className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider border-2 transition-all ${formData.goalType === goal ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                         >
                           {goal.replace('_', ' ')}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 p-2 rounded-xl text-red-500">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Conditions & Restrictions</h3>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Health Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {['Diabetes', 'Hypertension', 'Heart Disease', 'Obesity', 'Thyroid', 'PCOS', 'None'].map(c => (
                      <button 
                        key={c}
                        onClick={() => toggleSelection('healthConditions', c)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${formData.healthConditions?.includes(c) ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'None'].map(a => (
                      <button 
                        key={a}
                        onClick={() => toggleSelection('allergies', a)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${formData.allergies?.includes(a) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Preference</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['none', 'vegetarian', 'vegan', 'keto', 'paleo'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setFormData({...formData, dietaryPreference: d})}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold capitalize transition-all border ${formData.dietaryPreference === d ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-xl text-green-600">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Nutrition Goals</h3>
                </div>

                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 mb-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-2/3">
                    <p className="text-sm font-bold text-green-800 mb-1">Use AI Calculation</p>
                    <p className="text-xs text-green-600 leading-relaxed">Let our health engine calculate your ideal daily goals based on your metabolism, activity, and goals.</p>
                  </div>
                  <button 
                    onClick={calculateGoals}
                    className="w-full md:w-auto bg-green-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    Calculate <Zap className="w-4 h-4 fill-white" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Calories</p>
                    <input 
                      type="number" 
                      value={formData.dailyCalorieGoal}
                      onChange={(e) => setFormData({...formData, dailyCalorieGoal: Number(e.target.value)})}
                      className="bg-transparent text-xl font-bold text-gray-900 w-full outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Protein (g)</p>
                    <input 
                      type="number" 
                      value={formData.dailyProteinGoal}
                      onChange={(e) => setFormData({...formData, dailyProteinGoal: Number(e.target.value)})}
                      className="bg-transparent text-xl font-bold text-gray-900 w-full outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carbs (g)</p>
                    <input 
                      type="number" 
                      value={formData.dailyCarbGoal}
                      onChange={(e) => setFormData({...formData, dailyCarbGoal: Number(e.target.value)})}
                      className="bg-transparent text-xl font-bold text-gray-900 w-full outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fat (g)</p>
                    <input 
                      type="number" 
                      value={formData.dailyFatGoal}
                      onChange={(e) => setFormData({...formData, dailyFatGoal: Number(e.target.value)})}
                      className="bg-transparent text-xl font-bold text-gray-900 w-full outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between border-t border-gray-50 pt-8">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 font-bold transition-all ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            
            {step < 3 ? (
              <button 
                onClick={nextStep}
                className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-600 shadow-xl shadow-green-500/20 transition-all flex items-center gap-2"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-600 shadow-xl shadow-green-500/20 transition-all flex items-center gap-2"
              >
                Complete Setup <Save className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Zap({ className, fill }: { className?: string, fill?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14.71 14 3l-1.08 7.29H20L10 21l1.08-7.29H4Z" />
    </svg>
  );
}
