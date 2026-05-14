import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface PaymentGatewayProps {
  serviceTitle: string;
  amount: string;
  onComplete: () => void;
  onCancel: () => void;
}

const stripeKey = (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY;
const razorpayKey = (import.meta as any).env?.VITE_RAZORPAY_KEY;


const PaymentGateway: React.FC<PaymentGatewayProps> = ({ serviceTitle, amount, onComplete, onCancel }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'razorpay' | 'demo'>('demo');

  useEffect(() => {
    if (!currentUser || isDemoMode) {
      setPaymentMode('demo');
      return;
    }
    if (stripeKey) {
      setPaymentMode('stripe');
    } else if (razorpayKey) {
      setPaymentMode('razorpay');
    } else {
      setPaymentMode('demo');
    }
  }, [currentUser, isDemoMode]);

  const handleDemoPayment = async () => {
    setStatus('processing');
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    setStatus('success');
    toast.success('Demo payment completed successfully!');
    window.setTimeout(() => {
      onComplete();
      setStatus('idle');
    }, 900);
  };

  const handleLivePayment = () => {
    if (!currentUser) {
      toast.error('Please sign in to complete the payment.');
      return;
    }

    if (paymentMode === 'stripe' && stripeKey) {
      toast.info('Secure Stripe checkout is ready. Integrate your Stripe backend to finalize payment.');
      setStatus('processing');
      window.setTimeout(() => {
        setStatus('success');
        toast.success('Stripe payment session simulated.');
        onComplete();
      }, 1400);
      return;
    }

    if (paymentMode === 'razorpay' && razorpayKey) {
      toast.info('Secure Razorpay checkout is ready. Integrate your Razorpay backend to finalize payment.');
      setStatus('processing');
      window.setTimeout(() => {
        setStatus('success');
        toast.success('Razorpay payment session simulated.');
        onComplete();
      }, 1400);
      return;
    }

    toast.warn('Live payment gateway is not configured yet. Falling back to demo payment experience.');
    handleDemoPayment();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="rounded-3xl bg-[hsl(var(--cp-blue))]/10 p-3 text-[hsl(var(--cp-blue))]">
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">Secure payment for {serviceTitle}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{currentUser && !isDemoMode ? 'Live payment gateway selected.' : 'Demo payment mode for guests and demo users.'}</p>
        </div>
      </div>

      <div className="grid gap-3 mb-6">
        <div className="rounded-3xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Amount</p>
          <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{amount}</p>
        </div>

        <div className="rounded-3xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted))] text-sm text-[hsl(var(--muted-foreground))]">
          <p className="font-semibold text-[hsl(var(--foreground))] mb-2">Payment mode</p>
          <p>{paymentMode === 'demo' ? 'Demo gateway' : paymentMode === 'stripe' ? 'Live Stripe gateway' : 'Live Razorpay gateway'}</p>
          {paymentMode === 'demo' && <p className="mt-2">This mode simulates the entire checkout flow with premium animations and success feedback.</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={paymentMode === 'demo' ? handleDemoPayment : handleLivePayment}
          disabled={status === 'processing'}
          className="rounded-3xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'processing' ? 'Processing...' : paymentMode === 'demo' ? 'Simulate Payment' : `Pay with ${paymentMode === 'stripe' ? 'Stripe' : 'Razorpay'}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-3xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
        >
          Cancel
        </button>
      </div>

      {status === 'success' && (
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} /> Payment completed successfully.
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))] mb-2"><ShieldCheck size={16} /> Security notes</div>
        <p>All payment sessions should be routed through a secure backend with Stripe/Razorpay checkout or a tokenized session endpoint. Do not store payment cards in local storage.</p>
      </div>
    </motion.div>
  );
};

export default PaymentGateway;
