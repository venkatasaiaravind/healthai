import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { removeFromCompare, clearCompare } from '../store/slices/compareSlice';
import { 
  Scale, X, Star, ShieldCheck, Flame, Beef, 
  Activity, AlertCircle, ArrowLeft, Trash2,
  Info, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export default function ComparisonPage() {
  const { items } = useSelector((state: RootState) => state.compare);
  const dispatch = useDispatch();

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 italic capitalize">
             <Scale className="w-8 h-8 text-green-500" /> Research Lab
           </h1>
           <p className="text-gray-500 mt-2 font-medium">Side-by-side comparative analysis of up to 4 selected archive assets.</p>
        </div>
        <div className="flex items-center gap-4">
          {items.length > 0 && (
            <button 
              onClick={() => dispatch(clearCompare())}
              className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-full transition-all"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
          <Link to="/products" className="flex items-center gap-2 px-6 py-3 bg-olive text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-olive/90 transition-all shadow-xl shadow-olive/10">
            <ArrowLeft className="w-4 h-4" /> Add Asset
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-gray-50 shadow-2xl shadow-green-900/5">
           <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-green-200" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Your Lab is Empty</h2>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Select products from the library to begin research</p>
           <Link to="/products" className="mt-8 inline-block text-green-500 font-black hover:underline uppercase tracking-[0.2em] text-sm">Browse Archive Archive</Link>
        </div>
      ) : (
        <div className="relative overflow-x-auto pb-10">
          <div className={`grid gap-px bg-gray-100 border border-gray-100 rounded-[48px] overflow-hidden shadow-2xl shadow-green-900/10 min-w-[300px * ${items.length}]`} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(300px, 1fr))` }}>
            {items.map((product) => (
              <ProductComparisonColumn key={product.id} product={product} onRemove={() => dispatch(removeFromCompare(product.id))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductComparisonColumn({ product, onRemove }: { product: Product, onRemove: () => void }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500 border-green-500 bg-white';
    if (score >= 50) return 'text-yellow-500 border-yellow-500 bg-white';
    return 'text-red-500 border-red-500 bg-white';
  };

  return (
    <div className="bg-white p-10 flex flex-col h-full relative group">
       <button 
         onClick={onRemove}
         className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-20"
       >
         <X className="w-4 h-4" />
       </button>

       <div className="flex flex-col items-center text-center mb-12">
          <div className="w-40 h-40 rounded-3xl overflow-hidden mb-6 border-4 border-sand shadow-xl group-hover:scale-105 transition-transform duration-700 bg-white">
             <img src={product.imageURL} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
          </div>
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{product.brand}</p>
          <h2 className="text-xl font-black text-gray-900 mb-6 min-h-[56px] leading-tight serif italic">{product.name}</h2>
          <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-black shadow-lg ${getScoreColor(product.healthScore)}`}>
             <span className="text-2xl">{product.healthScore}</span>
             <span className="text-[8px] uppercase tracking-tighter opacity-70">Research Score</span>
          </div>
       </div>

        <div className="space-y-1 mb-10">
           <CompareRow label="Category" value={product.category} />
           <CompareRow label="Serv. Size" value={product.nutritionFacts.servingSize} />
           <CompareRow label="Calories" value={`${Number(product.nutritionFacts.calories.toFixed(2))} kcal`} icon={<Flame className="w-3 h-3" />} />
           <CompareRow label="Protein" value={`${Number(product.nutritionFacts.protein.toFixed(2))}g`} icon={<Beef className="w-3 h-3" />} />
           <CompareRow label="Fats" value={`${Number(product.nutritionFacts.fat.toFixed(2))}g`} icon={<Activity className="w-3 h-3" />} />
           <CompareRow label="Sugar" value={`${Number(product.nutritionFacts.sugar.toFixed(2))}g`} isNegative />
           <CompareRow label="Sodium" value={`${Number(product.nutritionFacts.sodium.toFixed(2))}mg`} isNegative />
           <CompareRow label="Health Badges" value={product.healthBadges.length} />
           <CompareRow label="High Purity" value={product.isFssaiApproved ? "VERIFIED" : "PENDING"} />
        </div>

       <div className="mt-auto bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Info className="w-3 h-3" /> Core Analysis
          </p>
          <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic line-clamp-4">
            "{product.scoreExplanation.summary}"
          </p>
       </div>

       <Link 
        to={`/products/${product.id}`} 
        className="mt-8 w-full bg-olive/5 text-olive font-black py-4 rounded-2xl text-center text-[10px] uppercase tracking-[0.2em] border border-olive/10 hover:bg-olive hover:text-white transition-all"
       >
         Deep Study Archive
       </Link>
    </div>
  );
}

function CompareRow({ label, value, icon, isNegative }: { label: string, value: any, icon?: any, isNegative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 group hover:translate-x-1 transition-all">
       <div className="flex items-center gap-2">
          {icon && <span className="text-green-500/40">{icon}</span>}
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
       </div>
       <span className={`text-xs font-black ${isNegative && Number(value.toString().replace(/\D/g,'')) > 10 ? 'text-red-500' : 'text-gray-900 group-hover:text-green-600'}`}>{value}</span>
    </div>
  );
}
