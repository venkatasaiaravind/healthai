import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Plus, Check, Star, ShieldCheck, Heart } from 'lucide-react';
import { RootState } from '../store';
import { Product } from '../types';
import { addToCompare, removeFromCompare } from '../store/slices/compareSlice';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  key?: React.Key;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: compareItems } = useSelector((state: RootState) => state.compare);
  const dispatch = useDispatch();

  const isComparing = compareItems.some(item => item.id === product.id);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    if (score >= 70) return 'text-olive border-olive bg-sand';
    if (score >= 50) return 'text-orange-600 border-orange-200 bg-orange-50';
    return 'text-red-500 border-red-100 bg-red-50';
  };

  if (compact) {
    return (
      <Link to={`/products/${product.id}`} className="block group">
        <div className="bg-paper rounded-[32px] p-3 border border-olive/5 shadow-lg shadow-ink/5 hover:translate-y-[-4px] transition-all duration-500 h-full flex flex-col">
          <div className="relative aspect-square rounded-[24px] overflow-hidden mb-3 bg-white shadow-inner">
            <img 
              src={product.imageURL} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className={`absolute top-2 right-2 w-8 h-8 rounded-full border flex items-center justify-center font-black text-[10px] shadow-sm backdrop-blur-sm ${getScoreColor(product.healthScore)}`}>
              {product.healthScore}
            </div>
          </div>
          <h4 className="text-[10px] font-black text-olive/40 uppercase tracking-widest truncate">{product.brand}</h4>
          <h3 className="text-xs font-bold text-ink truncate mb-1 serif">{product.name}</h3>
          <p className="text-[10px] font-bold text-olive/60 mt-auto uppercase tracking-tighter">Reference Archive</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-paper rounded-[40px] p-6 border border-olive/5 shadow-2xl shadow-ink/5 hover:translate-y-[-8px] transition-all duration-700 group flex flex-col h-full overflow-hidden relative">
      <Link to={`/products/${product.id}`} className="relative aspect-square rounded-[32px] overflow-hidden mb-8 bg-white shadow-inner block border-4 border-sand/50">
        <img 
          src={product.imageURL} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
           <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-xl font-black backdrop-blur-md ${getScoreColor(product.healthScore)}`}>
             <span className="text-lg leading-none">{product.healthScore}</span>
             <span className="text-[8px] uppercase tracking-tighter opacity-70">Research Score</span>
           </div>
        </div>
        {product.isFssaiApproved && (
           <div className="absolute bottom-4 left-4 bg-paper/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-olive/10">
             <ShieldCheck className="w-3 h-3 text-olive" />
             <span className="text-[10px] font-black text-olive uppercase tracking-[0.2em]">High Purity</span>
           </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-olive/40 uppercase tracking-[0.2em]">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-olive" />
            <span className="text-[10px] font-bold text-olive/50">4.5</span>
          </div>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-xl font-light text-ink mb-4 group-hover:text-olive transition-colors serif italic line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex flex-wrap gap-2 mb-6">
          {product.healthBadges.slice(0, 2).map((badge, i) => (
            <span key={i} className="text-[9px] font-black bg-sand text-olive px-3 py-1.5 rounded-full uppercase tracking-widest border border-olive/5">{badge}</span>
          ))}
        </div>
        
        <div className="mt-auto pt-6 border-t border-olive/5 flex items-center justify-between">
          <Link 
            to={`/products/${product.id}`}
            className="text-[10px] font-black text-olive uppercase tracking-[0.2em] hover:underline"
          >
            Study Analysis
          </Link>
          <div className="flex gap-3">
            <button 
              onClick={handleCompare}
              className={`p-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 group/btn ${isComparing ? 'bg-olive text-white' : 'bg-sand text-olive hover:bg-olive/10'}`}
            >
              {isComparing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block">Compare</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
