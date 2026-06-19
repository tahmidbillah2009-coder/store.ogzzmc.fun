import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { RankProduct, CoinProduct, BundleProduct } from '../types';
import { formatPrice } from '../utils/price';
import { readCache, writeCache } from '../utils/browserCache';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

const PINNED_ITEMS_CACHE_KEY = 'ogzz-home-pinned-items';
const PINNED_ITEMS_CACHE_TTL_MS = 1000 * 60 * 10;

export default function HomeView() {
  const [copied, setCopied] = useState(false);
  const { settings, loading } = useSettings();
  const serverIP = loading ? '' : settings.serverIP;
  const heroTitle = (settings.heroTitle || 'OGZZ MC STORE').trim();
  const heroTitleWords = heroTitle.split(/\s+/).filter(Boolean);
  const splitIndex = heroTitleWords.length > 2 ? heroTitleWords.length - 2 : Math.ceil(heroTitleWords.length / 2);
  const heroTitleTop = heroTitleWords.slice(0, splitIndex).join(' ') || heroTitle;
  const heroTitleBottom = heroTitleWords.slice(splitIndex).join(' ');

  const [pinnedItems, setPinnedItems] = useState<(
    | (RankProduct & { type: 'rank' })
    | (CoinProduct & { type: 'coin' })
    | (BundleProduct & { type: 'bundle' })
  )[]>(() => readCache<(RankProduct & { type: 'rank' } | CoinProduct & { type: 'coin' } | BundleProduct & { type: 'bundle' })[]>(PINNED_ITEMS_CACHE_KEY) ?? []);

  useEffect(() => {
    const fetchPinned = async () => {
      try {
        const [ranksSnap, coinsSnap, bundlesSnap] = await Promise.all([
          getDocs(query(collection(db, 'ranks'), where('isPinned', '==', true), limit(4))),
          getDocs(query(collection(db, 'coins'), where('isPinned', '==', true), limit(4))),
          getDocs(query(collection(db, 'bundles'), where('isPinned', '==', true), limit(4)))
        ]);

        const ranksList = ranksSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RankProduct[];

        const coinsList = coinsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CoinProduct[];

        const bundlesList = bundlesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BundleProduct[];

        const pinnedRanks = ranksList
          .filter(r => r.isPinned)
          .map(r => ({ ...r, type: 'rank' as const }));

        const pinnedCoins = coinsList
          .filter(c => c.isPinned)
          .map(c => ({ ...c, type: 'coin' as const }));

        const pinnedBundles = bundlesList
          .filter(b => b.isPinned)
          .map(b => ({ ...b, type: 'bundle' as const }));

        const nextPinnedItems = [...pinnedRanks, ...pinnedCoins, ...pinnedBundles];
        setPinnedItems(nextPinnedItems);
        writeCache(PINNED_ITEMS_CACHE_KEY, nextPinnedItems, PINNED_ITEMS_CACHE_TTL_MS);
      } catch (err) {
        console.warn("Failed to load pinned items:", err);
      }
    };
    fetchPinned();
  }, []);

  const copyServerIP = () => {
    if (!serverIP) {
      return;
    }

    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    toast.success("Server IP copied! Join us now!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden bg-[#0A0A0A]">
      
      {/* Hero Banner Section with Custom Background Image Support */}
      <div className="relative w-full bg-[#070707] overflow-hidden min-h-[500px] md:min-h-[70vh] flex items-center justify-center">
        {settings.backgroundImage ? (
          <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
            <img 
              referrerPolicy="no-referrer"
              src={settings.backgroundImage} 
              alt="OGzz MC Minecraft Server background artwork" 
              className="w-full h-full object-cover opacity-100 filter blur-[0.5px] brightness-75 scale-102"
            />
            {/* Dark gradient mapping to make text pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/80 to-black/60" />
          </div>
        ) : (
          <>
            {/* Absolute background decoration for Minecraft atmosphere */}
            <div className="absolute top-0 left-12 w-96 h-96 bg-[#B30000]/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-12 w-96 h-96 bg-[#B30000]/5 rounded-full filter blur-3xl pointer-events-none" />
          </>
        )}

        {/* Hero Banner Section Content */}
        <section className="relative z-10 text-center py-20 md:py-36 px-4 max-w-6xl mx-auto space-y-10 w-full animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#B30000]/15 border border-[#B30000]/50 rounded-full text-sm font-mono text-[#FF5E5E] uppercase tracking-wider animate-pulse shadow-[0_0_20px_rgba(179,0,0,0.4)]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {settings.announcementText || 'Season 3: Nether Realms Open!'}
          </div>

          <h1 className="flex flex-col items-center gap-1 md:gap-2 text-center select-none leading-[0.9] tracking-[-0.04em] font-black font-sans">
            <span className="sr-only">OGzz MC Minecraft Server Store</span>
            <span aria-hidden="true" className="text-white text-5xl md:text-7xl lg:text-8xl drop-shadow-[0_2px_18px_rgba(255,255,255,0.2)]">
              {heroTitleTop}
            </span>
            {heroTitleBottom ? (
              <span aria-hidden="true" className="text-[#E10600] text-5xl md:text-7xl lg:text-8xl glow-text-red-hero drop-shadow-[0_0_34px_rgba(225,6,0,0.55)]">
                {heroTitleBottom}
              </span>
            ) : null}
          </h1>

          <p className="text-zinc-250 text-base md:text-xl max-w-3xl mx-auto leading-relaxed filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {settings.heroSubtitle || 'Upgrade your Minecraft multiplayer experience! Buy elite VIP privileges, customizable particle effects, and premium virtual gold pouches instantly.'}
          </p>

          {/* Server IP Copy Box */}
          <div className="max-w-xl mx-auto p-2 bg-zinc-950/90 border border-[#B30000]/45 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 pl-4 sm:pl-5 shadow-xl shadow-[#B30000]/10 hover:shadow-[0_0_25px_rgba(179,0,0,0.2)] transition-all duration-300">
            <div className="flex items-center gap-3 mt-1 sm:mt-0">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-ping flex-shrink-0" />
              <span className="font-mono text-zinc-350 text-xs sm:text-base text-left">
                Server IP: <strong className="text-white font-black select-all">{serverIP || 'Loading...'}</strong>
              </span>
            </div>
            <button
              onClick={copyServerIP}
              disabled={!serverIP}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 bg-[#B30000] hover:bg-[#D60000] text-white text-xs sm:text-sm font-mono font-black rounded-xl transition-all uppercase shadow-[0_0_15px_rgba(179,0,0,0.3)] hover:shadow-[0_0_25px_rgba(214,0,0,0.6)] cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 animate-pulse" /> : <Copy className="w-4 h-4" />}
              {loading ? "Loading..." : copied ? "Copied!" : "Copy IP"}
            </button>
          </div>

          {/* System Locked Banner */}
          {settings.systemLocked && (
            <div className="max-w-xl mx-auto p-4 bg-red-950/20 border-2 border-red-500/30 rounded-2xl flex items-center gap-3.5 text-left text-red-250 animate-pulse">
              <span className="p-2 bg-red-950/50 border border-red-900/60 rounded-full text-red-400 flex-shrink-0">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-3V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2z" />
                </svg>
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-red-400 block tracking-widest leading-none">SYSTEM LOCKDOWN ACTIVE</span>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
                  Our checkout valve is locked for maintenance by owner <strong className="text-zinc-200">yoorasher@gmail.com</strong>. Suspended shopping carts will resume shortly.
                </p>
              </div>
            </div>
          )}

          {/* CTA Button Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 sm:gap-5 pt-4 max-w-sm sm:max-w-none mx-auto">
            <a
              id="home-view-ranks-cta"
              href="/ranks"
              className="px-8 py-4 sm:px-10 sm:py-5 bg-[#B30000] hover:bg-[#D60000] text-white font-black rounded-xl font-mono text-base tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(179,0,0,0.6)] hover:shadow-[0_0_40px_rgba(214,0,0,0.9)] border border-[#B30000] text-center shine-overlay"
            >
              Explore VIP Ranks
            </a>
            <a
              id="home-view-coins-cta"
              href="/coins"
              className="px-8 py-4 sm:px-10 sm:py-5 bg-zinc-950 hover:bg-zinc-900 text-gray-250 hover:text-white font-black rounded-xl font-mono text-base tracking-wider uppercase transition-all border border-zinc-800 hover:border-zinc-700 shadow-md text-center shine-overlay"
            >
              Shop Coins
            </a>
          </div>
        </section>
      </div>

      {/* Featured Items / Visual Minecraft Perks Showcase */}
      {pinnedItems.length > 0 && (
        <section className="bg-zinc-950/40 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase glow-text-white">Featured Items</h2>
              <p className="text-[#FF3E3E] font-mono text-sm sm:text-base uppercase tracking-widest glow-text-red font-semibold">The community's ultimate picks</p>
            </div>

            <div className={`grid grid-cols-1 ${
              pinnedItems.length === 1 
                ? 'md:grid-cols-1 max-w-md' 
                : pinnedItems.length === 2 
                  ? 'md:grid-cols-2 max-w-5xl' 
                  : 'md:grid-cols-3 max-w-7xl'
            } gap-10 mx-auto`}>
              
              {pinnedItems.map((item) => {
                const isRank = item.type === 'rank';
                const isCoin = item.type === 'coin';
                const linkTo = isRank ? '/ranks' : (isCoin ? '/coins' : '/bundles');
                const badgeText = isRank ? 'Featured Rank' : (isCoin ? 'Featured Currency' : 'Featured Bundle');
                const buttonText = isRank ? 'View Ranks' : (isCoin ? 'View Coins' : 'View Bundles');
                return (
                  <div 
                    key={`${item.type}-${item.id || item.name}`} 
                    className="flex flex-col bg-[#0C0C0C]/90 border border-zinc-900/80 rounded-xl overflow-hidden relative shadow-lg group hover:border-[#B30000]/50 transition-all duration-300 shine-overlay shadow-[#B30000]/3 hover:shadow-[0_0_35px_rgba(179,0,0,0.25)]"
                  >
                    <span className="absolute top-4 right-4 bg-amber-600 text-xs font-mono uppercase px-3 py-1 tracking-wider rounded font-bold text-white z-10 shadow-[0_0_12px_rgba(245,158,11,0.55)]">
                      {badgeText}
                    </span>
                    <img
                      referrerPolicy="no-referrer"
                      src={item.imageUrl}
                      alt={`${item.name} featured ${item.type} package artwork for the OGzz MC Minecraft Store`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-56 object-cover group-hover:scale-102 transition-transform duration-500 opacity-85"
                    />
                    <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-white group-hover:text-[#FF5E5E] transition-colors uppercase font-sans tracking-wide">{item.name}</h4>
                        <p className="text-zinc-400 text-sm line-clamp-4 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-900/40">
                        <span className="text-base font-mono text-[#FF3E3E] font-black glow-text-red">
                          {formatPrice(item.price, item.priceRS)}
                        </span>
                        <a
                          href={linkTo}
                          className="px-6 py-2.5 bg-[#B30000]/10 hover:bg-[#B30000] border border-[#B30000]/40 rounded-lg text-white text-xs sm:text-sm font-mono uppercase font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(179,0,0,0.1)] hover:shadow-[0_0_15px_rgba(179,0,0,0.4)]"
                        >
                          {buttonText}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>
      )}

      {/* Connection & Support Hub section */}
      <section className="max-w-5xl mx-auto text-center px-6 space-y-8 pt-16 pb-12">
        <Terminal className="w-16 h-16 text-[#B30000] mx-auto opacity-75" />
        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-wide">How It Works</h2>
        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Our store uses external confirmation blocks. Register with your Minecraft player name, queue an order here, get your <strong>Order ID</strong>, and claim it under Discord support tickets instantly!
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={settings.discordLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-sm font-mono uppercase font-bold tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(88,101,242,0.45)] cursor-pointer"
          >
            Create Ticket <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
