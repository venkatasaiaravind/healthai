import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) return;
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const filtered = all.filter(p => 
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.brand.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
        );
        
        setProducts(filtered);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q]);

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-gray-900 italic capitalize">Search Results</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Found {products.length} items for "{q}"</p>
         </div>
         <Link to="/products" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-500 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Library
         </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scanning high-integrity records...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-100">
           <Search className="w-16 h-16 text-gray-100 mx-auto mb-6" />
           <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h2>
           <p className="text-gray-500 mb-8">Try searching for ingredients, categories, or overall health goals.</p>
           <Link to="/products" className="bg-green-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-500/20">Explore All Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
