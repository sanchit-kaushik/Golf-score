import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShieldCheck, Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { FEATURED_CHARITIES } from '../../data/content';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../lib/api';
import { loadRazorpayScript } from '../../lib/razorpay';
import { useAuth } from '../../context/AuthContext';

interface AdditionalDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharityId?: string;
  onDonationSuccess?: (donation: any) => void;
}

const ALLOWED_AMOUNTS = [250, 500, 1000, 2500];

export const AdditionalDonationModal: React.FC<AdditionalDonationModalProps> = ({
  isOpen,
  onClose,
  currentCharityId = 'youth-golf',
  onDonationSuccess,
}) => {
  const { user } = useAuth();
  const [selectedCharity, setSelectedCharity] = useState(currentCharityId);
  const [amount, setAmount] = useState<number>(500);
  const [donationState, setDonationState] = useState<
    'idle' | 'creating_order' | 'checkout' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedDonation, setVerifiedDonation] = useState<any | null>(null);

  // Sync selected charity if currentCharityId changes
  useEffect(() => {
    if (currentCharityId) {
      setSelectedCharity(currentCharityId);
    }
  }, [currentCharityId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDonationState('idle');
      setErrorMessage(null);
      setVerifiedDonation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCharity =
    FEATURED_CHARITIES.find((c) => c.id === selectedCharity) || FEATURED_CHARITIES[0];

  const handleDonate = async () => {
    setErrorMessage(null);
    setDonationState('creating_order');

    try {
      // 1. Ensure Razorpay SDK is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay !== 'function') {
        throw new Error(
          'Razorpay Checkout SDK is not available. Please verify your internet connection.'
        );
      }

      // 2. Call backend to create one-time donation order
      const orderRes = await api.donations.createOrder(selectedCharity, amount);
      if (!orderRes.success || !orderRes.orderId) {
        throw new Error('Failed to create donation order on server.');
      }

      setDonationState('checkout');

      // 3. Construct Razorpay options
      const options: any = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'Golf-Hero',
        description: `Independent Donation to ${orderRes.charity?.name || activeCharity.name}`,
        order_id: orderRes.orderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        notes: {
          donationType: 'independent_donation',
          charityId: selectedCharity,
          charityName: orderRes.charity?.name || activeCharity.name,
          amount: String(amount),
        },
        theme: {
          color: '#047857', // Emerald green brand accent
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setDonationState('verifying');
          try {
            const verifyRes = await api.donations.verify({
              razorpay_order_id: response.razorpay_order_id || orderRes.orderId || '',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success && verifyRes.donation) {
              setDonationState('success');
              setVerifiedDonation(verifyRes.donation);
              if (onDonationSuccess) {
                onDonationSuccess(verifyRes.donation);
              }
            } else {
              setDonationState('failed');
              setErrorMessage(
                verifyRes.error || 'Payment signature verification failed. Donation could not be recorded.'
              );
            }
          } catch (err: any) {
            setDonationState('failed');
            setErrorMessage(err.message || 'Payment verification encountered an unexpected error.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('ℹ️ [Donation] Razorpay checkout dismissed by user.');
            setDonationState('idle');
          },
          escape: true,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        console.error('❌ [Donation Payment Failed]', resp);
        setDonationState('failed');
        setErrorMessage(resp.error?.description || 'Donation payment was declined or cancelled.');
      });

      rzp.open();
    } catch (err: any) {
      console.error('❌ [Donation Initiation Error]', err);
      setDonationState('failed');
      setErrorMessage(err.message || 'Failed to initialize donation payment.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-elevated border border-sand-200 text-left my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Heart className="w-5 h-5 fill-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-normal text-charcoal">
                    Give More
                  </h3>
                  <Badge variant="sage" className="text-[10px] font-mono">
                    INDEPENDENT DONATION
                  </Badge>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Make an additional contribution to your selected cause.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-charcoal-light hover:text-charcoal p-1.5 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* STATE A: SUCCESS STATE */}
          {/* ============================================================ */}
          {donationState === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block mb-1.5">
                  ✓ DONATION SUCCESSFUL
                </span>
                <h4 className="font-serif text-2xl font-normal text-charcoal">
                  Thank you for giving more.
                </h4>
                <p className="text-xs text-charcoal-muted mt-1 max-w-md mx-auto">
                  Your ₹{verifiedDonation?.amount || amount} donation to{' '}
                  <strong className="text-charcoal">
                    {verifiedDonation?.charityName || activeCharity.name}
                  </strong>{' '}
                  has been recorded.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Contribution Amount:</span>
                  <span className="font-mono font-extrabold text-charcoal text-base">
                    ₹{verifiedDonation?.amount || amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Recipient Cause:</span>
                  <span className="font-semibold text-emerald-800">
                    {verifiedDonation?.charityName || activeCharity.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Payment Status:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    PAID
                  </span>
                </div>
                {verifiedDonation?.razorpayPaymentId && (
                  <div className="flex justify-between items-center border-t border-sand-200/80 pt-2 text-[11px]">
                    <span className="text-charcoal-light">Razorpay Payment ID:</span>
                    <span className="font-mono text-charcoal-muted">
                      {verifiedDonation.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-charcoal-light">
                Test donation recorded successfully. This contribution is stored in your member donation history.
              </p>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 justify-center"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STATE B: DONATION FORM */}
          {/* ============================================================ */}
          {donationState !== 'success' && (
            <>
              {/* Important Principle Alert */}
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-charcoal-muted leading-relaxed mb-6 space-y-1.5">
                <div className="flex items-center gap-1.5 text-charcoal font-bold text-xs">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Independent from Gameplay & Membership</span>
                </div>
                <p>
                  Separate from your membership and gameplay. Voluntary philanthropic contribution that does not alter Stableford scores, Lucky Numbers, or monthly draw prize calculations.
                </p>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Payment Error:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Selected Cause Preview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light block">
                    Select Recipient Cause:
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    {activeCharity.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {FEATURED_CHARITIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={donationState === 'creating_order' || donationState === 'verifying'}
                      onClick={() => setSelectedCharity(c.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedCharity === c.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                          : 'border-sand-200 bg-white hover:bg-sand-50'
                      }`}
                    >
                      <p className="font-bold text-xs text-charcoal truncate">{c.name}</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5">{c.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Options (INR) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light block">
                    Contribution Amount:
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    Selected: ₹{amount}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ALLOWED_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={donationState === 'creating_order' || donationState === 'verifying'}
                      onClick={() => setAmount(preset)}
                      className={`py-3 text-center rounded-xl font-mono text-xs font-bold transition-all ${
                        amount === preset
                          ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300'
                          : 'bg-sand-100 text-charcoal hover:bg-sand-200'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Razorpay Test Mode Transparency Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-charcoal-muted leading-relaxed mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px]">
                    Secure one-time donation powered by <strong>Razorpay</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                  Test Mode
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-sand-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={donationState === 'creating_order' || donationState === 'verifying'}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDonate}
                  disabled={donationState === 'creating_order' || donationState === 'verifying'}
                  className="font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm min-w-[150px] justify-center"
                >
                  {donationState === 'creating_order' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      INITIALIZING...
                    </>
                  ) : donationState === 'verifying' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      VERIFYING...
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 mr-1.5 fill-white" />
                      DONATE ₹{amount}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
