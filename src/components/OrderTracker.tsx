import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { OrderItem } from '../types';
import { formatPrice } from '../utils/price';
import { Search, Loader2, HelpCircle, CheckCircle, Clock, XCircle, User, Calendar, CreditCard, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

export default function OrderTracker() {
  const { settings } = useSettings();
  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = searchId.trim().toUpperCase();
    
    if (!formattedId) {
      toast.error("Please enter a valid Order ID.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // Direct document lookup is much faster and cost-efficient than collection query
      const docRef = doc(db, 'orders', formattedId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setOrder({
          id: snapshot.id,
          ...snapshot.data()
        } as OrderItem);
        toast.success("Order retrieved successfully!");
      } else {
        toast.error("Order ID not found. Double check your spelling.");
      }
    } catch (err: any) {
      console.error("Order Tracker query failed:", err);
      toast.error("Could not fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-[#0A0A0A]">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">
          <span className="sr-only">Track Your Order</span>
          <span aria-hidden="true">ORDER <span className="text-[#B30000] drop-shadow-[0_0_15px_rgba(179,0,0,0.5)]">TRACKER</span></span>
        </h1>
        <p className="text-zinc-500 text-sm max-w-lg mx-auto">
          Need to confirm if your purchase status is complete? Input your OGZZ-XXXXXX order key below.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto space-y-4">
        <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-widest text-center">
          Enter Your Order Reference ID
        </label>
        <div className="flex p-1 bg-zinc-950 border border-zinc-800 focus-within:border-[#B30000] rounded-lg transition-colors">
          <input
            id="tracker-search-input"
            type="text"
            placeholder="OGZZ-847291"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-transparent border-none text-white font-mono focus:outline-none placeholder-zinc-700 text-sm"
          />
          <button
            id="tracker-submit-btn"
            type="submit"
            disabled={loading}
            className="flex items-center gap-1 px-5 bg-[#B30000] hover:bg-[#D60000] disabled:bg-zinc-800 text-white text-xs font-mono font-bold rounded-md uppercase transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Track
          </button>
        </div>
      </form>

      {/* Results Box */}
      <div className="max-w-lg mx-auto pt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <Loader2 className="w-8 h-8 text-[#B30000] animate-spin" />
            <span className="text-xs text-zinc-500 font-mono">Searching secure database index...</span>
          </div>
        )}

        {!loading && searched && !order && (
          <div className="bg-[#0C0C0C] border border-zinc-950 rounded-xl p-8 text-center space-y-4">
            <HelpCircle className="w-12 h-12 text-[#B30000] mx-auto opacity-40 animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-white font-semibold">No Order Information Found</h3>
              <p className="text-zinc-500 text-xs">
                We couldn't locate any records matching "{searchId.toUpperCase()}". It might take a minute to post, or check spelling.
              </p>
            </div>
          </div>
        )}

        {!loading && order && (
          <div className="bg-[#0C0C0C] border border-[#B30000]/30 rounded-xl shadow-[0_0_40px_rgba(179,0,0,0.08)] overflow-hidden">
            
            {/* Ticket Header & Status */}
            <div className={`p-5 flex items-center justify-between border-b border-zinc-900 ${
              order.status === 'Confirmed' ? 'bg-green-950/10' :
              order.status === 'Rejected' ? 'bg-red-950/10' : 'bg-yellow-950/10'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Order ID Reference</span>
                <h4 className="text-lg font-mono font-bold text-white tracking-wider">{order.orderId}</h4>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-zinc-950 border border-zinc-800">
                {order.status === 'Pending' && (
                  <>
                    <Clock className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    <span className="text-yellow-400">Pending</span>
                  </>
                )}
                {order.status === 'Confirmed' && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-400 font-bold">Confirmed</span>
                  </>
                )}
                {order.status === 'Rejected' && (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-red-400 font-bold">Rejected</span>
                  </>
                )}
              </div>
            </div>

            {/* Ticket Specs Table */}
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                
                <div className="space-y-1 bg-zinc-950/50 border border-zinc-950 p-3 rounded">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                    <User className="w-3.5 h-3.5 text-[#B30000]" />
                    <span>Minecraft IGN</span>
                  </div>
                  <strong className="text-white block font-mono font-semibold">{order.minecraftUsername}</strong>
                </div>

                <div className="space-y-1 bg-zinc-950/50 border border-zinc-950 p-3 rounded">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                    <CreditCard className="w-3.5 h-3.5 text-[#B30000]" />
                    <span>Cost Value</span>
                  </div>
                  <strong className="text-white block font-mono font-bold text-xs">{formatPrice(order.price, order.priceRS)}</strong>
                </div>

                <div className="col-span-2 space-y-1 bg-zinc-950/50 border border-zinc-950 p-3 rounded">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                    <MessageSquare className="w-3.5 h-3.5 text-[#B30000]" />
                    <span>Product Purchased</span>
                  </div>
                  <span className="text-zinc-200 block font-semibold text-xs sm:text-sm">
                    {order.productName} <span className="text-zinc-600 font-mono uppercase text-[10px] ml-1">({order.productType})</span>
                  </span>
                </div>

                <div className="col-span-2 space-y-1 bg-zinc-950/50 border border-zinc-950 p-3 rounded">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                    <Calendar className="w-3.5 h-3.5 text-[#B30000]" />
                    <span>Created Date</span>
                  </div>
                  <span className="text-zinc-300 block font-mono text-xs">{formatDate(order.createdAt)}</span>
                </div>

              </div>

              {/* Show Rejection Reason container if layout is rejected */}
              {order.status === 'Rejected' && order.rejectionReason && (
                <div className="p-3.5 bg-red-950/10 border border-red-900/30 rounded text-red-200 text-xs">
                  <strong className="text-red-400 font-mono uppercase text-[10px] tracking-wider block mb-1">
                    Staff Rejection Reason:
                  </strong>
                  "{order.rejectionReason}"
                </div>
              )}

              {/* Guide next step banner based on current ticket state */}
              <div className="pt-4 border-t border-zinc-900">
                {order.status === 'Pending' ? (
                  <div className="p-3 bg-blue-950/10 border border-blue-900/30 rounded text-center text-xs text-blue-300 leading-relaxed">
                    Make sure to create a support ticket in our <a href={settings.discordLink} target="_blank" rel="noreferrer" className="underline font-bold text-[#FF3E3E]">Discord Server</a>. Send this order code to staff so they can confirm and apply your items!
                  </div>
                ) : order.status === 'Confirmed' ? (
                  <div className="p-3 bg-green-950/10 border border-green-900/30 rounded text-center text-xs text-green-300">
                    Your order has been verified completely! Perks have been allocated. Thank you for supporting OGzz MC!
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded text-center text-xs text-zinc-500">
                    This order was rejected. Please review the reason above or open a new support ticket to dispute with administrators.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
