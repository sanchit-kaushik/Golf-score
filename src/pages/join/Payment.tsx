import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Heart,
  AlertCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useJoin } from '../../context/JoinContext';
import { useAuth } from '../../context/AuthContext';
import { JoinLayout } from '../../components/join/JoinLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { loadRazorpayScript } from '../../lib/razorpay';

type PaymentState = 'idle' | 'creating' | 'checkout' | 'verifying' | 'success' | 'failed';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPlan, selectedPlanId } = useJoin();
  const {
    user,
    isAuthenticated,
    isLoading,
    verifyPayment,
    activateMembership,
    selectedCharityId,
    charityPledgePercent,
  } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'demo'>('razorpay');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState<boolean | null>(null);

  const planPrice = selectedPlan?.price || 279;
  const billingCadence = selectedPlan?.billingPeriod || selectedPlan?.billing || 'year';
  const charityAmount = (planPrice * 0.1).toFixed(2);

  // Preload Razorpay Checkout script and check config on mount
  useEffect(() => {
    let mounted = true;

    // Preload SDK script
    loadRazorpayScript().catch((err) => {
      console.warn('⚠️ [Razorpay Preload] Script notice:', err);
    });

    // Check backend payment readiness
    api.payments
      .getConfig()
      .then((cfg) => {
        if (mounted) {
          setIsRazorpayConfigured(cfg.isConfigured);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsRazorpayConfigured(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Redirect to account creation if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/join/account');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // FLOW A: REAL RAZORPAY PAYMENT
  const handleRealRazorpayPayment = async () => {
    setErrorMessage(null);
    setPaymentState('creating');

    try {
      console.log('🚀 [Payment] Initializing Razorpay Checkout...');

      // 1. Ensure user is authenticated
      if (!user) {
        throw new Error('You must be logged in to complete payment. Please log in or register.');
      }

      // 2. Ensure Razorpay Checkout SDK is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay Checkout SDK is not available. Please check your network connection.');
      }

      // 3. Call backend to create Order or Subscription
      console.log('📡 [Payment] Requesting order creation from backend...');
      const orderRes = await api.payments.createOrder(
        selectedPlanId || 'yearly',
        selectedCharityId,
        charityPledgePercent
      );

      console.log('✅ [Payment] Backend order response received:', {
        paymentType: orderRes.paymentType,
        hasOrderId: Boolean(orderRes.orderId),
        hasKeyId: Boolean(orderRes.keyId),
        amount: orderRes.amount,
        currency: orderRes.currency,
      });

      if (!orderRes.success) {
        throw new Error('Failed to create payment order with backend.');
      }

      if (!orderRes.keyId) {
        throw new Error('Razorpay public Key ID is missing from server configuration.');
      }

      setPaymentState('checkout');

      // 4. Construct Razorpay Checkout options
      const options: any = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'Digital Heroes',
        description: `${orderRes.plan.name} (${orderRes.plan.billingPeriod === 'year' ? 'Annual' : 'Monthly'})`,
        prefill: {
          name: user.fullName || '',
          email: user.email || '',
        },
        notes: {
          planId: selectedPlanId || 'yearly',
          charityId: selectedCharityId || 'youth-golf',
        },
        theme: {
          color: '#264e36', // Sage brand primary
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature: string;
          razorpay_subscription_id?: string;
        }) => {
          console.log('🎯 [Payment] Razorpay Checkout completed. Verifying signature on backend...');
          setPaymentState('verifying');
          try {
            const verification = await verifyPayment({
              planId: selectedPlanId || 'yearly',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || orderRes.orderId,
              razorpay_signature: response.razorpay_signature,
              razorpay_subscription_id: response.razorpay_subscription_id || orderRes.subscriptionId,
              charityId: selectedCharityId,
              charityPledgePercent,
            });

            if (verification.success) {
              console.log('🎉 [Payment] Membership successfully activated!');
              setPaymentState('success');
              navigate('/join/success');
            } else {
              setPaymentState('failed');
              setErrorMessage(
                verification.error ||
                  'Payment signature verification failed. Membership could not be activated.'
              );
            }
          } catch (err: any) {
            setPaymentState('failed');
            setErrorMessage(err.message || 'Payment verification encountered an error.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('ℹ️ [Payment] Razorpay checkout dismissed by user.');
            setPaymentState('idle');
          },
          escape: true,
          backdropclose: false,
        },
      };

      if (orderRes.paymentType === 'subscription' && orderRes.subscriptionId) {
        options.subscription_id = orderRes.subscriptionId;
      } else if (orderRes.orderId) {
        options.order_id = orderRes.orderId;
      }

      console.log('🚀 [Payment] Opening Razorpay Checkout Modal...');
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (resp: any) => {
        console.error('❌ [Razorpay Payment Failed]', resp);
        setPaymentState('failed');
        setErrorMessage(
          resp.error?.description || 'Payment was declined or failed. Please try again.'
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error('❌ [Razorpay Initiation Error]', err);
      setPaymentState('failed');
      setErrorMessage(
        err.message ||
          'Failed to initialize Razorpay checkout. Please verify server configuration.'
      );
    }
  };

  // FLOW B: DEMO ACCESS
  const handleDemoAccess = async () => {
    setErrorMessage(null);
    setPaymentState('verifying');
    const res = await activateMembership(selectedPlanId || 'yearly', 'demo');
    if (res.success) {
      setPaymentState('success');
      navigate('/join/success');
    } else {
      setPaymentState('failed');
      setErrorMessage(res.error || 'Failed to activate demo access.');
    }
  };

  const isBusy = paymentState === 'creating' || paymentState === 'checkout' || paymentState === 'verifying';

  return (
    <JoinLayout currentStep={4}>
      <div className="max-w-3xl mx-auto pt-4 pb-12">
        {/* Step Badge */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Badge variant="sage" className="text-[11px] px-3 py-1 font-mono">
              STEP 04 OF 05 • PAYMENT METHOD
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight mb-3">
            Select payment method.
          </h1>
          <p className="text-charcoal-muted text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Choose between live payment via official Razorpay checkout or instant Demo Access to preview the subscriber dashboard.
          </p>
        </div>

        {/* PRD Status Banner: ACCOUNT CREATED != MEMBERSHIP ACTIVE */}
        <div className="mb-8 p-4 rounded-2xl bg-sand-50/90 border border-sand-200 text-xs text-charcoal-muted flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-charcoal">Account Status:</span> Profile created for{' '}
            <strong>{user?.fullName || 'Member'}</strong> •{' '}
            <span className="text-amber-800 font-semibold">Membership Not Active</span>. Completing verified payment or choosing Demo Access activates your subscription.
          </div>
        </div>

        {/* Configuration Notice if Razorpay keys are not yet configured in server/.env */}
        {isRazorpayConfigured === false && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold mb-1">Razorpay Test Credentials Not Yet Configured in server/.env</p>
              <p className="text-amber-800 leading-relaxed mb-2">
                Live checkout requires <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">RAZORPAY_KEY_ID</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">RAZORPAY_KEY_SECRET</code> in your local <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">server/.env</code> file.
              </p>
              <p className="text-amber-800">
                You can enter your credentials in <code className="font-mono text-[11px]">server/.env</code> to test real checkout, or click <strong>ENTER DEMO</strong> below for instant showcase access.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Payment State / Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Payment Notice:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Order Breakdown Summary */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-sand-200 shadow-card">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3 mb-4">
            <h3 className="font-sans font-bold text-sm text-charcoal uppercase tracking-wider">
              Order Summary
            </h3>
            <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
              {selectedPlan?.name || 'Annual Membership'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-charcoal-light text-xs block">Subscription</span>
              <span className="font-bold text-charcoal">
                ${planPrice} / {billingCadence}
              </span>
            </div>
            <div>
              <span className="text-charcoal-light text-xs block">Charity Pledge (10% min)</span>
              <span className="font-bold text-sage-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-sage-600" />
                ${charityAmount} / {billingCadence}
              </span>
            </div>
            <div>
              <span className="text-charcoal-light text-xs block">Total Due</span>
              <span className="font-mono text-base font-extrabold text-charcoal">
                ${planPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Two Payment Method Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* OPTION 1: RAZORPAY */}
          <motion.div
            whileHover={{ y: isBusy ? 0 : -3 }}
            onClick={() => !isBusy && setSelectedMethod('razorpay')}
            className={`rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 flex flex-col justify-between ${
              isBusy ? 'opacity-80' : 'cursor-pointer'
            } ${
              selectedMethod === 'razorpay'
                ? 'bg-white border-charcoal shadow-elevated ring-2 ring-charcoal/10'
                : 'bg-white/80 hover:bg-white border-sand-200 shadow-card'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-charcoal text-white flex items-center justify-center shadow-sm">
                  <CreditCard className="w-6 h-6 text-gold-400" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Official Gateway
                </Badge>
              </div>

              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                Pay with Razorpay
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6">
                Complete your membership securely using Razorpay Checkout. Supports cards, UPI, net banking, and verified backend signature activation.
              </p>

              <div className="space-y-2 pt-2 border-t border-sand-100 text-xs text-charcoal">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                  <span>256-bit encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                  <span>Backend HMAC-SHA256 signature verification</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-sand-100">
              <Button
                variant="primary"
                size="lg"
                disabled={isBusy}
                onClick={handleRealRazorpayPayment}
                className="w-full justify-center group"
              >
                {paymentState === 'creating' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Preparing Checkout...</span>
                  </>
                ) : paymentState === 'checkout' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Awaiting Payment...</span>
                  </>
                ) : paymentState === 'verifying' && selectedMethod === 'razorpay' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Verifying Signature...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUE TO RAZORPAY</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* OPTION 2: DEMO ACCESS */}
          <motion.div
            whileHover={{ y: isBusy ? 0 : -3 }}
            onClick={() => !isBusy && setSelectedMethod('demo')}
            className={`rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 flex flex-col justify-between ${
              isBusy ? 'opacity-80' : 'cursor-pointer'
            } ${
              selectedMethod === 'demo'
                ? 'bg-white border-sage-600 shadow-elevated ring-2 ring-sage-500/20'
                : 'bg-white/80 hover:bg-white border-sand-200 shadow-card'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-700 border border-sage-200 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-6 h-6 text-gold-500" />
                </div>
                <Badge variant="gold" className="text-[10px] font-mono font-bold">
                  Testing / Preview
                </Badge>
              </div>

              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                Demo Access
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6">
                Skip payment and explore the full member experience. Activates a preview subscription to test all dashboard tools, scores, and draw mechanics.
              </p>

              <div className="space-y-2 pt-2 border-t border-sand-100 text-xs text-charcoal">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                  <span>No payment required • Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                  <span>Clearly labeled as "Demo Membership"</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-sand-100">
              <Button
                variant="secondary"
                size="lg"
                disabled={isBusy}
                onClick={handleDemoAccess}
                className="w-full justify-center bg-sage-600 hover:bg-sage-700 text-white group"
              >
                {isBusy && selectedMethod === 'demo' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Activating Demo...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER DEMO</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Back navigation & non-member dashboard link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-sand-200">
          <Link
            to="/join/charity"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Charity</span>
          </Link>

          <Link
            to="/dashboard"
            className="text-xs text-charcoal-light hover:text-charcoal underline underline-offset-4"
          >
            Skip for now and view Non-Member Dashboard
          </Link>
        </div>

        {/* Security Reassurance */}
        <div className="mt-8 text-center text-xs text-charcoal-light flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>Demo Access is strictly for showcase testing. Real payments require backend signature verification.</span>
        </div>
      </div>
    </JoinLayout>
  );
};
