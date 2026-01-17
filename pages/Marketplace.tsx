
import React from 'react';
import { Project } from '../types';
import { ShoppingCart, Heart, Share2, Star, Zap, Globe, DollarSign } from 'lucide-react';

interface MarketplaceProps {
  projects: Project[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ projects }) => {
  // Simulate a wider range of items for a "real" marketplace look
  const publishedItems = projects.length > 0 ? projects : [
    { id: 'm1', title: 'Lost in Cyber-Neon', genre: 'Sci-Fi', pages: new Array(5), price: 12.99, imageUrl: 'https://picsum.photos/seed/cyber/400/500' },
    { id: 'm2', title: 'The Gilded Crown', genre: 'Fantasy', pages: new Array(12), price: 19.50, imageUrl: 'https://picsum.photos/seed/king/400/500' },
    { id: 'm3', title: 'Whiskers of Wisdom', genre: 'Kids', pages: new Array(8), price: 9.99, imageUrl: 'https://picsum.photos/seed/cat/400/500' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Featured Banner */}
      <div className="relative h-96 rounded-[3rem] overflow-hidden group shadow-2xl">
         <img src="https://picsum.photos/seed/market/1600/600" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Banner" />
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex items-center p-16">
            <div className="max-w-xl space-y-6">
               <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/30">
                  <Zap size={14} fill="currentColor" />
                  <span>Featured Collection</span>
               </div>
               <h2 className="text-6xl font-black text-white leading-tight">Monetize Your <br /> Imagination.</h2>
               <p className="text-slate-300 text-lg">Sell your AI stories, E-books, and Cinematic Videos to a global audience with 0% platform fees for 3 months.</p>
               <button className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all flex items-center space-x-3">
                  <span>Open Your Store</span>
                  <ShoppingCart size={24} />
               </button>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
         <h3 className="text-3xl font-black text-white">Trending Assets</h3>
         <div className="flex items-center space-x-4">
            {['All', 'Books', 'Video Clips', 'Templates'].map(cat => (
              <button key={cat} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all">
                {cat}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {publishedItems.map((item: any) => (
          <div key={item.id} className="group bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-2 shadow-xl">
            <div className="aspect-[3/4] relative overflow-hidden">
               <img 
                 src={(item.pages && item.pages[0]?.imageUrl) || item.imageUrl} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 alt={item.title} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
               <button className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-colors">
                  <Heart size={20} />
               </button>
               <div className="absolute bottom-6 left-6 flex items-center space-x-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs font-bold text-white ml-2">(4.8k)</span>
               </div>
            </div>
            <div className="p-8 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-500">{item.genre}</span>
                  <div className="flex items-center text-emerald-400 font-black">
                     <DollarSign size={16} />
                     <span>{item.price || '14.99'}</span>
                  </div>
               </div>
               <h4 className="text-xl font-bold text-white truncate">{item.title}</h4>
               <div className="flex items-center justify-between pt-4">
                  <div className="flex -space-x-3">
                     {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                           <img src={`https://picsum.photos/seed/${i + 10}/100`} className="w-full h-full object-cover" />
                        </div>
                     ))}
                  </div>
                  <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors">
                     <ShoppingCart size={18} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
