import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { OrderItem } from '../types';
import { formatPrice } from '../utils/price';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, CheckCircle, XCircle,
  User, ClipboardList, Loader2
} from 'lucide-react';

export default function UserDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until Firebase finishes restoring the persisted session before redirecting.
    if (authLoading) {
      return;
    }

    // Escort unauthenticated users out safely
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);

    const ordersColRef = collection(db, 'orders');
    // Query matching user's own UID
    const q = query(
      ordersColRef,
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList: OrderItem[] = [];
      snapshot.forEach((doc) => {
        ordersList.push({
          id: doc.id,
          ...doc.data()
        } as OrderItem);
      });
      // Sort client side as composite indexes on query + orderBy can take a long setup in Firebase
      ordersList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Orders listener threw error:", error);
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading, user, navigate]);

  // Total aggregator counters
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const rejectedOrders = orders.filter(o => o.status === 'Rejected').length;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0A0A0A]">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <Loader2 className="w-8 h-8 text-[#B30000] animate-spin" />
          <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
            Restoring player session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#0A0A0A]">
      
      {/* Upper User Greeting Board */}
      <div className="bg-zinc-950/40 border border-[#B30000]/20 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#B30000]/10 border border-[#B30000]/30 rounded-lg text-[#FF3E3E] shadow-inner font-mono">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF3E3E] bg-[#B30000]/10 px-2 py-0.5 rounded font-bold">
                Minecraft Player
              </span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-white uppercase mt-1">
              Active: <span className="text-[#B30000]">{profile?.minecraftUsername || 'Loading...'}</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">{profile?.email || user.email}</p>
          </div>
        </div>

        {/* Dashboard quick help */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg max-w-sm text-xs text-zinc-400 space-y-1 leading-relaxed">
          <span className="text-[#FF3E3E] font-mono uppercase text-[9px] font-bold tracking-widest">Store Process:</span>
          <p>Created orders enter a <strong>Pending</strong> state. Open a support ticket on our Discord and give your Order ID to our staff team to unlock the perks in-game!</p>
        </div>
      </div>

      {/* Numerical Stat Card Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Orders block */}
        <div className="bg-[#0C0C0C] border border-zinc-900 p-5 rounded-lg space-y-2 hover:border-[#B30000]/30 transition-all">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-mono uppercase tracking-wider">
            <span>Total Placed</span>
            <ClipboardList className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">{totalOrders}</div>
        </div>

        {/* Pending Card */}
        <div className="bg-[#0C0C0C] border border-zinc-900 p-5 rounded-lg space-y-2 hover:border-yellow-950 transition-all">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-yellow-400">{pendingOrders}</div>
        </div>

        {/* Confirmed Card */}
        <div className="bg-[#0C0C0C] border border-zinc-900 p-5 rounded-lg space-y-2 hover:border-green-950 transition-all">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Confirmed</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-green-400">{confirmedOrders}</div>
        </div>

        {/* Rejected Card */}
        <div className="bg-[#0C0C0C] border border-zinc-900 p-5 rounded-lg space-y-2 hover:border-red-950 transition-all">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-[#FF3E3E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-red-500">{rejectedOrders}</div>
        </div>

      </div>

      {/* Orders Table Container */}
      <div className="bg-[#0C0C0C] border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center">
          <h2 className="text-md font-sans font-bold uppercase text-white tracking-wider">
            Receipt Logs Ledger
          </h2>
          <span className="text-[10px] font-mono text-zinc-500">Auto-synchronized in real-time</span>
        </div>

        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#B30000] animate-spin" />
            <span className="text-xs text-zinc-500 font-mono">Syncing order catalog...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#B30000] mx-auto opacity-30" />
            <div className="space-y-1">
              <h4 className="text-white font-semibold">No Orders Booked</h4>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                Your receipt book is currently empty. Visit the VIP store or coins menu to queue your very first purchase!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/ranks"
                className="px-4 py-2 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
              >
                Go to Ranks
              </Link>
            </div>
          </div>
        ) : (
          /* Table Layout for Desktop / List for Mobile */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-zinc-950 font-mono text-zinc-400 font-semibold border-b border-zinc-900 select-none">
                    <th className="p-4 px-6">Order ID</th>
                    <th className="p-4">Product Detail</th>
                    <th className="p-4">Placed Date</th>
                    <th className="p-4">Sum Paid</th>
                    <th className="p-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {orders.map((ord) => (
                    <tr key={ord.id || ord.orderId} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="p-4 px-6 font-mono font-bold text-[#FF3E3E] select-all">
                        {ord.orderId}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {ord.productName} 
                        <span className="block text-[10px] text-zinc-500 font-mono font-normal uppercase mt-0.5">
                          Type: {ord.productType}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="p-4 font-mono text-xs font-semibold text-zinc-200">
                        {formatPrice(ord.price, ord.priceRS)}
                      </td>
                      <td className="p-4 space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10.5px] font-bold select-none border">
                          {ord.status === 'Pending' && (
                            <span className="text-yellow-400 border-yellow-500/20 bg-yellow-500/5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                              Pending Verification
                            </span>
                          )}
                          {ord.status === 'Confirmed' && (
                            <span className="text-green-400 border-green-500/20 bg-green-500/5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              Confirmed Applied
                            </span>
                          )}
                          {ord.status === 'Rejected' && (
                            <span className="text-red-400 border-red-500/20 bg-red-500/5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              Request Rejected
                            </span>
                          )}
                        </div>

                        {/* Display rejection reason inside cell beautifully */}
                        {ord.status === 'Rejected' && ord.rejectionReason && (
                          <div className="p-2.5 bg-red-950/10 border border-red-900/20 text-red-200 text-xs rounded max-w-xs leading-relaxed">
                            <strong className="block text-[9px] font-mono text-red-400 uppercase tracking-widest mb-0.5">Reason:</strong>
                            "{ord.rejectionReason}"
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based View */}
            <div className="block md:hidden divide-y divide-zinc-900">
              {orders.map((ord) => (
                <div key={ord.id || ord.orderId} className="p-5 space-y-4 hover:bg-zinc-950/20 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-505 font-mono uppercase">Order ID</span>
                      <strong className="block font-mono text-base text-[#FF3E3E] select-all">{ord.orderId}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-505 font-mono uppercase">Sum Paid</span>
                      <span className="block font-mono text-sm font-bold text-zinc-200">
                        {formatPrice(ord.price, ord.priceRS)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500 font-mono block mb-0.5">Product</span>
                      <span className="font-bold text-white block truncate">{ord.productName}</span>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5 block">
                        {ord.productType}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono block mb-0.5">Ordered On</span>
                      <span className="text-zinc-300 block">{formatDate(ord.createdAt)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900/50 flex flex-col gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[10.5px] font-bold select-none border">
                        {ord.status === 'Pending' && (
                          <span className="text-yellow-400 border-yellow-500/20 bg-yellow-500/5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                            Pending Verification
                          </span>
                        )}
                        {ord.status === 'Confirmed' && (
                          <span className="text-green-400 border-green-500/20 bg-green-500/5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Confirmed Applied
                          </span>
                        )}
                        {ord.status === 'Rejected' && (
                          <span className="text-red-400 border-red-500/20 bg-red-500/5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            Request Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {ord.status === 'Rejected' && ord.rejectionReason && (
                      <div className="p-3 bg-red-950/10 border border-red-900/20 text-red-200 text-xs rounded leading-relaxed mt-1">
                        <strong className="block text-[9px] font-mono text-red-400 uppercase tracking-widest mb-0.5">Reason:</strong>
                        "{ord.rejectionReason}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
