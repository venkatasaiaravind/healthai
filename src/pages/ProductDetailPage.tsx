import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { 
  Plus, Check, ShieldCheck, ChevronRight, 
  Minus, Star, Info, CheckCircle2, AlertTriangle, 
  Leaf, FlaskConical, Scale, Award
} from 'lucide-react';
import { db } from '../lib/firebase';
import { RootState } from '../store';
import { Product } from '../types';
import { addToCompare, removeFromCompare } from '../store/slices/compareSlice';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'nutrition'>('nutrition');
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: compareItems } = useSelector((state: RootState) => state.compare);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setProduct({ id: snapshot.id, ...snapshot.data() } as Product);
        } else {
          toast.error('Product not found');
        }
      } catch (error) {
        console.error('Fetch error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const isComparing = product ? compareItems.some(item => item.id === product.id) : false;

  const handleCompare = () => {
    if (!product) return;
    if (isComparing) {
      dispatch(removeFromCompare(product.id));
      toast.success('Removed from study');
    } else {
      if (compareItems.length >= 4) {
        toast.error('Maximum 4 items for comparison');
        return;
      }
      dispatch(addToCompare(product));
      toast.success('Added to research lab');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500 border-green-500 bg-green-50';
    if (score >= 50) return 'text-yellow-500 border-yellow-500 bg-yellow-50';
    return 'text-red-500 border-red-500 bg-red-50';
  };

  if (loading) return (
    <div className="container mx-auto px-6 py-20 animate-pulse">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="aspect-square bg-white rounded-3xl"></div>
         <div className="space-y-6">
            <div className="h-10 bg-white w-2/3 rounded-xl"></div>
            <div className="h-6 bg-white w-1/2 rounded-xl"></div>
            <div className="h-20 bg-white w-full rounded-xl"></div>
         </div>
       </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
        <Link to="/" className="hover:text-green-500">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-green-500">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
        {/* Left - Image */}
        <div className="relative">
          <div className="aspect-square rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-2xl shadow-green-900/5 group">
            <img 
              src={product.imageURL} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 md:-left-12 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 hidden sm:block">
            <div className="flex items-center gap-4">
               <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center font-black ${getScoreColor(product.healthScore)}`}>
                 <span className="text-xl">{product.healthScore}</span>
                 <span className="text-[10px] uppercase">AI SCORE</span>
               </div>
               <div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{product.healthCategory}</p>
                  <p className="text-xs text-gray-500 font-medium">Safe for your profile</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right - Info */}
        <div className="flex flex-col">
          <header className="mb-8">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">{product.brand}</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                 <span className="text-sm font-bold text-gray-500 ml-1">4.5 (128 reviews)</span>
               </div>
               <div className="h-4 w-px bg-gray-200"></div>
               <p className="text-sm font-bold text-green-600 uppercase tracking-widest">{product.category}</p>
            </div>
          </header>

          <div className="bg-gray-50 p-8 rounded-3xl mb-8 border border-gray-100">
             <div className="flex flex-wrap gap-2 mb-6">
               {product.healthBadges.map((badge, i) => (
                 <span key={i} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-gray-700 border border-gray-200 flex items-center gap-2 uppercase tracking-widest">
                   <CheckCircle2 className="w-3 h-3 text-green-500" /> {badge}
                 </span>
               ))}
             </div>
             <p className="text-gray-600 leading-relaxed mb-6 italic">"{product.description}"</p>
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Public Archive Asset</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCompare}
                className={`flex-grow font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95 ${isComparing ? 'bg-olive text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {isComparing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isComparing ? 'In Research Lab' : 'Add to Comparison'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <Feature icon={<Award className="w-4 h-4" />} text="100% Quality Assurance" />
               <FilterIcon icon={<FlaskConical className="w-4 h-4" />} text="Lab Tested" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[40px] overflow-hidden border border-gray-50 shadow-xl shadow-green-900/5">
             <div className="flex border-b border-gray-50">
               <button 
                onClick={() => setActiveTab('nutrition')} 
                className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'nutrition' ? 'text-green-600 bg-green-50/30' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Nutrition Facts
                 {activeTab === 'nutrition' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />}
               </button>
               <button 
                onClick={() => setActiveTab('ingredients')} 
                className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'ingredients' ? 'text-green-600 bg-green-50/30' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Full Ingredients
                 {activeTab === 'ingredients' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />}
               </button>
             </div>

             <div className="p-10">
               {activeTab === 'nutrition' ? (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-8">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Serving Size</p>
                          <p className="text-xl font-bold text-gray-900">{product.nutritionFacts.servingSize}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Calories</p>
                          <p className="text-xl font-black text-gray-900">{Number(product.nutritionFacts.calories.toFixed(2))} kcal</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                       <NutrientRow label="Total Protein" value={Number(product.nutritionFacts.protein.toFixed(2))} unit="g" daily={15} />
                       <NutrientRow label="Carbohydrates" value={Number(product.nutritionFacts.carbohydrates.toFixed(2))} unit="g" daily={8} />
                       <NutrientRow label="Dietary Fiber" value={Number(product.nutritionFacts.fiber.toFixed(2))} unit="g" daily={20} />
                       <NutrientRow label="Added Sugar" value={Number(product.nutritionFacts.sugar.toFixed(2))} unit="g" daily={2} isNegative />
                       <NutrientRow label="Total Fat" value={Number(product.nutritionFacts.fat.toFixed(2))} unit="g" daily={10} />
                       <NutrientRow label="Trans Fat" value={Number(product.nutritionFacts.transFat.toFixed(2))} unit="g" daily={0} isNegative />
                       <NutrientRow label="Sodium" value={Number(product.nutritionFacts.sodium.toFixed(2))} unit="mg" daily={5} isNegative />
                    </div>
                 </div>
               ) : (
                 <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Ingredients List</h4>
                    <p className="text-gray-600 leading-relaxed text-lg font-medium">{product.ingredientsText}</p>
                    <div className="mt-10 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                       <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                       <div>
                          <p className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Allergen Warning</p>
                          <p className="text-xs text-red-700 font-medium leading-relaxed">Contains: Dairy, Glue, and traces of processed items. Please check if you have any restrictions.</p>
                       </div>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Breakdown Sidebar */}
        <div className="space-y-8">
           <div className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-xl shadow-green-900/5">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <Leaf className="w-5 h-5 text-green-500" /> AI Breakdown
              </h3>
              
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">Positives</h4>
                    <ul className="space-y-3">
                       {product.scoreExplanation.positives.map((pos, i) => (
                         <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                               <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            {pos}
                         </li>
                       ))}
                    </ul>
                 </div>
                 
                 <div>
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Considerations</h4>
                    <ul className="space-y-3">
                       {product.scoreExplanation.negatives.map((neg, i) => (
                         <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                               <AlertTriangle className="w-3 h-3 text-white" />
                            </div>
                            {neg}
                         </li>
                       ))}
                    </ul>
                 </div>

                 <div className="pt-6 border-t border-gray-50">
                    <p className="text-xs text-gray-400 italic">"Based on WHO and FSSAI guidelines for daily consumption. This score is personalized to your activity levels."</p>
                 </div>
              </div>
           </div>

           <div className="bg-green-600 rounded-[40px] p-8 text-white shadow-xl shadow-green-900/20 group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Info className="w-24 h-24" />
              </div>
              <h4 className="text-lg font-black mb-4 relative z-10">AI Summary</h4>
              <p className="text-green-50 leading-relaxed text-sm relative z-10">{product.scoreExplanation.summary}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function NutrientRow({ label, value, unit, daily, isNegative = false }: { label: string, value: number, unit: string, daily: number, isNegative?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
         <div className={`w-1 h-1 rounded-full ${isNegative ? 'bg-red-400' : 'bg-green-400'}`}></div>
         <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-sm font-black mr-4 ${isNegative && value > 10 ? 'text-red-500' : 'text-gray-900'}`}>{value}{unit}</span>
        {daily > 0 && <span className="text-[10px] font-black text-gray-300 uppercase">{daily}%</span>}
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-50">
       <div className="bg-green-50 p-2 rounded-xl text-green-600">{icon}</div>
       <span className="text-xs font-bold text-gray-700">{text}</span>
    </div>
  );
}

function FilterIcon({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-50">
       <div className="bg-blue-50 p-2 rounded-xl text-blue-600">{icon}</div>
       <span className="text-xs font-bold text-gray-700">{text}</span>
    </div>
  );
}
