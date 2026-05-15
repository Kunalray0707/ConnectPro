import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import PaymentGateway, { type PaymentBookingDetails } from './PaymentGateway';
import { parsePriceAmount } from '../lib/parsePrice';
import { toast } from 'react-toastify';

export type BookingTarget = {
  id: string;
  title: string;
  provider: string;
  price: string;
  avatar?: string;
};

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

interface BookingPaymentModalProps {
  open: boolean;
  target: BookingTarget;
  onClose: () => void;
}

const BookingPaymentModal: React.FC<BookingPaymentModalProps> = ({ open, target, onClose }) => {
  const [bookingDate, setBookingDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [bookingTime, setBookingTime] = useState('10:00');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<PaymentBookingDetails | null>(null);

  useEffect(() => {
    if (open) {
      setBookingDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setBookingTime('10:00');
      setShowPayment(false);
      setPaymentBooking(null);
    }
  }, [open, target.id]);

  const handleClose = () => {
    setShowPayment(false);
    setPaymentBooking(null);
    onClose();
  };

  const confirmBooking = () => {
    const details: PaymentBookingDetails = {
      serviceId: target.id,
      serviceTitle: target.title,
      provider: target.provider,
      priceLabel: target.price,
      priceAmount: parsePriceAmount(target.price),
      date: bookingDate,
      time: bookingTime,
    };
    setPaymentBooking(details);
    setShowPayment(true);
    toast.info('Proceed to payment to confirm your booking.');
  };

  const handlePaymentComplete = () => {
    handleClose();
    toast.success('Booking confirmed! View it in your Dashboard.');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget && !showPayment) handleClose(); }}
        >
          {!showPayment ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">Book appointment</h3>
                <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[hsl(var(--border))]">
                {target.avatar && (
                  <img src={target.avatar} alt={target.provider} className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">{target.title}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{target.provider} · {target.price}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    <Calendar className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    <Clock className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Time
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          bookingTime === slot
                            ? 'bg-[hsl(var(--cp-indigo))] text-white'
                            : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--cp-indigo))]/20'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBooking}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue to payment
                </button>
              </div>
            </motion.div>
          ) : (
            <div onClick={e => e.stopPropagation()}>
              <PaymentGateway
                serviceTitle={paymentBooking?.serviceTitle ?? target.title}
                amount={paymentBooking?.priceLabel ?? target.price}
                booking={paymentBooking ?? undefined}
                onComplete={handlePaymentComplete}
                onCancel={() => setShowPayment(false)}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingPaymentModal;
