import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { createStripeCheckoutSession, type CheckoutBookingPayload } from '../lib/stripeCheckout';
import { saveLocalBooking } from '../lib/localBookings';

export interface PaymentBookingDetails {
  serviceId: string;
  serviceTitle: string;
  provider: string;
  priceLabel: string;
  priceAmount: number;
  date: string;
  time: string;
}

interface PaymentGatewayProps {
  serviceTitle: string;
  amount: string;
  booking?: PaymentBookingDetails;
  onComplete: () => void;
  onCancel: () => void;
}

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  serviceTitle,
  amount,
  booking,
  onComplete,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'razorpay' | 'demo'>('demo');

  useEffect(() => {
    if (stripeKey) {
      setPaymentMode('stripe');
    } else if (razorpayKey) {
      setPaymentMode('razorpay');
    } else {
      setPaymentMode('demo');
    }
  }, []);

  const persistDemoBooking = () => {
    if (!booking) return;
    saveLocalBooking({
      id: `bk-${Date.now()}`,
      serviceId: booking.serviceId,
      professionalId: booking.serviceId,
      serviceTitle: booking.serviceTitle,
      provider: booking.provider,
      priceLabel: booking.priceLabel,
      priceAmount: booking.priceAmount,
      date: booking.date,
      time: booking.time,
      status: 'paid',
      createdAt: new Date().toISOString(),
    });
  };

  const handleDemoPayment = async () => {
    setStatus('processing');
    await new Promise(resolve => window.setTimeout(resolve, 1200));
    persistDemoBooking();
    setStatus('success');
    toast.success('Payment completed! Your booking is confirmed.');
    window.setTimeout(() => {
      onComplete();
      setStatus('idle');
    }, 900);
  };

  const handleStripeCheckout = async () => {
    if (!booking) {
      toast.error('Booking details are missing.');
      return;
    }

    setStatus('processing');

    try {
      const start = new Date(`${booking.date}T${booking.time}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const payload: CheckoutBookingPayload = {
        professional_id: booking.serviceId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        price_amount: booking.priceAmount,
        currency: 'INR',
        client_name: currentUser?.name ?? 'Guest',
        professional_name: booking.provider,
        
        client_user_id: currentUser?.id,
      };

      const { url } = await createStripeCheckoutSession(payload);

      saveLocalBooking({
        id: `bk-pending-${Date.now()}`,
        serviceId: booking.serviceId,
        professionalId: booking.serviceId,
        serviceTitle: booking.serviceTitle,
        provider: booking.provider,
        priceLabel: booking.priceLabel,
        priceAmount: booking.priceAmount,
        date: booking.date,
        time: booking.time,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      window.location.href = url;
    } catch (err) {
      console.error(err);
      setStatus('idle');
      const message = err instanceof Error ? err.message : 'Stripe checkout failed';
      if (message.includes('fetch') || message.includes('Failed')) {
        toast.error('Payment server is offline. Start it with: npm run dev:server');
      } else {
        toast.error(message);
      }
    }
  };

  const handleLivePayment = () => {
    if (paymentMode === 'stripe' && stripeKey) {
      void handleStripeCheckout();
      return;
    }

    if (paymentMode === 'razorpay' && razorpayKey) {
      toast.info('Razorpay checkout requires backend setup. Using demo payment.');
      void handleDemoPayment();
      return;
    }

    void handleDemoPayment();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="rounded-3xl bg-[hsl(var(--cp-blue))]/10 p-3 text-[hsl(var(--cp-blue))]">
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">
            Pay for {serviceTitle}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {paymentMode === 'stripe'
              ? 'Secure Stripe Checkout — cards & UPI'
              : paymentMode === 'demo'
                ? 'Demo mode — no real charge'
                : 'Razorpay checkout'}
          </p>
        </div>
      </div>

      {booking && (
        <div className="mb-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 text-sm">
          <p className="font-medium text-[hsl(var(--foreground))]">{booking.provider}</p>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {booking.date} at {booking.time}
          </p>
        </div>
      )}

      <div className="grid gap-3 mb-6">
        <div className="rounded-3xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Amount due</p>
          <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{amount}</p>
        </div>

        {paymentMode === 'stripe' && (
          <div className="rounded-2xl border border-[hsl(var(--cp-indigo))]/30 bg-[hsl(var(--cp-indigo))]/5 p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--cp-indigo))] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              <p className="font-medium text-[hsl(var(--foreground))] mb-1">Stripe Checkout</p>
              <p>You will be redirected to Stripe&apos;s secure payment page to complete your booking.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={paymentMode === 'demo' ? () => void handleDemoPayment() : () => void handleLivePayment()}
          disabled={status === 'processing'}
          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          ) : paymentMode === 'stripe' ? (
            <>
              <ExternalLink className="w-4 h-4" /> Pay with Stripe
            </>
          ) : (
            'Complete payment'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={status === 'processing'}
          className="rounded-3xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      {status === 'success' && (
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 size={18} /> Payment completed successfully.
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))] mb-2">
          <ShieldCheck size={16} /> Security
        </div>
        <p>Card details are handled only by Stripe. ConnectPro never stores payment credentials.</p>
      </div>
    </motion.div>
  );
};

export default PaymentGateway;
