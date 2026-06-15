import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Gift, ArrowRight, MessageSquare, ExternalLink, Copy, Check, Loader2, Lock, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/price';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

interface OrderModalProps {
  product: {
    name: string;
    price: number;
    priceRS?: number;
    description?: string;
    imageUrl?: string;
  } | null;
  productType: 'rank' | 'coin' | 'bundle';
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({ product, productType, isOpen, onClose }: OrderModalProps) {
  const { user, profile } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState<1 | 2 | 3>(1); // Step 1: Discord Check, Step 2: Confirm Gamer ID & Cost, Step 3: Success Instructions
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen || !product) return null;

  // Generate random order ID formatted as OGZZ-XXXXXX where X is numeric
  const generateOrderId = () => {
    const min = 100000;
    const max = 999999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return `OGZZ-${randomNum}`;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!user) {
        toast.error("Please log in or register to purchase items.");
        return;
      }
      setStep(2);
    }
  };

  const handleConfirmOrder = async () => {
    if (settings?.systemLocked) {
      toast.error("The transaction system is locked. Transactions are temporarily suspended.");
      return;
    }

    if (!user || !profile) {
      toast.error("Please make sure you are logged into your account.");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions to proceed.");
      return;
    }

    setIsSubmitting(true);
    const generatedId = generateOrderId();

    const orderDocData = {
      orderId: generatedId,
      uid: user.uid,
      email: user.email || profile.email,
      minecraftUsername: profile.minecraftUsername,
      productType,
      productName: product.name,
      price: product.price,
      priceRS: (product as any).priceRS || null,
      status: 'Pending',
      createdAt: serverTimestamp()
    };

    try {
      // Use setDoc with the generated order ID as doc name so it's super structured
      const orderDocRef = doc(db, 'orders', generatedId);
      await setDoc(orderDocRef, orderDocData);
      
      setOrderId(generatedId);
      setStep(3);
      toast.success("Order request posted successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${generatedId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setStep(1);
    setOrderId('');
    setAcceptedTerms(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 3 ? resetAndClose : onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window Container (Upgraded to spacious layout for preview & description) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-3xl bg-[#0C0C0C] border border-[#B30000]/40 rounded-2xl shadow-[0_0_60px_rgba(179,0,0,0.25)] overflow-hidden text-white"
          id="order-checkout-modal"
        >
          {/* Header wrapper */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-zinc-950/50">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#B30000] animate-pulse" />
              <h3 className="text-md font-sans font-bold uppercase tracking-wider text-zinc-100">
                {step === 3 ? "Order Completed!" : `Purchase: ${product.name}`}
              </h3>
            </div>
            {step !== 3 && (
              <button
                onClick={onClose}
                className="p-1 px-2 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stepper indicators */}
          <div className="flex bg-zinc-950 font-mono text-xs text-center border-b border-zinc-900">
            <div className={`flex-1 py-2 ${step >= 1 ? 'text-[#FF3E3E] bg-[#B30000]/5 font-semibold' : 'text-zinc-500'}`}>
              1. Discord Check
            </div>
            <div className={`flex-1 py-2 border-x border-zinc-900 ${step >= 2 ? 'text-[#FF3E3E] bg-[#B30000]/5 font-semibold' : 'text-zinc-500'}`}>
              2. Confirm Details
            </div>
            <div className={`flex-1 py-2 ${step >= 3 ? 'text-[#FF3E3E] bg-[#B30000]/5 font-semibold' : 'text-zinc-500'}`}>
              3. Deliver Ticket
            </div>
          </div>

          {/* Body contents */}
          <div className="p-6 space-y-6">
            {settings?.systemLocked ? (
              <div className="space-y-4 py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-950/20 border-2 border-[#B30000]/60 flex items-center justify-center text-[#FF3E3E] shadow-[0_0_20px_rgba(179,0,0,0.2)] animate-pulse mb-2 font-black">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-md sm:text-lg font-mono font-bold uppercase text-[#FF3E3E] tracking-widest">
                  STORE VALVE LOCKED
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto font-sans leading-relaxed">
                  The checkout process has been frozen under a global <strong className="text-white">System Lock</strong>. Transactions are temporarily suspended by the primary administrator (<span className="text-[#FF3E3E] font-mono">yoorasher@gmail.com</span>) for scheduled maintenance and security configurations.
                </p>
                <div className="pt-4 w-full">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-[#B30000]/40 text-gray-300 hover:text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition-all"
                  >
                    Go Back To Catalog
                  </button>
                </div>
              </div>
            ) : (
              <>
            {/* Step 1: Discord membership reminder */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-950/20 border border-blue-900/60 rounded-lg text-sm text-blue-200 flex flex-col items-center text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-[#5865F2] drop-shadow-[0_0_8px_rgba(88,101,242,0.4)]" />
                  <p className="font-sans leading-relaxed">
                    "Please join our Discord server before placing an order."
                  </p>
                  <p className="text-xs text-blue-300">
                    Discord is our delivery desk. Staff will verify your receipt block and allocate premium roles in-game!
                  </p>
                </div>

                <a
                  href={settings.discordLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg shadow-lg shadow-blue-950/50 hover:shadow-blue-900/60 transition-all font-mono text-sm uppercase"
                >
                  Join Discord Guild <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={handleNextStep}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#B30000] hover:bg-[#D60000] text-white font-medium rounded-lg transition-all font-mono text-sm uppercase"
                >
                  I've Joined – Continue Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Minecraft ID confirmation & Purchase trigger (Highly Enhanced Big Preview and Description Area) */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">
                  Verify Order Overview
                </div>
                               {/* Dual-column Receipt Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-zinc-950/80 border border-zinc-900 p-5 rounded-xl">
                  
                  {/* Left part: Product image visual representation (Upgraded to generous size) */}
                  <div className="md:col-span-6 space-y-3">
                    <div 
                      onClick={() => setIsZoomed(true)}
                      className="relative aspect-video md:aspect-auto md:h-[340px] w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-850 flex items-center justify-center group cursor-zoom-in transition-all duration-300 hover:border-[#B30000]/50 hover:shadow-[0_0_20px_rgba(179,0,0,0.15)]"
                      title="Click to view full preview image"
                    >
                      {productType === 'rank' && (product as any).inventoryScreenshot ? (
                        <img 
                          src={(product as any).inventoryScreenshot} 
                          alt={`${product.name} detailed preview for the OGzz MC Minecraft Store`} 
                          className="w-full h-full object-contain p-1.5 opacity-95 transition-all duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (product as any).imageUrl ? (
                        <img 
                          src={(product as any).imageUrl} 
                          alt={`${product.name} product preview for the OGzz MC Minecraft Store`} 
                          className="w-full h-full object-contain p-1.5 opacity-95 transition-all duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xs">
                          No Preview
                        </div>
                      )}
                      
                      {/* Product type badge */}
                      <div className="absolute bottom-3 left-3 bg-[#B30000] text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-[#B30000]/60 uppercase tracking-wider select-none">
                        {productType} Pack
                      </div>

                      {/* Click to expand hover label overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <div className="bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-md text-xs font-mono text-[#FF3E3E] font-bold flex items-center gap-1.5 shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          VIEW FULL SIZE
                        </div>
                      </div>
                    </div>
                  </div>
 
                  {/* Right part: Description, stats & pricing receipt details (Optimized layout) */}
                  <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-bold text-white uppercase tracking-wide leading-tight">{product.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">Store Item Receipt Block</span>
                      </div>

                      {/* Display description if defined */}
                      {(product as any).description && (
                        <div className="text-[11px] text-zinc-400 font-sans leading-relaxed border-t border-zinc-900/60 pt-2 line-clamp-4">
                          {(product as any).description.split('\n').map((line: string, i: number) => {
                            const cleanLine = line.replace(/^[•\-\*\s]+/, '').trim();
                            return (
                              <span key={i} className="block">• {cleanLine}</span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-900/80">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-mono">Recipient:</span>
                        <span className="font-mono text-emerald-400 font-bold bg-zinc-900/90 py-0.5 px-2 rounded border border-zinc-800">
                          {profile?.minecraftUsername}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-zinc-500 font-mono">Total Order Core:</span>
                        <span className="font-mono text-[#FF3E3E] font-extrabold text-sm">
                          {product.price ? formatPrice(product.price, (product as any).priceRS) : "$0.00 (Rs. 0)"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-yellow-950/15 border border-yellow-950/30 rounded-lg text-[11px] text-yellow-500/90 leading-normal text-center font-sans">
                  * Verify your Minecraft character name spelling matches exactly. Permissions and virtual coins can only be allocated to valid active server player tags.
                </div>

                {/* Terms and Conditions Acceptance Checkbox */}
                <div className="p-3 bg-zinc-950 border border-zinc-900/80 rounded-lg flex items-start gap-3">
                  <input
                    id="checkout-accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-[#B30000] focus:ring-0 focus:outline-none cursor-pointer mt-0.5 accent-red-600"
                  />
                  <div className="text-xs leading-relaxed text-zinc-400 font-sans text-left">
                    I have read and agree to the{" "}
                    <a 
                      href="/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#FF3E3E] hover:text-[#D60000] font-bold underline inline-flex items-center gap-0.5"
                    >
                      Terms & Conditions
                      <ExternalLink className="w-3 h-3 inline pb-0.5" />
                    </a>{" "}
                    of the OGzz MC Store. All sales are final.
                  </div>
                </div>

                {/* Navigation actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:text-white text-gray-300 rounded-lg font-mono text-xs uppercase transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting || !acceptedTerms}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#B30000] hover:bg-[#D60000] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-950 text-white font-semibold rounded-lg shadow-lg shadow-red-950/30 font-mono text-xs uppercase hover:shadow-red-900/40 transition-all border border-[#B30000] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Receipt...
                      </>
                    ) : (
                      "Confirm & Order"
                    )}
                  </button>
                </div>
              </div>
            )}
            </>
            )}

            {/* Step 3: Success Instructions */}
            {step === 3 && (
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex p-3 bg-green-950/40 border border-green-500/30 rounded-full text-green-400 mb-2">
                  <CheckCircle className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white font-sans">Order Placed Under Review!</h4>
                  <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                    Your shopping ticket is booked in processing state under ID:
                  </p>
                </div>

                {/* Copiable order ID block */}
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded px-4 py-3 max-w-sm mx-auto font-mono text-md">
                  <span className="text-[#FF3E3E] font-bold">{orderId}</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-[#FF3E3E] transition-colors rounded text-xs text-gray-400"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Specific ticket creation mandate instructions */}
                <div className="p-4 bg-zinc-950 border border-red-900/40 rounded-lg text-sm text-zinc-300 max-w-md mx-auto space-y-2 text-left">
                  <span className="block font-semibold text-[#FF3E3E] text-xs font-mono uppercase tracking-widest text-center">
                    Critical Next Step:
                  </span>
                  <p className="leading-relaxed text-center font-bold">
                    "Go to Discord and create a support ticket. Send your Order ID to staff for verification."
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed text-center">
                    Once verified, staff will manually execute terminal commands to grant your VIP permissions or add coin balances immediately!
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={settings.discordLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 p-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg shadow-md font-mono text-xs uppercase"
                  >
                    Open Discord Ticket Hub <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <button
                  onClick={resetAndClose}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-mono uppercase mt-4"
                >
                  Close & View Dashboard
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>

      {/* Lightbox full preview overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out select-none"
            onClick={() => setIsZoomed(false)}
          >
            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-400 bg-zinc-950/80 border border-zinc-800 rounded px-2.5 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> CLICK ANYWHERE TO CLOSE
            </div>
            
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              {productType === 'rank' && (product as any).inventoryScreenshot ? (
                <img 
                  src={(product as any).inventoryScreenshot} 
                  alt={`${product.name} fullscreen preview for the OGzz MC Minecraft Store`} 
                  className="max-w-full max-h-full object-contain rounded-xl border border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                />
              ) : (product as any).imageUrl ? (
                <img 
                  src={(product as any).imageUrl} 
                  alt={`${product.name} fullscreen product preview for the OGzz MC Minecraft Store`} 
                  className="max-w-full max-h-full object-contain rounded-xl border border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                />
              ) : null}

              {/* Close button inside lightbox */}
              <button 
                onClick={() => setIsZoomed(false)}
                className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 rounded-full transition-all"
                title="Close fullscreen preview"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            <div className="mt-4 text-center space-y-1 bg-zinc-950/60 px-4 py-2 border border-zinc-900/40 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-sans font-bold text-white uppercase tracking-wider">{product.name}</span>
              <p className="text-xs text-zinc-400 font-mono">Full-Resolution High-Fidelity Asset Viewport</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
