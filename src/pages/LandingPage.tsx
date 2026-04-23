import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf, ShieldCheck, MessageSquare, BarChart3, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-block px-6 py-2 bg-olive/5 border border-olive/20 rounded-full text-olive text-xs font-bold uppercase tracking-[0.2em]">
              AI DIETARY ARCHIVE
            </div>
            <h1 className="text-7xl md:text-8xl font-light text-ink leading-[0.95] serif">
              Preserve your <br /><i className="italic">Vital</i> Rhythm
            </h1>
            <p className="text-ink/70 text-lg max-w-lg leading-relaxed font-sans">
              A digital sanctuary and high-integrity database dedicated to the restoration of optimal health through botanical lineages and AI precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/register" 
                className="bg-olive text-white px-10 py-5 rounded-full font-bold shadow-2xl shadow-olive/20 hover:bg-olive/90 transition-all text-center uppercase tracking-widest text-sm"
              >
                Join the Sanctuary
              </Link>
              <Link 
                to="/products" 
                className="bg-sand text-olive px-10 py-5 rounded-full font-bold border border-olive/10 hover:bg-olive/5 transition-all text-center uppercase tracking-widest text-sm"
              >
                Browse Library
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-8 border-t border-olive/10">
               <div className="stat-item">
                  <h3 className="text-3xl font-light serif text-ink">4.2k</h3>
                  <p className="text-[10px] uppercase tracking-widest text-olive/50 font-bold mt-1">Verified Users</p>
               </div>
               <div className="w-px h-10 bg-olive/10"></div>
               <div className="stat-item">
                  <h3 className="text-3xl font-light serif text-ink">128</h3>
                  <p className="text-[10px] uppercase tracking-widest text-olive/50 font-bold mt-1">Prime Lineages</p>
               </div>
               <div className="w-px h-10 bg-olive/10"></div>
               <div className="stat-item">
                  <h3 className="text-3xl font-light serif text-ink">14</h3>
                  <p className="text-[10px] uppercase tracking-widest text-olive/50 font-bold mt-1">Botanists</p>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-sand rounded-t-[200px] rounded-b-[40px] overflow-hidden shadow-2xl relative group border-8 border-white">
              <div className="absolute inset-0 bg-olive/10 group-hover:bg-transparent transition-all duration-700"></div>
               <img 
                src="https://images.unsplash.com/photo-1544787210-2213d84ad9a0?q=80&w=1000&auto=format&fit=crop" 
                alt="Herbal Sanctuary" 
                className="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                 <div className="serif text-4xl mb-4 italic">The Botanical Lab</div>
                 <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Section ARCHIVE-12</div>
              </div>
            </div>
            
            {/* Floating Element */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-paper p-8 rounded-[40px] shadow-2xl border border-olive/5 max-w-[240px]"
            >
               <h4 className="text-xl serif text-olive mb-2">Alpine Flora</h4>
               <p className="text-xs text-ink/60 leading-relaxed font-medium">Resilient species from the high peaks of the Pyrenees, now digitally cataloged.</p>
               <div className="inline-block mt-4 px-3 py-1 bg-sand text-olive text-[9px] font-bold rounded-full uppercase tracking-widest">
                 12 New Entries
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-olive/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <SanctuaryCard 
              title="Predictive Health"
              description="Our AI models analyze your biometric rhythm to forecast nutritional needs before they arise."
              icon={<ShieldCheck className="w-6 h-6 text-olive" />}
           />
           <SanctuaryCard 
              title="Botanical Archive"
              description="Access a library of ancient botanical lineages, each with verified purity and health scores."
              icon={<Leaf className="w-6 h-6 text-olive" />}
           />
           <SanctuaryCard 
              title="Personal Sanctuary"
              description="A dedicated space for your health documentation, meal logs, and AI consultations."
              icon={<MessageSquare className="w-6 h-6 text-olive" />}
           />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-ink/5 mt-20">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[11px] opacity-40 uppercase tracking-widest font-bold font-sans">
              &copy; 2026 HealthAI Botanical Institute &mdash; All Rights Reserved
            </div>
            <div className="flex gap-8">
               {['Privacy', 'Terms', 'Sustainability Report'].map(item => (
                 <span key={item} className="text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-olive transition-colors">{item}</span>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}

function SanctuaryCard({ title, description, icon }: { title: string, description: string, icon: any }) {
  return (
    <div className="bg-paper p-10 rounded-[32px] border border-olive/5 shadow-xl shadow-ink/5 hover:translate-y-[-8px] transition-all duration-500 group">
       <div className="bg-sand w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <h4 className="text-2xl serif text-ink mb-4">{title}</h4>
       <p className="text-ink/60 text-sm leading-relaxed">{description}</p>
       <div className="mt-8 flex items-center gap-2 text-olive font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Research Lineage <TrendingUp className="w-3 h-3" />
       </div>
    </div>
  );
}
