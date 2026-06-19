import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { DEFAULT_RANKS } from '../data/defaultProducts';
import { RankProduct } from '../types';
import { formatPrice } from '../utils/price';
import { readCache, writeCache } from '../utils/browserCache';
import OrderModal from './OrderModal';
import { Eye, ShieldAlert, Sparkles, ShoppingCart, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

const RANKS_CACHE_KEY = 'ogzz-ranks';
const RANKS_CACHE_TTL_MS = 1000 * 60 * 10;

export default function Ranks() {
  const [ranks, setRanks] = useState<RankProduct[]>(() => readCache<RankProduct[]>(RANKS_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => readCache<RankProduct[]>(RANKS_CACHE_KEY) === null);
  const { settings } = useSettings();
  
  // States for checkout modal
  const [selectedProduct, setSelectedProduct] = useState<RankProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // States for inventory screenshot preview
  const [previewRank, setPreviewRank] = useState<RankProduct | null>(null);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ranks'));
        if (!querySnapshot.empty) {
          const ranksList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RankProduct[];
          setRanks(ranksList);
          writeCache(RANKS_CACHE_KEY, ranksList, RANKS_CACHE_TTL_MS);
        } else {
          // If Firestore "ranks" is empty, utilize default mockup products only if catalog is not initialized
          if (settings.catalogInitialized) {
            setRanks([]);
            writeCache(RANKS_CACHE_KEY, [], RANKS_CACHE_TTL_MS);
          } else {
            setRanks(DEFAULT_RANKS);
            writeCache(RANKS_CACHE_KEY, DEFAULT_RANKS, RANKS_CACHE_TTL_MS);
          }
        }
      } catch (error) {
        console.warn("Failed fetching ranks from Firestore. Utilizing offline fallbacks.", error);
        if (settings.catalogInitialized) {
          setRanks([]);
          writeCache(RANKS_CACHE_KEY, [], RANKS_CACHE_TTL_MS);
        } else {
          setRanks(DEFAULT_RANKS);
          writeCache(RANKS_CACHE_KEY, DEFAULT_RANKS, RANKS_CACHE_TTL_MS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, [settings.catalogInitialized]);

  const handleBuyClick = (rank: RankProduct) => {
    setSelectedProduct(rank);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-[#0A0A0A]">
      
      {/* Page Title Header */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight uppercase">
          <span className="sr-only">Minecraft Server Ranks</span>
          <span aria-hidden="true">VIP SERVER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B30000] via-[#FF5E5E] to-[#B30000] glow-text-red filter drop-shadow-[0_0_20px_rgba(179,0,0,0.5)]">RANKS</span></span>
        </h1>
        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Elevate your status in OGzz MC. Ranks provide customized cosmetic traits, inventory multipliers, and commands in survival realms.
        </p>
      </div>

      {loading ? (
        /* Immersive high-fidelity skeleton states matching actual ranks grid layout perfectly */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-[#0C0C0C] border border-zinc-900/60 rounded-2xl overflow-hidden shadow-xl animate-pulse"
            >
              {/* Product Badge Image Skeleton */}
              <div className="relative h-64 bg-zinc-950 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900/40 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-zinc-800" />
                </div>
                {/* Floating Cost Tag Loader */}
                <div className="absolute top-4 right-4 h-9 w-24 bg-zinc-900/80 rounded-md" />
              </div>

              {/* Card Meta Content Skeleton */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    {/* Name block loader */}
                    <div className="h-7 bg-zinc-900 rounded-md w-1/3" />
                    {/* Preview button loader */}
                    <div className="h-7 bg-zinc-900/80 rounded-md w-16" />
                  </div>

                  {/* Bullet description paragraph loaders */}
                  <div className="space-y-2.5 pt-1">
                    <div className="h-3.5 bg-zinc-900/70 rounded w-11/12" />
                    <div className="h-3.5 bg-zinc-900/70 rounded w-4/5" />
                    <div className="h-3.5 bg-zinc-900/70 rounded w-5/6" />
                    <div className="h-3.5 bg-[#0C0C0C] rounded w-2/3" />
                  </div>
                </div>

                {/* Purchase Button Loader */}
                <div className="h-14 bg-zinc-900 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : ranks.length === 0 ? (
        <div className="text-center py-24 px-6 bg-[#0C0C0C]/50 border border-zinc-900/60 rounded-3xl max-w-xl mx-auto space-y-5 shadow-lg">
          <ShieldAlert className="w-14 h-14 text-zinc-700 mx-auto" />
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
            No Published Ranks Available
          </h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Our Minecraft store catalog has no active server ranks listed at the moment. Please check back again soon, or contact support!
          </p>
        </div>
      ) : (
        /* Grid product items list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {ranks.map((rank) => (
            <div
              key={rank.id || rank.name}
              className="flex flex-col bg-[#0C0C0C]/90 border border-zinc-900/80 hover:border-[#B30000]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(179,0,0,0.25)] transition-all duration-300 group relative shine-overlay"
            >
              
              {/* Product Badge background */}
              <div className="relative h-64 overflow-hidden bg-zinc-950">
                <img
                  src={rank.imageUrl}
                  alt={`${rank.name} rank artwork for the OGzz MC Minecraft Server`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-70"
                />
                
                {/* Visual Glassmorphic gradient prefix over image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
                
                {/* Floating Cost Tag */}
                <div className="absolute top-4 right-4 py-2 px-4 bg-black/85 border border-[#B30000]/40 rounded-lg backdrop-blur-md shadow-md shadow-[#B30000]/10">
                  <span className="font-mono text-[#FF5E5E] font-black text-base glow-text-red">{formatPrice(rank.price, rank.priceRS)}</span>
                </div>
              </div>

              {/* Product Meta details */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wide group-hover:text-[#FF5E5E] transition-colors font-sans">
                      {rank.name}
                    </h3>
                    <button
                      onClick={() => setPreviewRank(rank)}
                      className="p-1.5 px-3 bg-zinc-900 hover:bg-[#B30000]/10 border border-zinc-800 hover:border-[#B30000]/45 text-gray-300 hover:text-white rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer"
                      title="Preview Perks Screenshot"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>

                  {/* Description points renderer */}
                  <div className="space-y-2 text-zinc-350 text-sm sm:text-base font-sans whitespace-pre-line leading-relaxed">
                    {rank.description}
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handleBuyClick(rank)}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#B30000] to-[#E60000] hover:from-[#E60000] hover:to-[#FF5E5E] text-white font-black rounded-lg font-mono text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(179,0,0,0.4)] hover:shadow-[0_0_25px_rgba(179,0,0,0.7)] border border-[#B30000] cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  Order Rank
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ranks Perks Preview Modal (Double-pane Wide Immersive Preview) */}
      {previewRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPreviewRank(null)} />
          <div 
            className="relative w-full max-w-5xl bg-[#0C0C0C] border border-[#B30000]/60 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(179,0,0,0.25)] text-white flex flex-col md:flex-row"
            id="ranks-preview-modal"
          >
            {/* Close Button absolute inside */}
            <button
              onClick={() => setPreviewRank(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
              id="ranks-preview-close"
            >
              <XCloseIcon className="w-5 h-5" />
            </button>

            {/* Left Column: Extensive Details, Description & Checkout Panel */}
            <div className="w-full md:w-5/12 p-8 flex flex-col justify-between bg-zinc-950/60 border-b md:border-b-0 md:border-r border-zinc-900/80">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B30000]/10 border border-[#B30000]/30 rounded-full text-[10px] text-[#FF3E3E] uppercase font-mono font-bold tracking-widest mb-3">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                    Premium Package
                  </div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight uppercase" id="preview-rank-title">
                    {previewRank.name}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1.5 font-sans">
                    Complete breakdown of features, permissions, and virtual items.
                  </p>
                </div>

                {/* Combined Price Panel */}
                <div className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-4 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Acquisition Cost</div>
                  <div className="font-mono text-2xl font-black text-[#FF3E3E] tracking-tight">
                    {formatPrice(previewRank.price, previewRank.priceRS)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans italic">
                    Exchange rate calculated at 1 USD = 84 RS unless a manual price is configured. All sales support hosting fees.
                  </div>
                </div>

                {/* Fully Styled Bullet Perks List */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block border-b border-zinc-900 pb-2">
                    InCLUDED PERKS & SYSTEM CMDs:
                  </span>
                  <div className="space-y-3 font-sans text-sm text-zinc-300 max-h-56 overflow-y-auto pr-1 select-none">
                    {previewRank.description.split('\n').map((line, idx) => {
                      const cleanLine = line.replace(/^[•\-\*\s]+/, '').trim();
                      if (!cleanLine) return null;
                      return (
                        <div key={idx} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5 p-0.5 rounded bg-[#B30000]/10 border border-[#B30000]/25 text-[#FF3E3E]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="leading-relaxed text-zinc-300 font-sans">{cleanLine}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Directly Order from Preview Option */}
              <div className="pt-6 border-t border-zinc-900/80 mt-6 md:mt-0 space-y-3">
                <button
                  onClick={() => {
                    const rankToBuy = previewRank;
                    setPreviewRank(null);
                    handleBuyClick(rankToBuy);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B30000] to-[#E60000] hover:from-[#E60000] hover:to-[#FF3E3E] text-white font-bold rounded-xl font-mono text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(179,0,0,0.3)] border border-[#B30000]"
                  id="preview-rank-buy-btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order {previewRank.name} Now
                </button>
                <button
                  onClick={() => setPreviewRank(null)}
                  className="w-full text-center text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-wider py-1"
                >
                  Return to list view
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Large Visual Viewport (Inventory / Item kits) */}
            <div className="w-full md:w-7/12 flex flex-col justify-between bg-zinc-950 p-8 min-h-[350px] md:min-h-[550px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive Kit Snapshot Preview
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                    SCALE_FIT: HD
                  </span>
                </div>
                <p className="text-zinc-500 text-xs">
                  This snapshot illustrates the custom kit items, armor tiers, weapons, or blocks that will be generated inside your inventory:
                </p>
              </div>

              {/* Massive Image Screen */}
              <div className="flex-1 my-5 bg-gradient-to-b from-zinc-950 to-black border-2 border-zinc-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative p-3 group/viewer">
                <img
                  src={previewRank.inventoryScreenshot}
                  alt={`${previewRank.name} rank kit inventory preview for the OGzz MC Minecraft Server`}
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 group-hover/viewer:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/viewer:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none">
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/90 py-1 px-3 border border-zinc-905 rounded-full backdrop-blur-md">
                    Rendered high-detail schema
                  </span>
                </div>
              </div>

              <div className="bg-[#0C0C0C] p-4.5 border border-zinc-900/65 rounded-xl text-center text-[11px] text-zinc-500 font-mono leading-relaxed">
                Actual game cosmetics, damage tags, and custom attributes might slightly vary per active Minecraft world server updates. 
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Checkbox Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          productType="rank"
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

    </div>
  );
}

// Inline fallback Close X icon to avoid import failures
function XCloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
