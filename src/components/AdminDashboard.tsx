import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { OrderItem, RankProduct, CoinProduct, BundleProduct, AdminUser } from '../types';
import { formatPrice } from '../utils/price';
import { DEFAULT_RANKS, DEFAULT_COINS, DEFAULT_BUNDLES } from '../data/defaultProducts';
import { 
  Loader2, ShieldAlert, ShieldCheck, ClipboardCheck, 
  Coins, User, PlusCircle, Trash2, Edit, Check, X, Search, Pin, Shield,
  Sparkles, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'ranks' | 'coins' | 'bundles' | 'settings' | 'admins'>('orders');

  // Site settings form state
  const { settings, updateSettings } = useSettings();
  const [siteIP, setSiteIP] = useState('');
  const [siteInvite, setSiteInvite] = useState('');
  const [siteBgImage, setSiteBgImage] = useState('');
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [siteAnnouncementText, setSiteAnnouncementText] = useState('');
  const [siteHeroTitle, setSiteHeroTitle] = useState('');
  const [siteHeroSubtitle, setSiteHeroSubtitle] = useState('');
  const [siteTerms, setSiteTerms] = useState('');
  const [siteLocked, setSiteLocked] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteIP(settings.serverIP);
      setSiteInvite(settings.discordLink);
      setSiteBgImage(settings.backgroundImage || '');
      setSiteLogoUrl(settings.logoUrl || '');
      setSiteAnnouncementText(settings.announcementText || 'Season 3: Nether Realms Open!');
      setSiteHeroTitle(settings.heroTitle || 'OGZZ MC STORE');
      setSiteHeroSubtitle(settings.heroSubtitle || 'Upgrade your Minecraft multiplayer experience! Buy elite VIP privileges, customizable particle effects, and premium virtual gold pouches instantly.');
      setSiteTerms(settings.termsAndConditions || '');
      setSiteLocked(!!settings.systemLocked);
    }
  }, [settings]);

  // Real-time Firestore states
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ranks, setRanks] = useState<RankProduct[]>([]);
  const [coinsList, setCoinsList] = useState<CoinProduct[]>([]);
  const [bundlesList, setBundlesList] = useState<BundleProduct[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New admin input state fields
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Admin');
  const [adminSearch, setAdminSearch] = useState('');

  // Search filter inside admin order tabs
  const [orderSearch, setOrderSearch] = useState('');

  // Reject overlays state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Ranks Crud visual forms state
  const [showRankForm, setShowRankForm] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [rankName, setRankName] = useState('');
  const [rankPrice, setRankPrice] = useState('');
  const [rankPriceRS, setRankPriceRS] = useState('');
  const [rankImage, setRankImage] = useState('');
  const [rankScreenshot, setRankScreenshot] = useState('');
  const [rankDesc, setRankDesc] = useState('');
  const [rankIsPinned, setRankIsPinned] = useState(false);

  // Coins Crud visual forms state
  const [showCoinForm, setShowCoinForm] = useState(false);
  const [editingCoinId, setEditingCoinId] = useState<string | null>(null);
  const [coinName, setCoinName] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [coinPrice, setCoinPrice] = useState('');
  const [coinPriceRS, setCoinPriceRS] = useState('');
  const [coinImage, setCoinImage] = useState('');
  const [coinDesc, setCoinDesc] = useState('');
  const [coinIsPinned, setCoinIsPinned] = useState(false);

  // Bundles Crud visual forms state
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [bundleName, setBundleName] = useState('');
  const [bundlePrice, setBundlePrice] = useState('');
  const [bundlePriceRS, setBundlePriceRS] = useState('');
  const [bundleRankName, setBundleRankName] = useState('');
  const [bundleCoinAmount, setBundleCoinAmount] = useState('');
  const [bundleImage, setBundleImage] = useState('');
  const [bundleDesc, setBundleDesc] = useState('');
  const [bundleIsPinned, setBundleIsPinned] = useState(false);

  // Seeding state variables for empty database fallback detection
  const [isSeeding, setIsSeeding] = useState(false);
  const isUsingRanksFallback = !settings.catalogInitialized && ranks.length > 0 && !ranks[0].id;
  const isUsingCoinsFallback = !settings.catalogInitialized && coinsList.length > 0 && !coinsList[0].id;
  const isUsingBundlesFallback = !settings.catalogInitialized && bundlesList.length > 0 && !bundlesList[0].id;
  const isUsingAnyFallback = isUsingRanksFallback || isUsingCoinsFallback || isUsingBundlesFallback;

  const ensureCatalogInitialized = async () => {
    if (!settings.catalogInitialized) {
      try {
        const docRef = doc(db, 'settings', 'site');
        await setDoc(docRef, {
          ...settings,
          catalogInitialized: true
        }, { merge: true });
      } catch (err) {
        console.warn("Could not set catalogInitialized: true", err);
      }
    }
  };

  // Beautiful Custom Confirmation Modal State to replace window.confirm (blocked inside iframe sandboxes)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  const triggerConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmText = 'Delete'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm: async () => {
        try {
          await onConfirm();
        } catch (e) {
          console.error("Modal confirmation action failed", e);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Synced loaders
  useEffect(() => {
    // Only fetch records if staff credentials exist
    if (!user || !isAdmin) return;

    setLoadingData(true);

    // 1. Orders collection snap
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordList: OrderItem[] = [];
      snapshot.forEach((d) => {
        ordList.push({ id: d.id, ...d.data() } as OrderItem);
      });
      // Sorting newest orders first
      ordList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordList);
    }, (error) => {
      console.error("Staff Orders Sync failed:", error);
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    // 2. Ranks collection snap
    const unsubscribeRanks = onSnapshot(collection(db, 'ranks'), (snapshot) => {
      const rnList: RankProduct[] = [];
      snapshot.forEach((d) => {
        rnList.push({ id: d.id, ...d.data() } as RankProduct);
      });
      if (rnList.length === 0 && !settings.catalogInitialized) {
        setRanks(DEFAULT_RANKS);
      } else {
        setRanks(rnList);
      }
    }, (error) => {
      console.error("Staff Ranks Sync failed:", error);
      handleFirestoreError(error, OperationType.GET, 'ranks');
    });

    // 3. Coins collection snap
    const unsubscribeCoins = onSnapshot(collection(db, 'coins'), (snapshot) => {
      const coList: CoinProduct[] = [];
      snapshot.forEach((d) => {
        coList.push({ id: d.id, ...d.data() } as CoinProduct);
      });
      if (coList.length === 0 && !settings.catalogInitialized) {
        setCoinsList(DEFAULT_COINS);
      } else {
        setCoinsList(coList);
      }
    }, (error) => {
      console.error("Staff Coins Sync failed:", error);
      handleFirestoreError(error, OperationType.GET, 'coins');
    });

    // 4. Bundles collection snap
    const unsubscribeBundles = onSnapshot(collection(db, 'bundles'), (snapshot) => {
      const bnList: BundleProduct[] = [];
      snapshot.forEach((d) => {
        bnList.push({ id: d.id, ...d.data() } as BundleProduct);
      });
      if (bnList.length === 0 && !settings.catalogInitialized) {
        setBundlesList(DEFAULT_BUNDLES);
      } else {
        setBundlesList(bnList);
      }
    }, (error) => {
      console.error("Staff Bundles Sync failed:", error);
      handleFirestoreError(error, OperationType.GET, 'bundles');
    });

    // 5. Admins collection snap
    const unsubscribeAdmins = onSnapshot(collection(db, 'admins'), (snapshot) => {
      const adList: AdminUser[] = [];
      snapshot.forEach((d) => {
        adList.push({ id: d.id, ...d.data() } as AdminUser);
      });
      setAdminsList(adList);
      setLoadingData(false);
    }, (error) => {
      console.error("Staff Admins Sync failed:", error);
      setLoadingData(false);
      handleFirestoreError(error, OperationType.GET, 'admins');
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRanks();
      unsubscribeCoins();
      unsubscribeBundles();
      unsubscribeAdmins();
    };
  }, [user, isAdmin, settings.catalogInitialized]);

  // Automatically trigger database catalog seeding if the admin view loads and database is uninitialized
  useEffect(() => {
    if (user && isAdmin && !settings.catalogInitialized && !isSeeding && !loadingData) {
      handleSeedDefaultProducts();
    }
  }, [user, isAdmin, settings.catalogInitialized, isSeeding, loadingData]);

  // Auth gate checks
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-8 h-8 text-[#B30000] animate-spin" />
        <span className="text-zinc-500 font-mono text-xs">Verifying staff credentials...</span>
      </div>
    );
  }

  // Strictly block unauthorized players
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[#0A0A0A]">
        <div className="relative w-full max-w-md bg-[#0C0C0C] border border-red-950 rounded-xl p-8 text-center space-y-4 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-[#FF3E3E] mx-auto animate-pulse" />
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Access Denied</h1>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto">
            You do not have staff permissions to view this terminal panel. Please log into an authorized administrator account.
          </p>
          <div className="pt-2">
            <span className="text-[10px] font-mono text-zinc-600 block">Logged client email: {user?.email || "Anonymous user"}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIONS: ORDERS ---
  const handleConfirmOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status: 'Confirmed', rejectionReason: "" });
      toast.success(`Order ${orderId} has been confirmed & applied!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleOpenReject = (orderId: string) => {
    setRejectId(orderId);
    setRejectReason('');
  };

  const handleRejectOrderSubmit = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is strictly required.");
      return;
    }

    try {
      const docRef = doc(db, 'orders', rejectId);
      await updateDoc(docRef, {
        status: 'Rejected',
        rejectionReason: rejectReason.trim()
      });
      toast.success(`Order ${rejectId} has been rejected.`);
      setRejectId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${rejectId}`);
    }
  };

  // --- ACTIONS: RANKS CRUDS ---
  const handleOpenAddRank = () => {
    setEditingRankId(null);
    setRankName('');
    setRankPrice('');
    setRankPriceRS('');
    setRankImage('');
    setRankScreenshot('');
    setRankDesc('');
    setRankIsPinned(false);
    setShowRankForm(true);
  };

  const handleOpenEditRank = (rank: RankProduct) => {
    setEditingRankId(rank.id || rank.name);
    setRankName(rank.name);
    setRankPrice(String(rank.price));
    setRankPriceRS(rank.priceRS ? String(rank.priceRS) : '');
    setRankImage(rank.imageUrl);
    setRankScreenshot(rank.inventoryScreenshot);
    setRankDesc(rank.description);
    setRankIsPinned(rank.isPinned || false);
    setShowRankForm(true);
  };

  const handleTogglePinRank = async (rank: RankProduct) => {
    const id = rank.id || rank.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const bPinned = !rank.isPinned;
    try {
      const docRef = doc(db, 'ranks', id);
      await setDoc(docRef, {
        name: rank.name,
        price: rank.price,
        imageUrl: rank.imageUrl,
        inventoryScreenshot: rank.inventoryScreenshot,
        description: rank.description,
        isPinned: bPinned,
        priceRS: rank.priceRS || null
      }, { merge: true });
      toast.success(bPinned ? `Pinned "${rank.name}" to homepage!` : `Unpinned "${rank.name}" from homepage!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `ranks/${id}`);
    }
  };

  const handleSaveRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankName || !rankPrice || !rankImage || !rankScreenshot || !rankDesc) {
      toast.error("Please fill in all rank metadata components.");
      return;
    }

    const priceNum = parseFloat(rankPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please specify a valid numeric price.");
      return;
    }

    const priceRSNum = rankPriceRS && rankPriceRS.trim() !== '' ? parseFloat(rankPriceRS) : undefined;
    if (priceRSNum !== undefined && (isNaN(priceRSNum) || priceRSNum < 0)) {
      toast.error("Please specify a valid numeric Rupee price or leave it empty for automatic conversion.");
      return;
    }

    const rankPayload: any = {
      name: rankName,
      price: priceNum,
      imageUrl: rankImage,
      inventoryScreenshot: rankScreenshot,
      description: rankDesc,
      isPinned: rankIsPinned
    };

    if (priceRSNum !== undefined) {
      rankPayload.priceRS = priceRSNum;
    } else {
      // Remove it or set to null if they cleared it
      rankPayload.priceRS = null;
    }

    try {
      if (editingRankId) {
        // Edit inside Firestore using doc id
        const docRef = doc(db, 'ranks', editingRankId);
        await setDoc(docRef, rankPayload, { merge: true });
        toast.success("Rank updated successfully!");
      } else {
        // Add inside Firestore (using sanitize name as ID)
        const docId = rankName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(db, 'ranks', docId);
        await setDoc(docRef, rankPayload);
        toast.success("New Rank added successfully!");
      }
      await ensureCatalogInitialized();
      setShowRankForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `ranks/${editingRankId || 'new'}`);
    }
  };

  const handleDeleteRank = async (id: string | undefined, name: string) => {
    const targetId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerConfirmation(
      "Confirm Rank Deletion",
      `Are you sure you want to delete rank "${name}"? This action is permanent and cannot be undone.`,
      async () => {
        try {
          if (!id) {
            // Promote all other default ranks to live Firestore collection so this one is effectively deleted
            const toastId = toast.loading("Initializing live ranks database...");
            for (const rank of DEFAULT_RANKS) {
              const docId = rank.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              if (docId === targetId) continue;
              await setDoc(doc(db, 'ranks', docId), {
                name: rank.name,
                price: rank.price,
                imageUrl: rank.imageUrl,
                inventoryScreenshot: rank.inventoryScreenshot,
                description: rank.description,
                isPinned: true
              });
            }
            toast.success("Initialized database and deleted rank successfully!", { id: toastId });
          } else {
            await deleteDoc(doc(db, 'ranks', id));
            toast.success("Rank deleted successfully!");
          }
          await ensureCatalogInitialized();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `ranks/${targetId}`);
        }
      }
    );
  };

  // --- ACTIONS: COINS CRUDS ---
  const handleOpenAddCoin = () => {
    setEditingCoinId(null);
    setCoinName('');
    setCoinAmount('');
    setCoinPrice('');
    setCoinPriceRS('');
    setCoinImage('');
    setCoinDesc('');
    setCoinIsPinned(false);
    setShowCoinForm(true);
  };

  const handleOpenEditCoin = (coin: CoinProduct) => {
    setEditingCoinId(coin.id || coin.name);
    setCoinName(coin.name);
    setCoinAmount(String(coin.coinAmount));
    setCoinPrice(String(coin.price));
    setCoinPriceRS(coin.priceRS ? String(coin.priceRS) : '');
    setCoinImage(coin.imageUrl);
    setCoinDesc(coin.description);
    setCoinIsPinned(coin.isPinned || false);
    setShowCoinForm(true);
  };

  const handleTogglePinCoin = async (coin: CoinProduct) => {
    const id = coin.id || coin.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const bPinned = !coin.isPinned;
    try {
      const docRef = doc(db, 'coins', id);
      await setDoc(docRef, {
        name: coin.name,
        coinAmount: coin.coinAmount,
        price: coin.price,
        imageUrl: coin.imageUrl,
        description: coin.description,
        isPinned: bPinned,
        priceRS: coin.priceRS || null
      }, { merge: true });
      toast.success(bPinned ? `Pinned "${coin.name}" to homepage!` : `Unpinned "${coin.name}" from homepage!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coins/${id}`);
    }
  };

  const handleSaveCoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName || !coinAmount || !coinPrice || !coinImage || !coinDesc) {
      toast.error("Please complete all coin metadata details.");
      return;
    }

    const amountNum = parseInt(coinAmount);
    const priceNum = parseFloat(coinPrice);
    if (isNaN(amountNum) || amountNum < 0 || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please specify positive numerical quantities.");
      return;
    }

    const priceRSNum = coinPriceRS && coinPriceRS.trim() !== '' ? parseFloat(coinPriceRS) : undefined;
    if (priceRSNum !== undefined && (isNaN(priceRSNum) || priceRSNum < 0)) {
      toast.error("Please specify a valid numeric Rupee price or leave it empty for automatic conversion.");
      return;
    }

    const coinPayload: any = {
      name: coinName,
      coinAmount: amountNum,
      price: priceNum,
      imageUrl: coinImage,
      description: coinDesc,
      isPinned: coinIsPinned
    };

    if (priceRSNum !== undefined) {
      coinPayload.priceRS = priceRSNum;
    } else {
      coinPayload.priceRS = null;
    }

    try {
      if (editingCoinId) {
        const docRef = doc(db, 'coins', editingCoinId);
        await setDoc(docRef, coinPayload, { merge: true });
        toast.success("Coin pack updated!");
      } else {
        const docId = coinName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(db, 'coins', docId);
        await setDoc(docRef, coinPayload);
        toast.success("New coin pack added!");
      }
      await ensureCatalogInitialized();
      setShowCoinForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coins/${editingCoinId || 'new'}`);
    }
  };

  const handleDeleteCoin = async (id: string | undefined, name: string) => {
    const targetId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerConfirmation(
      "Confirm Coin Pack Deletion",
      `Are you sure you want to delete coin pack "${name}"? This action is permanent and cannot be undone.`,
      async () => {
        try {
          if (!id) {
            // Promote all other default coins to live Firestore collection so this one is effectively deleted
            const toastId = toast.loading("Initializing live coin packs database...");
            for (const coin of DEFAULT_COINS) {
              const docId = coin.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              if (docId === targetId) continue;
              await setDoc(doc(db, 'coins', docId), {
                name: coin.name,
                coinAmount: coin.coinAmount,
                price: coin.price,
                imageUrl: coin.imageUrl,
                description: coin.description,
                isPinned: coin.name.includes("Diamond")
              });
            }
            toast.success("Initialized database and deleted coin pack successfully!", { id: toastId });
          } else {
            await deleteDoc(doc(db, 'coins', id));
            toast.success("Coin pack deleted successfully.");
          }
          await ensureCatalogInitialized();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `coins/${targetId}`);
        }
      }
    );
  };

  // --- ACTIONS: BUNDLES CRUDS ---
  const handleOpenAddBundle = () => {
    setEditingBundleId(null);
    setBundleName('');
    setBundlePrice('');
    setBundlePriceRS('');
    setBundleRankName('');
    setBundleCoinAmount('');
    setBundleImage('');
    setBundleDesc('');
    setBundleIsPinned(false);
    setShowBundleForm(true);
  };

  const handleOpenEditBundle = (bundle: BundleProduct) => {
    setEditingBundleId(bundle.id || bundle.name);
    setBundleName(bundle.name);
    setBundlePrice(String(bundle.price));
    setBundlePriceRS(bundle.priceRS ? String(bundle.priceRS) : '');
    setBundleRankName(bundle.rankName);
    setBundleCoinAmount(String(bundle.coinAmount));
    setBundleImage(bundle.imageUrl);
    setBundleDesc(bundle.description);
    setBundleIsPinned(bundle.isPinned || false);
    setShowBundleForm(true);
  };

  const handleTogglePinBundle = async (bundle: BundleProduct) => {
    const id = bundle.id || bundle.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const bPinned = !bundle.isPinned;
    try {
      const docRef = doc(db, 'bundles', id);
      await setDoc(docRef, {
        name: bundle.name,
        price: bundle.price,
        imageUrl: bundle.imageUrl,
        description: bundle.description,
        rankName: bundle.rankName,
        coinAmount: bundle.coinAmount,
        isPinned: bPinned,
        priceRS: bundle.priceRS || null
      }, { merge: true });
      toast.success(bPinned ? `Pinned "${bundle.name}" to homepage!` : `Unpinned "${bundle.name}" from homepage!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bundles/${id}`);
    }
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleName || !bundlePrice || !bundleRankName || !bundleCoinAmount || !bundleImage || !bundleDesc) {
      toast.error("Please fill in all bundle metadata details.");
      return;
    }

    const priceNum = parseFloat(bundlePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please specify a valid numeric price.");
      return;
    }

    const coinAmountNum = parseInt(bundleCoinAmount);
    if (isNaN(coinAmountNum) || coinAmountNum < 0) {
      toast.error("Please specify a valid coin amount.");
      return;
    }

    const priceRSNum = bundlePriceRS && bundlePriceRS.trim() !== '' ? parseFloat(bundlePriceRS) : undefined;
    if (priceRSNum !== undefined && (isNaN(priceRSNum) || priceRSNum < 0)) {
      toast.error("Please specify a valid numeric Rupee price or leave it empty for automatic conversion.");
      return;
    }

    const bundlePayload: any = {
      name: bundleName,
      price: priceNum,
      imageUrl: bundleImage,
      description: bundleDesc,
      rankName: bundleRankName,
      coinAmount: coinAmountNum,
      isPinned: bundleIsPinned
    };

    if (priceRSNum !== undefined) {
      bundlePayload.priceRS = priceRSNum;
    } else {
      bundlePayload.priceRS = null;
    }

    try {
      if (editingBundleId) {
        const docRef = doc(db, 'bundles', editingBundleId);
        await setDoc(docRef, bundlePayload, { merge: true });
        toast.success("Combo bundle updated successfully!");
      } else {
        const docId = bundleName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(db, 'bundles', docId);
        await setDoc(docRef, bundlePayload);
        toast.success("New combo bundle created!");
      }
      await ensureCatalogInitialized();
      setShowBundleForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bundles/${editingBundleId || 'new'}`);
    }
  };

  const handleDeleteBundle = async (id: string | undefined, name: string) => {
    const targetId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerConfirmation(
      "Confirm Combo Bundle Deletion",
      `Are you sure you want to delete combo bundle "${name}"? This action is permanent and cannot be undone.`,
      async () => {
        try {
          if (!id) {
            // Promote all other default bundles to live Firestore collection so this one is effectively deleted
            const toastId = toast.loading("Initializing live bundle database...");
            for (const bundle of DEFAULT_BUNDLES) {
              const docId = bundle.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              if (docId === targetId) continue;
              await setDoc(doc(db, 'bundles', docId), {
                name: bundle.name,
                price: bundle.price,
                imageUrl: bundle.imageUrl,
                description: bundle.description,
                rankName: bundle.rankName,
                coinAmount: bundle.coinAmount,
                isPinned: false
              });
            }
            toast.success("Initialized database and deleted combo bundle successfully!", { id: toastId });
          } else {
            await deleteDoc(doc(db, 'bundles', id));
            toast.success("Combo bundle deleted successfully!");
          }
          await ensureCatalogInitialized();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `bundles/${targetId}`);
        }
      }
    );
  };

  const handleSeedDefaultProducts = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    const toastId = toast.loading("Publishing default catalog to live database...");
    try {
      // 1. Seed Ranks
      for (const rank of DEFAULT_RANKS) {
        const docId = rank.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await setDoc(doc(db, 'ranks', docId), {
          name: rank.name,
          price: rank.price,
          imageUrl: rank.imageUrl,
          inventoryScreenshot: rank.inventoryScreenshot,
          description: rank.description,
          isPinned: true
        });
      }

      // 2. Seed Coins
      for (const coin of DEFAULT_COINS) {
        const docId = coin.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await setDoc(doc(db, 'coins', docId), {
          name: coin.name,
          coinAmount: coin.coinAmount,
          price: coin.price,
          imageUrl: coin.imageUrl,
          description: coin.description,
          isPinned: coin.name.includes("Diamond")
        });
      }

      // 3. Seed Bundles
      for (const bundle of DEFAULT_BUNDLES) {
        const docId = bundle.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await setDoc(doc(db, 'bundles', docId), {
          name: bundle.name,
          price: bundle.price,
          imageUrl: bundle.imageUrl,
          description: bundle.description,
          rankName: bundle.rankName,
          coinAmount: bundle.coinAmount,
          isPinned: false
        });
      }

      toast.success("Default products catalog successfully written to Firestore database!", { id: toastId });
      await ensureCatalogInitialized();
    } catch (err: any) {
      console.error("Seeding failed:", err);
      toast.error("Initialization failed: Check writes permissions.", { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  // --- ACTIONS: ADMIN ACCESS MANAGEMENT ---
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToGrant = newAdminEmail.trim().toLowerCase();
    
    if (!emailToGrant) {
      toast.error("Please provide a valid email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToGrant)) {
      toast.error("Please enter a valid email address format.");
      return;
    }

    if (emailToGrant === 'yoorasher@gmail.com' || emailToGrant === 'attideyt71@gmail.com') {
      toast.error("This email is already the bootstrapped owner.");
      return;
    }

    // Check if duplicate admin
    const alreadyAdmin = adminsList.some(a => a.email.toLowerCase() === emailToGrant);
    if (alreadyAdmin) {
      toast.error("This email address is already granted admin access.");
      return;
    }

    try {
      const docId = emailToGrant;
      const ref = doc(db, 'admins', docId);
      await setDoc(ref, {
        email: emailToGrant,
        role: newAdminRole,
        createdAt: serverTimestamp()
      });
      toast.success(`Successfully granted Admin access to ${emailToGrant}!`);
      setNewAdminEmail('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${emailToGrant}`);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    const lowerEmail = email.toLowerCase();
    const lowerId = id.toLowerCase();
    if (
      lowerEmail === 'yoorasher@gmail.com' || 
      lowerId === 'yoorasher@gmail.com' ||
      lowerEmail === 'attideyt71@gmail.com' ||
      lowerId === 'attideyt71@gmail.com'
    ) {
      toast.error("Cannot revoke access from the primary developer owner account.");
      return;
    }

    triggerConfirmation(
      "Revoke Admin Access",
      `Are you sure you want to revoke Admin access from ${email}? This user will lose access to all staff commands.`,
      async () => {
        try {
          await deleteDoc(doc(db, 'admins', id));
          toast.success(`Revoked Admin access from ${email}.`);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `admins/${id}`);
        }
      },
      "Revoke Access"
    );
  };

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.minecraftUsername.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0A0A0A]">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-lg border border-[#B30000]/30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/20 text-[#FF3E3E] rounded-lg border border-[#B30000]/50 font-mono">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-white">STAFF PRIVILEGE CONSOLE</h1>
            <p className="text-zinc-500 text-xs">Verify gamer receipts, publish custom slots, and adjust products inventory.</p>
          </div>
        </div>
        <div className="p-2 py-1 bg-[#B30000]/10 border border-[#B30000]/30 rounded text-xs font-mono text-[#FF3E3E] self-start md:self-auto font-bold uppercase">
          Administrator Terminal
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-900 text-xs sm:text-sm font-mono gap-1 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth pb-0.5">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'orders' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Orders Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('ranks')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'ranks' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Rank Listings
        </button>
        <button
          onClick={() => setActiveTab('coins')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'coins' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Coin Pack Configs
        </button>
        <button
          onClick={() => setActiveTab('bundles')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'bundles' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Combo Bundles
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'admins' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Staff & Access
        </button>
        <button
          id="admin-settings-tab"
          onClick={() => setActiveTab('settings')}
          className={`flex-shrink-0 px-4 py-3 border-b-2 font-bold uppercase transition-all ${
            activeTab === 'settings' ? 'border-[#B30000] text-[#FF3E3E]' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Site Settings
        </button>
      </div>

      {/* TABS CONTAINER */}
      <div>
        
        {isUsingAnyFallback && (
          <div className="mb-8 bg-amber-950/15 border border-amber-500/30 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <div className="space-y-1">
              <h3 className="text-amber-500 font-mono font-bold text-sm uppercase flex items-center gap-1.5 leading-none">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Initialize Live Catalog
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans pt-1">
                Your shop database is currently empty and displaying read-only fallback mock items from code. Click <strong className="text-amber-400">"Publish Default Catalog"</strong> to write all pre-designed VIP ranks, coin chests, and combo bundles to your live Firestore database, which enables full editing, pinning, and deletion.
              </p>
            </div>
            <button
              id="admin-seed-db-button"
              onClick={handleSeedDefaultProducts}
              disabled={isSeeding}
              className="flex-shrink-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-black disabled:text-zinc-500 text-xs font-mono font-bold rounded uppercase transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:cursor-not-allowed"
            >
              {isSeeding ? "Publishing Catalog..." : "Publish Default Catalog"}
            </button>
          </div>
        )}
        
        {/* TAB 1: ORDER LOGISTICS FLOW */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Search filter bar */}
            <div className="flex bg-zinc-950 border border-zinc-900 rounded px-3 py-1 items-center max-w-sm">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input
                id="admin-search-orders"
                type="text"
                placeholder="Search Order ID / Player name"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-transparent border-none focus:outline-none p-1.5 text-xs sm:text-sm text-white w-full placeholder-zinc-700 font-mono"
              />
            </div>

            {loadingData ? (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-[#B30000] animate-spin" />
                <span className="text-xs text-zinc-500 font-mono">Loading server queues...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-zinc-900 rounded-lg text-zinc-500">
                No orders identified matching requirements.
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-900 rounded-lg">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-400 font-mono border-b border-zinc-900">
                      <th className="p-4 px-6">ID & Status</th>
                      <th className="p-4">Customer Gamer Details</th>
                      <th className="p-4">Selected Inventory Product</th>
                      <th className="p-4">Paid Cost</th>
                      <th className="p-4 text-right">Actions Queue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id || ord.orderId} className="hover:bg-zinc-950/20 transition-colors">
                        <td className="p-4 px-6">
                          <strong className="block font-mono text-[#FF3E3E] select-all">{ord.orderId}</strong>
                          <span className={`inline-block text-[9.5px] font-mono px-2 py-0.5 rounded border mt-1.5 ${
                            ord.status === 'Confirmed' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                            ord.status === 'Rejected' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                            'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 animate-pulse'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-white">
                            <User className="w-3.5 h-3.5 text-zinc-500" />
                            <strong className="font-mono">{ord.minecraftUsername}</strong>
                          </div>
                          <span className="block text-zinc-500 text-[11px] select-all">{ord.email}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-zinc-200 block font-semibold">{ord.productName}</span>
                          <span className="block text-[10px] text-zinc-600 font-mono uppercase">Type: {ord.productType}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-zinc-100 text-xs">
                          {formatPrice(ord.price, ord.priceRS)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {ord.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleConfirmOrder(ord.orderId)}
                                  className="p-1.5 px-3 bg-green-950/20 border border-green-800 text-green-400 hover:bg-green-800 hover:text-white rounded text-xs font-mono font-semibold transition"
                                >
                                  Apply perks
                                </button>
                                <button
                                  onClick={() => handleOpenReject(ord.orderId)}
                                  className="p-1.5 px-3 bg-red-950/20 border border-red-800 text-red-400 hover:bg-red-800 hover:text-white rounded text-xs font-mono font-semibold transition"
                                >
                                  Reject request
                                </button>
                              </>
                            ) : (
                              <span className="text-zinc-600 text-xs italic font-mono uppercase">Verified</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RANKS CRUDS */}
        {activeTab === 'ranks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-sans font-bold uppercase text-white">Total Published Ranks ({ranks.length})</h3>
              <button
                onClick={handleOpenAddRank}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Produce New Rank
              </button>
            </div>

            {/* Rank Items Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ranks.map((r) => (
                <div key={r.id || r.name} className="flex bg-[#0C0C0C] border border-zinc-900 rounded-lg p-5 gap-4 relative font-sans">
                  <img src={r.imageUrl} alt={`${r.name} rank thumbnail for the OGzz MC admin catalog`} className="w-16 h-16 object-cover rounded bg-zinc-950" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white uppercase text-md">{r.name}</h4>
                      <strong className="text-[#FF3E3E] font-mono text-xs">{formatPrice(r.price, r.priceRS)}</strong>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{r.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleOpenEditRank(r)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white text-xs transition duration-200"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#B30000]" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRank(r.id, r.name)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-red-500 text-xs transition duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button
                        onClick={() => handleTogglePinRank(r)}
                        className={`flex items-center gap-1 text-xs transition-all duration-200 uppercase font-mono tracking-wider ml-auto ${
                          r.isPinned
                            ? 'text-amber-500 hover:text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-zinc-650 hover:text-zinc-400'
                        }`}
                        title={r.isPinned ? "Pinned in Home Featured" : "Pin to Home Featured"}
                      >
                        <Pin className={`w-3.5 h-3.5 ${r.isPinned ? 'fill-amber-500' : ''}`} />
                        {r.isPinned ? 'Pinned' : 'Pin to Home'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crud modal rank form */}
            {showRankForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                <div className="relative w-full max-w-lg bg-[#0C0C0C] border border-[#B30000]/40 rounded-xl overflow-hidden p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h4 className="text-md font-sans font-bold uppercase text-[#FF3E3E]">
                      {editingRankId ? "Mod Rank Settings" : "Incorporate Premium Rank Product"}
                    </h4>
                    <button onClick={() => setShowRankForm(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveRank} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">Rank Name</label>
                        <input
                          type="text"
                          required
                          value={rankName}
                          onChange={(e) => setRankName(e.target.value)}
                          placeholder="e.g. TITAN Rank"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">USD Price</label>
                        <input
                          type="text"
                          required
                          value={rankPrice}
                          onChange={(e) => setRankPrice(e.target.value)}
                          placeholder="e.g. 49.99"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">RS Price (Manual, Optional)</label>
                        <input
                          type="text"
                          value={rankPriceRS}
                          onChange={(e) => setRankPriceRS(e.target.value)}
                          placeholder="Automatic: USD * 84"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Badge Emblem Image URL</label>
                      <input
                        type="url"
                        required
                        value={rankImage}
                        onChange={(e) => setRankImage(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">In-Game Screenshot URL (Preview perks)</label>
                      <input
                        type="url"
                        required
                        value={rankScreenshot}
                        onChange={(e) => setRankScreenshot(e.target.value)}
                        placeholder="https://example.com/screenshot.png"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Bullet Perks Description List</label>
                      <textarea
                        required
                        rows={4}
                        value={rankDesc}
                        onChange={(e) => setRankDesc(e.target.value)}
                        placeholder="• Custom VIP tag prefix&#10;• Set up to 3 homes"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        id="rank-form-pinned"
                        type="checkbox"
                        checked={rankIsPinned}
                        onChange={(e) => setRankIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-950 border-zinc-900 text-[#B30000] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="rank-form-pinned" className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 cursor-pointer select-none flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                        Pin to Featured Section
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition"
                    >
                      {editingRankId ? "Save configuration adjustments" : "Publish to live store"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COIN PACKS */}
        {activeTab === 'coins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-sans font-bold uppercase text-white">Active Coin packs ({coinsList.length})</h3>
              <button
                onClick={handleOpenAddCoin}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Produce Coin Pack
              </button>
            </div>

            {/* Coin slots mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coinsList.map((c) => (
                <div key={c.id || c.name} className="flex bg-[#0C0C0C] border border-zinc-900 rounded-lg p-5 gap-4 relative">
                  <img src={c.imageUrl} alt={`${c.name} coin pack thumbnail for the OGzz MC admin catalog`} className="w-16 h-16 object-cover rounded bg-zinc-950" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white uppercase text-md">{c.name}</h4>
                        <span className="text-xs text-yellow-500 font-mono">{c.coinAmount.toLocaleString()} Coins</span>
                      </div>
                      <strong className="text-[#FF3E3E] font-mono text-xs">{formatPrice(c.price, c.priceRS)}</strong>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleOpenEditCoin(c)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white text-xs transition duration-200"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#B30000]" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoin(c.id, c.name)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-red-500 text-xs transition duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button
                        onClick={() => handleTogglePinCoin(c)}
                        className={`flex items-center gap-1 text-xs transition-all duration-200 uppercase font-mono tracking-wider ml-auto ${
                          c.isPinned
                            ? 'text-amber-500 hover:text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-zinc-650 hover:text-zinc-400'
                        }`}
                        title={c.isPinned ? "Pinned in Home Featured" : "Pin to Home Featured"}
                      >
                        <Pin className={`w-3.5 h-3.5 ${c.isPinned ? 'fill-amber-500' : ''}`} />
                        {c.isPinned ? 'Pinned' : 'Pin to Home'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coin Crud configuration Form overlay */}
            {showCoinForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                <div className="relative w-full max-w-lg bg-[#0C0C0C] border border-[#B30000]/40 rounded-xl overflow-hidden p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h4 className="text-md font-sans font-bold uppercase text-[#FF3E3E]">
                      {editingCoinId ? "Mod Coin Pack Settings" : "Introduce New Currency Pack"}
                    </h4>
                    <button onClick={() => setShowCoinForm(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCoin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Bundle Name Code</label>
                      <input
                        type="text"
                        required
                        value={coinName}
                        onChange={(e) => setCoinName(e.target.value)}
                        placeholder="e.g. Iron Coin Stack"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">Virtual Coin Amount</label>
                        <input
                          type="number"
                          required
                          value={coinAmount}
                          onChange={(e) => setCoinAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">Price tag cost ($)</label>
                        <input
                          type="text"
                          required
                          value={coinPrice}
                          onChange={(e) => setCoinPrice(e.target.value)}
                          placeholder="e.g. 19.99"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">RS Cost (Manual, Optional)</label>
                        <input
                          type="text"
                          value={coinPriceRS}
                          onChange={(e) => setCoinPriceRS(e.target.value)}
                          placeholder="Automatic: USD * 84"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-[#B30000]">Illustrated Coin Banner URL</label>
                      <input
                        type="url"
                        required
                        value={coinImage}
                        onChange={(e) => setCoinImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Brief Bullet highlight</label>
                      <textarea
                        required
                        value={coinDesc}
                        onChange={(e) => setCoinDesc(e.target.value)}
                        placeholder="Includes 500 bonus coins free (20% extra added value!)"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        id="coin-form-pinned"
                        type="checkbox"
                        checked={coinIsPinned}
                        onChange={(e) => setCoinIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-950 border-zinc-900 text-[#B30000] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="coin-form-pinned" className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 cursor-pointer select-none flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                        Pin to Featured Section
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition"
                    >
                      {editingCoinId ? "Apply adjustments" : "Publish bundle package"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BUNDLES CRUDS */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-sans font-bold uppercase text-white">Active Combo Bundles ({bundlesList.length})</h3>
              <button
                onClick={handleOpenAddBundle}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Produce Combo Bundle
              </button>
            </div>

            {/* Bundle slots mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundlesList.map((b) => (
                <div key={b.id || b.name} className="flex bg-[#0C0C0C] border border-zinc-900 rounded-lg p-5 gap-4 relative">
                  <img src={b.imageUrl} alt={`${b.name} bundle thumbnail for the OGzz MC admin catalog`} className="w-16 h-16 object-cover rounded bg-zinc-950" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white uppercase text-md">{b.name}</h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="text-[10px] bg-red-950/20 text-red-400 px-1.5 py-0.5 rounded font-mono border border-red-950">
                            👑 {b.rankName}
                          </span>
                          <span className="text-[10px] bg-yellow-950/20 text-yellow-500 px-1.5 py-0.5 rounded font-mono border border-yellow-950">
                            💰 {b.coinAmount.toLocaleString()} Coins
                          </span>
                        </div>
                      </div>
                      <strong className="text-[#FF3E3E] font-mono text-xs">{formatPrice(b.price, b.priceRS)}</strong>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed pt-1">{b.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleOpenEditBundle(b)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white text-xs transition duration-200"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#B30000]" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBundle(b.id, b.name)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-red-500 text-xs transition duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button
                        onClick={() => handleTogglePinBundle(b)}
                        className={`flex items-center gap-1 text-xs transition-all duration-200 uppercase font-mono tracking-wider ml-auto ${
                          b.isPinned
                            ? 'text-amber-500 hover:text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-zinc-650 hover:text-zinc-400'
                        }`}
                        title={b.isPinned ? "Pinned in Home Featured" : "Pin to Home Featured"}
                      >
                        <Pin className={`w-3.5 h-3.5 ${b.isPinned ? 'fill-amber-500' : ''}`} />
                        {b.isPinned ? 'Pinned' : 'Pin to Home'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bundle Crud configuration Form overlay */}
            {showBundleForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                <div className="relative w-full max-w-lg bg-[#0C0C0C] border border-[#B30000]/40 rounded-xl overflow-hidden p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h4 className="text-md font-sans font-bold uppercase text-[#FF3E3E]">
                      {editingBundleId ? "Mod Combo Bundle Settings" : "Introduce New Combo Bundle"}
                    </h4>
                    <button onClick={() => setShowBundleForm(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBundle} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Bundle Name Code</label>
                      <input
                        type="text"
                        required
                        value={bundleName}
                        onChange={(e) => setBundleName(e.target.value)}
                        placeholder="e.g. STARTER PACK COMBO"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400 font-bold">Unlocks Lifetime Rank</label>
                        <select
                          value={bundleRankName}
                          onChange={(e) => setBundleRankName(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none"
                        >
                          <option value="">Select a Lifetime Rank</option>
                          {ranks.map(r => (
                            <option key={r.id || r.name} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">Coins Amount Included</label>
                        <input
                          type="number"
                          required
                          value={bundleCoinAmount}
                          onChange={(e) => setBundleCoinAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">Price tag cost ($)</label>
                        <input
                          type="text"
                          required
                          value={bundlePrice}
                          onChange={(e) => setBundlePrice(e.target.value)}
                          placeholder="e.g. 39.99"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-zinc-400">RS Cost (Manual, Optional)</label>
                        <input
                          type="text"
                          value={bundlePriceRS}
                          onChange={(e) => setBundlePriceRS(e.target.value)}
                          placeholder="Automatic: USD * 84"
                          className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Combo Illustration/Banner URL</label>
                      <input
                        type="url"
                        required
                        value={bundleImage}
                        onChange={(e) => setBundleImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-zinc-400">Description tagline/highlights</label>
                      <textarea
                        required
                        value={bundleDesc}
                        onChange={(e) => setBundleDesc(e.target.value)}
                        placeholder="Combines lifetime VIP Rank with huge coins package. Save 35% on this combo pack!"
                        className="w-full bg-zinc-950 border border-zinc-950 focus:border-[#B30000] p-2 rounded text-sm text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        id="bundle-form-pinned"
                        type="checkbox"
                        checked={bundleIsPinned}
                        onChange={(e) => setBundleIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-950 border-zinc-900 text-[#B30000] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="bundle-form-pinned" className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 cursor-pointer select-none flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                        Pin to Featured Section
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition"
                    >
                      {editingBundleId ? "Apply adjustments" : "Publish combo bundle"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STAFF ACCESS AND CONTROL PATTERN */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
              <div className="space-y-1.5">
                <h3 className="text-lg font-sans font-bold uppercase text-white tracking-widest flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF3E3E]" /> Admin & Staff Privileges
                </h3>
                <p className="text-zinc-500 text-xs">
                  Authorize other administrators by email to log into the OGzz Minecraft Secure Terminal Panel.
                </p>
              </div>

              {/* Quick statistics */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#0C0C0C] border border-zinc-900 rounded-lg text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Administrators</span>
                  <span className="text-lg font-black text-white font-mono">{adminsList.length + 1}</span>
                </div>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Grant Access Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0C0C0C] border border-zinc-900 rounded-xl p-6 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-zinc-900 pb-2">
                    Grant Dashboard Access
                  </h4>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Admin Email Address
                      </label>
                      <input 
                        type="email"
                        required
                        placeholder="e.g. staff@ogzzstore.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-amber-600 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Select Role / Title
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        className="w-full bg-[#050505] border border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-600 font-mono"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Owner">Owner</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#B30000] hover:bg-[#D60000] font-bold text-white font-mono text-xs uppercase tracking-wider rounded-lg transition"
                    >
                      Authorize Administrator
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Registered/Authorized Staff and Search */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#0C0C0C] border border-zinc-900 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3E3E]">
                      Current Authorized Staff
                    </h4>
                    
                    {/* Compact Search */}
                    <div className="relative max-w-xs">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                      <input
                        type="text"
                        placeholder="Search email..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="bg-[#050505] border border-zinc-900 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-950 font-mono w-44"
                      />
                    </div>
                  </div>

                  {/* Table or list representation */}
                  <div className="divide-y divide-zinc-950 max-h-[400px] overflow-y-auto pr-1">
                    {/* 1. Primordial static owner account */}
                    <div className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white font-mono">yoorasher@gmail.com</span>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono text-amber-400 uppercase font-black tracking-widest">
                            Bootstrapped Owner
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500">Primary Administrator credentials</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase">System Lock</span>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-zinc-400 font-mono">attideyt71@gmail.com</span>
                          <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-widest">
                            System Developer
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500">Backup system maintenance credentials</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase">System Lock</span>
                    </div>

                    {/* 2. Dynamically added administrators */}
                    {adminsList
                      .filter(a => a.email.toLowerCase().includes(adminSearch.toLowerCase()))
                      .map((admin) => (
                        <div key={admin.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-white font-mono">{admin.email}</span>
                              <span className="px-1.5 py-0.5 bg-red-950/20 border border-red-900/30 rounded text-[9px] font-mono text-[#FF3E3E] uppercase font-bold tracking-widest">
                                {admin.role}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-zinc-500">
                              Added: {admin.createdAt?.seconds ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'Instant Setup'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteAdmin(admin.id!, admin.email)}
                            className="p-1 px-2.5 bg-zinc-950 hover:bg-red-950/20 hover:text-red-400 border border-zinc-900 rounded text-zinc-500 transition text-[10px] font-mono uppercase flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Revoke
                          </button>
                        </div>
                    ))}

                    {adminsList.length === 0 && (
                      <div className="py-8 text-center">
                        <span className="text-xs font-mono text-zinc-600 block">No custom staff emails added yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SITE CUSTOMIZATION SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-[#0C0C0C] border border-zinc-900 rounded-xl p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-1.5 border-b border-zinc-900 pb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Dynamic Site Configuration</h3>
              <p className="text-zinc-500 text-xs text-pretty leading-relaxed">
                Control key public information displayed across our website homepages, buttons, and system reminders without modifying code modules manually.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!siteIP.trim() || !siteInvite.trim()) {
                  toast.error("Both parameters cannot be empty values!");
                  return;
                }
                setIsSavingSettings(true);
                try {
                  await updateSettings({
                    serverIP: siteIP.trim(),
                    discordLink: siteInvite.trim(),
                    backgroundImage: siteBgImage.trim(),
                    logoUrl: siteLogoUrl.trim(),
                    announcementText: siteAnnouncementText.trim(),
                    heroTitle: siteHeroTitle.trim(),
                    heroSubtitle: siteHeroSubtitle.trim(),
                    systemLocked: siteLocked,
                    termsAndConditions: siteTerms.trim(),
                  });
                  toast.success("Site configuration successfully saved!");
                } catch (err) {
                  console.error("Failed to commit settings", err);
                  toast.error("Network write rejected. Please verify database role privileges.");
                } finally {
                  setIsSavingSettings(false);
                }
              }}
              className="space-y-5"
            >
              {/* Server IP block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Website Home Minecraft Server IP
                </label>
                <input
                  id="admin-settings-server-ip"
                  type="text"
                  required
                  placeholder="e.g. play.ogzzmc.net"
                  value={siteIP}
                  onChange={(e) => setSiteIP(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  This value governs the copyable server IP displayed on the hero banner copy-box of the homepage.
                </p>
              </div>

              {/* Discord Link block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Official Discord Server Invite Link
                </label>
                <input
                  id="admin-settings-discord-link"
                  type="url"
                  required
                  placeholder="e.g. https://discord.gg/inviteCode"
                  value={siteInvite}
                  onChange={(e) => setSiteInvite(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Controls all Join Buttons and Discord references across the Ticket Delivery steps, Navbar/Footer, and Checkout popups.
                </p>
              </div>

              {/* Custom Website Logo Link block */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Custom Website Logo URL (Optional Link)
                </label>
                <input
                  id="admin-settings-logo-url"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={siteLogoUrl}
                  onChange={(e) => setSiteLogoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Optional. Provide a standard image web link (HTTPS logo image) to override our default red gamepad logo icon in the Navbar and Loader screen.
                </p>

                {/* Live Logo Preview Box */}
                {siteLogoUrl.trim() && (
                  <div className="mt-3 p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl border border-[#B30000]/50 flex items-center justify-center p-0 overflow-hidden shadow-[0_0_15px_rgba(179,0,0,0.3)] bg-transparent">
                      <img 
                        referrerPolicy="no-referrer"
                        src={siteLogoUrl.trim()} 
                        alt="Preview of the OGzz MC Store custom logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Live Logo Connection Preview</span>
                      <p className="text-[10px] text-zinc-500">Double-check the proportions. Squares or circular images look best.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Hero Background Image Link block */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Custom Hero Background Image URL (Optional)
                </label>
                <input
                  id="admin-settings-bg-image"
                  type="text"
                  placeholder="https://example.com/minecraft-wallpaper.jpg"
                  value={siteBgImage}
                  onChange={(e) => setSiteBgImage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Optional. Provide a standard image link (HTTPS) of a background wallpaper. Clear this field to revert to the default dark nebula effect.
                </p>

                {/* Live Sandbox Preview */}
                {siteBgImage.trim() && (
                  <div className="mt-3 p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                    <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 block mb-2">Live Background Connection Preview:</span>
                    <div className="relative w-full h-28 rounded-md overflow-hidden bg-zinc-900 border border-zinc-850 flex items-center justify-center">
                      <img 
                        referrerPolicy="no-referrer"
                        src={siteBgImage.trim()} 
                        alt="Preview of the OGzz MC Store hero background image"
                        className="w-full h-full object-cover opacity-100 brightness-75 transition-all"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-black/70 text-center font-mono text-[9px] text-[#FF3E3E]">
                        Preview Window
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Announcement Badge Text block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Announcement Badge Text
                </label>
                <input
                  id="admin-settings-announcement-text"
                  type="text"
                  placeholder="e.g. Season 3: Nether Realms Open!"
                  value={siteAnnouncementText}
                  onChange={(e) => setSiteAnnouncementText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Controls the text inside the glowing announcement badge at the top of the homepage (e.g. "Season 3: Nether Realms Open!").
                </p>
              </div>

              {/* Custom Hero Title block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Store Hero Banner Title
                </label>
                <input
                  id="admin-settings-hero-title"
                  type="text"
                  placeholder="e.g. OGZZ MC STORE"
                  value={siteHeroTitle}
                  onChange={(e) => setSiteHeroTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Customize the main high-contrast text title on the homepage hero section.
                </p>
              </div>

              {/* Custom Hero Subtitle block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Store Hero Subtitle / Description
                </label>
                <textarea
                  id="admin-settings-hero-subtitle"
                  rows={3}
                  placeholder="Upgrade your Minecraft experience..."
                  value={siteHeroSubtitle}
                  onChange={(e) => setSiteHeroSubtitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-sans"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Adjust the support message or promotional sub-header text on the homepage hero section.
                </p>
              </div>

              {/* System Lock Option block */}
              <div className="p-4 bg-red-950/25 border border-red-900/30 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-mono font-bold text-[#FF3E3E] tracking-wider block flex items-center gap-1.5 leading-none">
                      <Lock className="w-3.5 h-3.5 text-[#FF3E3E] animate-pulse" />
                      Enable System Lock (Maintenance Lockdown)
                    </label>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed tracking-wide pt-1">
                      When active, all standard store checkout capabilities and coin/rank creations are locked out. Normal user orders are suspended, and high-contrast system notifications replace the normal buying process widgets.
                    </p>
                  </div>
                  <input
                    id="admin-settings-system-lock-toggle"
                    type="checkbox"
                    checked={siteLocked}
                    onChange={(e) => setSiteLocked(e.target.checked)}
                    className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 text-[#B30000] focus:ring-0 focus:outline-none cursor-pointer mt-0.5 accent-red-600"
                  />
                </div>
              </div>

              {/* Terms & Conditions Block */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] uppercase font-mono font-bold text-[#B30000] tracking-wider block">
                  Store Terms & Conditions Content
                </label>
                <textarea
                  id="admin-settings-terms"
                  rows={10}
                  required
                  placeholder="Enter store terms and conditions guidelines..."
                  value={siteTerms}
                  onChange={(e) => setSiteTerms(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#B30000] p-3 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B30000] font-mono whitespace-pre-wrap leading-relaxed min-h-[160px]"
                />
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Configure the official billing conditions, refund policies, and delivery expectations checked by players before they click order.
                </p>
              </div>

              {/* Submit action button */}
              <div className="pt-2 border-t border-zinc-900 flex justify-end">
                <button
                  id="admin-settings-save-btn"
                  type="submit"
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition-all disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Site Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* REJECT MODAL PROMPT DRAWER */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0C0C0C] border border-[#B30000]/60 p-6 rounded-lg w-full max-w-sm text-white space-y-4 shadow-2xl animate-pulse">
            <h4 className="text-md font-sans font-bold uppercase text-red-500">Provide Rejection Reason</h4>
            <p className="text-zinc-500 text-xs">
              State why order <strong>{rejectId}</strong> is being rejected. Customers will review this feedback directly inside their log reports drawer.
            </p>
            <input
              type="text"
              required
              placeholder="e.g. No matching support ticket created / Incorrect Gamer Tag"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 p-2 text-xs rounded text-white focus:outline-none focus:border-red-600 font-sans"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setRejectId(null)}
                className="py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 font-mono text-xs uppercase rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrderSubmit}
                className="py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase rounded font-semibold"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BEAUTIFUL CUSTOM CONFIRMATION DIALOG MODAL */}
      {confirmModal.isOpen && (
        <div id="custom-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0C0C0C]/95 border-2 border-[#B30000]/80 p-6 rounded-lg w-full max-w-sm text-white space-y-4 shadow-[0_0_50px_rgba(179,0,0,0.3)] hover:shadow-[0_0_60px_rgba(179,0,0,0.4)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B30000]/15 border border-[#B30000]/50 flex items-center justify-center text-[#FF3E3E]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-md sm:text-lg font-mono font-bold uppercase text-[#FF3E3E] tracking-wider">{confirmModal.title}</h4>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
              {confirmModal.message}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="confirm-modal-cancel"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="py-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase rounded font-bold tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-modal-action"
                onClick={confirmModal.onConfirm}
                className="py-2.5 bg-[#B30000] hover:bg-red-600 border border-red-700 hover:border-red-500 text-white font-mono text-xs uppercase rounded font-bold tracking-wider hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-200"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
