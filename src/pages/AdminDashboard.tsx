import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  Users, ShoppingBag, ListOrdered, BarChart3, 
  Settings, Plus, Trash2, Edit, ExternalLink,
  ShieldCheck, Package, DollarSign, TrendingUp, Database
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Product, Order, User } from '../types';
import { seedProducts } from '../lib/seedData';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-400 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 text-white mb-6">
           <ShieldCheck className="w-8 h-8 text-purple-500" />
           <span className="text-xl font-bold uppercase tracking-tighter">Admin Portal</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
           <AdminNavLink to="/admin" icon={<BarChart3 className="w-4 h-4" />} label="Overview" />
           <AdminNavLink to="/admin/products" icon={<ShoppingBag className="w-4 h-4" />} label="Manage Products" />
           <AdminNavLink to="/admin/orders" icon={<ListOrdered className="w-4 h-4" />} label="Orders" />
           <AdminNavLink to="/admin/users" icon={<Users className="w-4 h-4" />} label="Users" />
           <AdminNavLink to="/admin/analytics" icon={<TrendingUp className="w-4 h-4" />} label="Analytics" />
        </nav>

        <div className="pt-8 border-t border-gray-800">
           <Link to="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors text-sm font-bold">
              <ExternalLink className="w-4 h-4" /> Back to App
           </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-grow p-10">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<div className="font-bold text-gray-400">User Management coming soon...</div>} />
          <Route path="/analytics" element={<div className="font-bold text-gray-400">Full Analytics coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
}

function AdminOverview() {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('This will add 100 sample products to the database. Proceed?')) return;
    setSeeding(true);
    const toastId = toast.loading('Seeding 100 products... This may take a moment.');
    try {
      const count = await seedProducts(100);
      toast.success(`Successfully added ${count} products!`, { id: toastId });
    } catch (error) {
      toast.error('Failed to seed products. Check permissions.', { id: toastId });
      console.error(error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-10">
       <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Commerce Overview</h1>
            <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-[10px]">System integrity is nominal</p>
          </div>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all border border-gray-700 hover:border-gray-500"
          >
            <Database className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <OverviewCard icon={<Users className="text-blue-500" />} label="Total Users" value="1,284" trend="+12%" />
          <OverviewCard icon={<Package className="text-green-500" />} label="Products" value="245" trend="Live" />
          <OverviewCard icon={<ListOrdered className="text-purple-500" />} label="Orders" value="842" trend="+5.4k revenue" />
          <OverviewCard icon={<DollarSign className="text-orange-500" />} label="Revenue" value="₹24.8k" trend="Target 92%" />
       </div>

       <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-green-900/5 min-h-[300px] flex items-center justify-center border border-gray-100">
          <p className="text-gray-300 font-bold uppercase tracking-widest">Global Activity Metric Chart Placeholder</p>
       </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
     if (!window.confirm('Delete this product?')) return;
     try {
       await deleteDoc(doc(db, 'products', id));
       setProducts(products.filter(p => p.id !== id));
       toast.success('Product deleted');
     } catch (error) {
       toast.error('Failed to delete');
     }
  };

  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Manage Inventory</h1>
            <p className="text-gray-500">Configure and monitor your health product catalog.</p>
          </div>
          <Link to="/admin/products/add" className="bg-purple-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 shadow-xl shadow-purple-500/20 transition-all">
             <Plus className="w-5 h-5" /> Add New Product
          </Link>
       </header>

       <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-green-900/5">
          <table className="w-full text-left">
             <thead className="bg-gray-900 text-white">
                <tr>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest">Product</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Score</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">FSSAI</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Price</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Stock</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-4">
                          <img src={p.imageURL} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                             <p className="text-sm font-bold text-gray-900">{p.name}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.brand}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${p.healthScore >= 70 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {p.healthScore}
                       </span>
                    </td>
                    <td className="p-6 text-center">
                       {p.isFssaiApproved ? <ShieldCheck className="w-5 h-5 text-blue-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mx-auto"></div>}
                    </td>
                    <td className="p-6 text-center text-sm font-black">₹{p.price}</td>
                    <td className="p-6 text-center text-sm font-bold text-gray-400">{p.stockQuantity}</td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {loading && <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Loading secure inventory data...</div>}
       </div>
    </div>
  );
}

function AdminOrders() {
   return <div className="font-bold text-gray-400">Order management coming soon in 1.1 update.</div>;
}

function AdminNavLink({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-white/5 hover:text-white transition-all">
       {icon} {label}
    </Link>
  );
}

function OverviewCard({ icon, label, value, trend }: { icon: any, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5">
       <div className="bg-gray-50 p-2 rounded-xl w-fit mb-4">{icon}</div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-baseline justify-between">
          <p className="text-2xl font-black text-gray-900">{value}</p>
          <span className="text-[10px] font-black text-green-500">{trend}</span>
       </div>
    </div>
  );
}
