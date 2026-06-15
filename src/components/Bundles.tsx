import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { DEFAULT_BUNDLES } from '../data/defaultProducts';
import { BundleProduct } from '../types';
import { formatPrice } from '../utils/price';
import OrderModal from './OrderModal';
import { ShieldCheck, Sparkles, Coins, ShoppingCart, HelpCircle, ArrowRight, Star, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

export default function Bundles() {
  const [bundles, setBundles] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  // States for checkout modal
  const [selectedProduct, setSelectedProduct] = useState<BundleProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'bundles'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BundleProduct[];
          setBundles(list);
        } else {
          // If Firestore "bundles" is empty, utilize default mockup products only if catalog is not initialized
          if (settings.catalogInitialized) {
            setBundles([]);
          } else {
            setBundles(DEFAULT_BUNDLES);
          }
        }
      } catch (error) {
        console.warn("Could not load bundles from Firestore. Using offline fallbacks.", error);
        if (settings.catalogInitialized) {
          setBundles([]);
        } else {
          setBundles(DEFAULT_BUNDLES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [settings.catalogInitialized]);

  const handleBuyClick = (bundle: BundleProduct) => {
    setSelectedProduct(bundle);
    setIsCheckoutOpen(true);
  };

  // Helper for original calculating values
  const getOriginalPriceBreakdown = (bundleName: string) => {
    switch (bundleName) {
      case "Adventurer Starter Combo":
        return { original: 29.98, savings: "16%" };
      case "Supreme Monarch Bundle":
        return { original: 64.98, savings: "23%" };
      case "Imperial Overlord Vault":
        return { original: 124.98, savings: "20%" };
      case "Titan Emperor God Pack":
        return { original: 239.97, savings: "45%" };
      default:
        return { original: null, savings: null };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-[#0A0A0A]">
      
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          Combo Bundles
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight uppercase">
          <span className="sr-only">Minecraft Bundles</span>
          <span aria-hidden="true">SUPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B30000] via-[#FF5E5E] to-[#B30000] glow-text-red filter drop-shadow-[0_0_20px_rgba(179,0,0,0.5)]">SAVER COMBOS</span></span>
        </h1>
        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Combine powerful rank multipliers with huge coin stashes at unbeatable discount rates. Unlock permanent cosmetics and start your survival gameplay with infinite trading power!
        </p>
      </div>

      {loading ? (
        /* Immersive high-fidelity skeleton states matching actual bundles layout perfectly */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-[#0C0C0C] border border-zinc-900/60 rounded-2xl overflow-hidden shadow-xl animate-pulse"
            >
              {/* Product Badge background skeleton */}
              <div className="relative h-64 bg-zinc-950 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900/40 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-zinc-800" />
                </div>
                {/* Save percentage badge skeleton */}
                <div className="absolute top-4 left-4 h-6 w-20 bg-zinc-900 rounded-md" />
                {/* Floating Cost Tag skeleton with original line-through and current price placeholders */}
                <div className="absolute top-4 right-4 py-2.5 px-4 bg-zinc-900/40 border border-zinc-900/60 rounded-lg w-28 h-14 flex flex-col justify-between items-end" />
              </div>

              {/* Product Meta details skeleton */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Title indicator */}
                  <div className="h-7 bg-zinc-900 rounded-md w-3/5" />

                  {/* Combo content badges */}
                  <div className="flex gap-2.5 pt-1">
                    <div className="h-7 bg-zinc-900/50 rounded-full w-24" />
                    <div className="h-7 bg-zinc-900/50 rounded-full w-32" />
                  </div>

                  {/* Description paragraph indicator */}
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 bg-zinc-900/70 rounded w-full" />
                    <div className="h-3.5 bg-[#0C0C0C] rounded w-11/12" />
                  </div>

                  {/* Inner checklist section skeleton */}
                  <div className="pt-3 border-t border-zinc-900/60 space-y-3">
                    <div className="h-3 bg-zinc-950 rounded w-1/4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 bg-zinc-900 rounded" />
                        <div className="h-3 bg-zinc-900/55 rounded w-4/5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 bg-zinc-900 rounded" />
                        <div className="h-3 bg-zinc-900/55 rounded w-3/4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 bg-zinc-900 rounded" />
                        <div className="h-3 bg-zinc-900/55 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Button Skeleton */}
                <div className="h-14 bg-zinc-900 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-24 px-6 bg-[#0C0C0C]/50 border border-zinc-900/60 rounded-3xl max-w-xl mx-auto space-y-5 shadow-lg">
          <ShieldAlert className="w-14 h-14 text-zinc-700 mx-auto" />
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
            No Combo Bundles Found
          </h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Our Minecraft store currently has no persistent combo package bundles listed in the database. Please check back again later!
          </p>
        </div>
      ) : (
        /* Grid product items list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {bundles.map((bundle) => {
            const breakdown = getOriginalPriceBreakdown(bundle.name);
            return (
              <div
                key={bundle.id || bundle.name}
                className="flex flex-col bg-[#0C0C0C]/90 border border-zinc-900/80 hover:border-[#B30000]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(179,0,0,0.25)] transition-all duration-300 group relative shine-overlay"
              >
                
                {/* Product Badge background */}
                <div className="relative h-64 overflow-hidden bg-zinc-950">
                  <img
                    src={bundle.imageUrl}
                    alt={`${bundle.name} bundle artwork for the OGzz MC Minecraft Store`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-60"
                  />
                  
                  {/* Visual Glassmorphic gradient prefix over image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
                  
                  {/* Hot Deal Savings Badge */}
                  {breakdown.savings && (
                    <div className="absolute top-4 left-4 py-1.5 px-3 bg-red-600 border border-red-500 rounded-md shadow-md text-[10px] font-mono uppercase font-bold text-white tracking-widest animate-pulse">
                      Save {breakdown.savings}!
                    </div>
                  )}

                  {/* Floating Cost Tag */}
                  <div className="absolute top-4 right-4 py-2.5 px-4 bg-black/90 border border-[#B30000]/50 rounded-lg backdrop-blur-md shadow-md flex flex-col items-end">
                    {breakdown.original && (
                      <span className="font-mono text-zinc-500 line-through text-xs mb-0.5">
                        {formatPrice(breakdown.original)}
                      </span>
                    )}
                    <span className="font-mono text-[#FF5E5E] font-black text-xl glow-text-red">
                      {formatPrice(bundle.price, bundle.priceRS)}
                    </span>
                  </div>
                </div>

                {/* Product Meta details */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wide group-hover:text-[#FF5E5E] transition-colors font-sans">
                      {bundle.name}
                    </h3>

                    {/* Combo content badges */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/40 border border-blue-900/40 rounded-full text-xs font-mono text-blue-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        {bundle.rankName}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-950/40 border border-yellow-900/40 rounded-full text-xs font-mono text-yellow-400">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        {bundle.coinAmount.toLocaleString()} Coins
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 text-sm leading-relaxed pt-2">
                      {bundle.description}
                    </p>

                    {/* Inner checklist of value items */}
                    <div className="pt-3 border-t border-zinc-900/60 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">What's Inside</span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <ArrowRight className="w-3 h-3 text-[#B30000]" />
                          <span>Lifetime rank permissions for <strong>{bundle.rankName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <ArrowRight className="w-3 h-3 text-[#B30000]" />
                          <span>Immediate virtual delivery of <strong>{bundle.coinAmount.toLocaleString()} coins</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-400 font-semibold">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          <span>Guaranteed best checkout price combo discount</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handleBuyClick(bundle)}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#B30000] to-[#E60000] hover:from-[#E60000] hover:to-[#FF5E5E] text-white font-black rounded-lg font-mono text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(179,0,0,0.4)] hover:shadow-[0_0_25px_rgba(179,0,0,0.7)] border border-[#B30000] cursor-pointer"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    Order Bundle Combo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connection & Support Hub section */}
      <section className="max-w-4xl mx-auto rounded-2xl bg-zinc-950/40 border border-zinc-900/60 p-8 text-center space-y-4">
        <HelpCircle className="w-10 h-10 text-[#B30000] mx-auto opacity-75" />
        <h2 className="text-xl font-bold uppercase text-white tracking-wide">Looking for Custom combos?</h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Need a special bundle setup or purchasing coins for a whole guild? Open a support ticket under our active Discord guild and our server managers will craft a specific billing invoice for you!
        </p>
      </section>

      {/* Order Checkbox Modal */}
      {selectedProduct && (
        <OrderModal
          product={{
            name: selectedProduct.name,
            price: selectedProduct.price,
            priceRS: selectedProduct.priceRS,
            description: selectedProduct.description,
            imageUrl: selectedProduct.imageUrl
          }}
          productType="bundle"
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
