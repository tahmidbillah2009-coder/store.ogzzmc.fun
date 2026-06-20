import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { DEFAULT_COINS } from '../data/defaultProducts';
import { CoinProduct } from '../types';
import { formatPrice } from '../utils/price';
import { readCache, writeCache } from '../utils/browserCache';
import OrderModal from './OrderModal';
import { Coins as CoinsIcon, ShoppingBag, PlusCircle, Eye, Sparkles, X, ShieldAlert } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const COINS_CACHE_KEY = 'ogzz-coins';
const COINS_CACHE_TTL_MS = 1000 * 60 * 10;

export default function Coins() {
  const [coinsList, setCoinsList] = useState<CoinProduct[]>(() => readCache<CoinProduct[]>(COINS_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => readCache<CoinProduct[]>(COINS_CACHE_KEY) === null);
  const { settings } = useSettings();

  // States for checkout modal
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // States for interactive gold coins preview
  const [previewCoin, setPreviewCoin] = useState<CoinProduct | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'coins'));
        if (!querySnapshot.empty) {
          const fetchedList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CoinProduct[];
          setCoinsList(fetchedList);
          writeCache(COINS_CACHE_KEY, fetchedList, COINS_CACHE_TTL_MS);
        } else {
          // Fallback to pre-designed coins packs only if catalog is not initialized
          if (settings.catalogInitialized) {
            setCoinsList([]);
            writeCache(COINS_CACHE_KEY, [], COINS_CACHE_TTL_MS);
          } else {
            setCoinsList(DEFAULT_COINS);
            writeCache(COINS_CACHE_KEY, DEFAULT_COINS, COINS_CACHE_TTL_MS);
          }
        }
      } catch (error) {
        console.warn("Could not load coins from Firestore. Falling back to default packs.", error);
        if (settings.catalogInitialized) {
          setCoinsList([]);
          writeCache(COINS_CACHE_KEY, [], COINS_CACHE_TTL_MS);
        } else {
          setCoinsList(DEFAULT_COINS);
          writeCache(COINS_CACHE_KEY, DEFAULT_COINS, COINS_CACHE_TTL_MS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [settings.catalogInitialized]);

  const handleBuyClick = (coin: CoinProduct) => {
    setSelectedProduct(coin);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-[#0A0A0A]">
      
      {/* Header Info */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight uppercase">
          <span className="sr-only">Purchase Coins</span>
          <span aria-hidden="true">VIRTUAL GOLD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B30000] via-[#FF5E5E] to-[#B30000] glow-text-red filter drop-shadow-[0_0_20px_rgba(179,0,0,0.5)]">COINS</span></span>
        </h1>
        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Exchange gold coins inside game merchants! Buy legendary items, spawner blocks, custom tags, and unlock special crate packages.
        </p>
      </div>

      {loading ? (
        /* Immersive gold coins grid matching real coins grid layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between bg-[#0C0C0C] border border-zinc-900 rounded-xl overflow-hidden shadow-xl animate-pulse"
            >
              {/* Image banner placeholder */}
              <div className="relative h-56 bg-zinc-950 flex items-center justify-center">
                <CoinsIcon className="w-10 h-10 text-zinc-800" />
                {/* Floating Coins Indicator Loader */}
                <div className="absolute top-3 left-3 h-6 w-24 bg-zinc-900 rounded border border-zinc-850" />
              </div>

              {/* Product Info Block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    {/* Title loader */}
                    <div className="h-4 bg-zinc-900 rounded w-1/2" />
                    {/* Preview loader */}
                    <div className="h-4.5 bg-zinc-900 rounded w-12" />
                  </div>
                  {/* Detailed description lines */}
                  <div className="space-y-2 pt-1">
                    <div className="h-3 bg-zinc-900/60 rounded w-full" />
                    <div className="h-3 bg-zinc-900/60 rounded w-11/12" />
                    <div className="h-3 bg-zinc-900/60 rounded w-4/5" />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 space-y-3">
                  {/* Price display loader */}
                  <div className="flex justify-between items-baseline">
                    <div className="h-3 bg-zinc-900 rounded w-1/4" />
                    <div className="h-4.5 bg-zinc-900 rounded w-16" />
                  </div>

                  {/* Buy Button hook */}
                  <div className="h-9 w-full bg-zinc-900 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : coinsList.length === 0 ? (
        <div className="text-center py-24 px-6 bg-[#0C0C0C]/50 border border-zinc-900/60 rounded-3xl max-w-xl mx-auto space-y-5 shadow-lg">
          <ShieldAlert className="w-14 h-14 text-zinc-700 mx-auto" />
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
            No Coin Packs Found
          </h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Our Minecraft store currently has no persistent virtual coin packs listed in the database. Please check back again later!
          </p>
        </div>
      ) : (
        /* Render coins */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {coinsList.map((coin) => (
            <div
              key={coin.id || coin.name}
              className="flex flex-col justify-between bg-[#0C0C0C]/90 border border-zinc-900/80 hover:border-[#B30000]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(179,0,0,0.25)] transition-all duration-300 group shine-overlay"
            >
              
              {/* Image banner */}
              <div className="relative h-64 bg-zinc-950 overflow-hidden">
                <img
                  src={coin.imageUrl}
                  alt={`${coin.name} virtual coin pack artwork for the OGzz MC Minecraft Store`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-60"
                />
                
                {/* Floating Coins Indicator Badge */}
                <div className="absolute top-4 left-4 bg-[#B30000] text-[11px] font-mono font-bold text-white px-3 py-1.5 rounded-lg border border-[#B30000] uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(179,0,0,0.55)]">
                  <CoinsIcon className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{coin.coinAmount.toLocaleString()} Coins</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase group-hover:text-[#FF5E5E] transition-colors leading-tight font-sans">
                      {coin.name}
                    </h3>
                    <button
                      onClick={() => setPreviewCoin(coin)}
                      className="p-1.5 px-2.5 bg-zinc-900 hover:bg-[#B30000]/10 border border-zinc-855 hover:border-[#B30000]/30 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] font-mono uppercase transition-all whitespace-nowrap cursor-pointer"
                      title="Preview coins pack value"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans line-clamp-3">
                    {coin.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/60 space-y-4">
                  {/* Price display */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-mono">Cost Value:</span>
                    <span className="text-sm sm:text-base font-mono text-[#FF5E5E] font-black glow-text-red">
                      {formatPrice(coin.price, coin.priceRS)}
                    </span>
                  </div>

                  {/* Buy Button hook */}
                  <button
                    onClick={() => handleBuyClick(coin)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-950 hover:bg-gradient-to-r hover:from-[#B30000] hover:to-[#D60000] text-gray-305 hover:text-white border border-zinc-900 hover:border-[#B30000] font-sans text-sm sm:text-base font-black uppercase rounded-lg transition-all shadow-md hover:shadow-[0_0_15px_rgba(179,0,0,0.4)] font-mono cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buy Coins
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Gold Coins Perks Preview Modal (Immersive Splitted Showcase) */}
      {previewCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPreviewCoin(null)} />
          <div 
            className="relative w-full max-w-5xl bg-[#0C0C0C] border border-[#B30000]/60 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(179,0,0,0.25)] text-white flex flex-col md:flex-row"
            id="coins-preview-modal"
          >
            {/* Close button inside modal frame */}
            <button
              onClick={() => setPreviewCoin(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
              id="coins-preview-close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column Description Panel */}
            <div className="w-full md:w-5/12 p-8 flex flex-col justify-between bg-zinc-950/60 border-b md:border-b-0 md:border-r border-zinc-900/80">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B30000]/10 border border-[#B30000]/30 rounded-full text-[10px] text-[#FF3E3E] uppercase font-mono font-bold tracking-widest mb-3">
                    <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                    Currency Pack
                  </div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight uppercase" id="preview-coin-title">
                    {previewCoin.name}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1.5 font-sans leading-relaxed">
                    Convert physical holdings to in-game currency. Use coins to buy top gear from safe zone merchants!
                  </p>
                </div>

                {/* Pricing values */}
                <div className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                    <span>Direct Cost</span>
                    <span>No hidden fees</span>
                  </div>
                  <div className="font-mono text-2xl font-black text-[#FF3E3E] tracking-tight">
                    {formatPrice(previewCoin.price, previewCoin.priceRS)}
                  </div>
                </div>

                {/* Coin properties block */}
                <div className="space-y-3 bg-zinc-900/10 border border-zinc-900 p-4.5 rounded-xl">
                  <h4 className="text-xs font-mono font-bold text-zinc-350 uppercase tracking-widest block border-b border-zinc-900 pb-2">
                    Currency Benefits:
                  </h4>
                  <ul className="space-y-2.5 text-sm text-zinc-400 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3E3E] mt-0.5">•</span>
                      <span>Total Credit: <strong className="text-white font-mono">{previewCoin.coinAmount.toLocaleString()} Coins</strong> injected instantly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3E3E] mt-0.5">•</span>
                      <span>Perfect for bidding inside local <strong className="text-zinc-200">Survival Auction Houses</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3E3E] mt-0.5">•</span>
                      <span>Acquire legendary <strong className="text-zinc-200">Custom Tags, Keys, spawners & blocks</strong> from merchants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3E3E] mt-0.5">•</span>
                      <span>Fully compliant with server economy constraints</span>
                    </li>
                  </ul>
                  
                  {/* Detailed Description Paragraph */}
                  <p className="text-xs text-zinc-500 italic leading-relaxed pt-2 border-t border-zinc-900 font-sans mt-3">
                    "{previewCoin.description}"
                  </p>
                </div>
              </div>

              {/* Purchase action paths */}
              <div className="pt-6 border-t border-zinc-900/80 mt-6 md:mt-0 space-y-3">
                <button
                  onClick={() => {
                    const coinToBuy = previewCoin;
                    setPreviewCoin(null);
                    handleBuyClick(coinToBuy);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B30000] to-[#E60000] hover:from-[#E60000] hover:to-[#FF3E3E] text-white font-bold rounded-xl font-mono text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(179,0,0,0.3)] border border-[#B30000]"
                  id="preview-coin-buy-btn"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Order {previewCoin.name} Now
                </button>
                <button
                  onClick={() => setPreviewCoin(null)}
                  className="w-full text-center text-zinc-400 hover:text-zinc-200 font-mono text-[10px] uppercase tracking-wider py-1"
                >
                  Return to product list
                </button>
              </div>
            </div>

            {/* Right Column: Beautiful High-definition Pack Image display */}
            <div className="w-full md:w-7/12 flex flex-col justify-between bg-zinc-950 p-8 min-h-[350px] md:min-h-[550px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Interactive Currency Pack Snapshot
                  </span>
                  <span className="text-[10px] font-mono text-zinc-650 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                    ECO TYPE: COINS
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-sans">
                  Below is the detailed display of the resource stack allocated to this store tier. Safe transactions guaranteed:
                </p>
              </div>

              {/* Large Image Frame */}
              <div className="flex-1 my-5 bg-gradient-to-b from-zinc-950 to-black border-2 border-zinc-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative p-3 group/viewer">
                <img
                  src={previewCoin.imageUrl}
                  alt={`${previewCoin.name} Minecraft Coins pack preview for the OGzz MC Minecraft Store`}
                  className="max-h-[350px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 group-hover/viewer:scale-[1.03]"
                />
                
                {/* Floating amount tag */}
                <div className="absolute top-6 right-6 bg-[#B30000]/95 text-white border border-[#B30000] px-4 py-1.5 rounded-lg shadow-xl font-mono text-xs font-bold uppercase tracking-wider">
                  +{previewCoin.coinAmount.toLocaleString()} Coins
                </div>
              </div>

              <div className="bg-[#0C0C0C] p-4.5 border border-zinc-900/65 rounded-xl text-center text-[11px] text-[#FF3E3E] font-mono leading-relaxed bg-[#B30000]/5 border-[#B30000]/20">
                Notice: Delivery times coordinates usually process instantly. Please make sure you joined our official Discord server to get continuous assistance!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Checkbox Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          productType="coin"
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
