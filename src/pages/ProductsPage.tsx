import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List as ListIcon } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('healthScore');

  const categories = ['All', 'Protein', 'Vitamins', 'Superfoods', 'Organic', 'Herbal', 'Supplements'];
  const [filters, setFilters] = useState({
    fssai: false,
    fda: false,
    highProtein: false,
    lowSugar: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy(sortBy, 'desc'));
        
        if (category !== 'All') {
          q = query(q, where('category', '==', category));
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Apply Search
        if (searchTerm) {
          results = results.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        // Apply Quick Filters
        if (filters.fssai) {
          results = results.filter(p => p.isFssaiApproved);
        }
        if (filters.fda) {
          results = results.filter(p => p.isFdaApproved);
        }
        if (filters.highProtein) {
          results = results.filter(p => p.tags.some(t => t.toLowerCase().includes('protein')));
        }
        if (filters.lowSugar) {
          results = results.filter(p => p.tags.some(t => t.toLowerCase().includes('low sugar') || t.toLowerCase().includes('no sugar')));
        }

        setProducts(results);
      } catch (error) {
        console.error('Fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, searchTerm, filters]);

  return (
    <div className="container mx-auto px-6 py-12 pt-28 bg-cream min-h-screen">
      <header className="mb-12 bg-olive p-10 rounded-[40px] text-white shadow-2xl shadow-olive/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl w-full text-center md:text-left">
           <h1 className="text-5xl font-light serif italic mb-2">Botanical Library</h1>
           <p className="text-white/60 font-medium tracking-wide">Every product is scored by our AI for nutritional value and clinical safety.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search archive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 outline-none transition-all text-xs font-black uppercase tracking-widest"
            />
          </div>
          <button className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 space-y-10">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${category === cat ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Filters</h3>
            <div className="space-y-3">
               <FilterToggle label="FSSAI Approved" active={filters.fssai} onChange={v => setFilters({...filters, fssai: v})} />
               <FilterToggle label="Fda Approved" active={filters.fda} onChange={v => setFilters({...filters, fda: v})} />
               <FilterToggle label="High Protein" active={filters.highProtein} onChange={v => setFilters({...filters, highProtein: v})} />
               <FilterToggle label="Low Sugar" active={filters.lowSugar} onChange={v => setFilters({...filters, lowSugar: v})} />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-bold text-gray-400">Showing <span className="text-gray-900">{products.length}</span> results</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white border border-gray-50 rounded-xl p-1">
                 <button className="p-2 rounded-lg bg-green-50 text-green-600"><LayoutGrid className="w-4 h-4" /></button>
                 <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-all"><ListIcon className="w-4 h-4" /></button>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-50 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="healthScore">Health Score Index</option>
                <option value="name">Archival A-Z</option>
                <option value="createdAt">Latest Catalog</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white h-96 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100">
               <p className="text-xl font-bold text-gray-400">No products found matching your criteria.</p>
               <button onClick={() => {setCategory('All'); setSearchTerm('');}} className="mt-4 text-green-500 font-bold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterToggle({ label, active, onChange }: { label: string, active: boolean, onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!active)}
      className="w-full flex items-center justify-between group"
    >
      <span className={`text-sm font-medium transition-colors ${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-green-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`}></div>
      </div>
    </button>
  );
}
