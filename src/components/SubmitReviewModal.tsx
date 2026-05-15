import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import type { LocalBooking } from '../lib/localBookings';
import { submitVerifiedReview } from '../lib/ratings';

interface SubmitReviewModalProps {
  open: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  reviewerId: string;
  reviewerName: string;
  eligibleBookings: LocalBooking[];
  onSubmitted?: () => void;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  open,
  onClose,
  professionalId,
  professionalName,
  reviewerId,
  reviewerName,
  eligibleBookings,
  onSubmitted,
}) => {
  const [bookingId, setBookingId] = useState(eligibleBookings[0]?.id ?? '');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    const result = submitVerifiedReview({
      professionalId,
      reviewerId,
      reviewerName,
      bookingId,
      rating,
      text,
    });
    if (!result) {
      toast.error('Only verified purchases can leave a review. Complete a paid booking first.');
      return;
    }
    toast.success('Verified review submitted! It counts toward public ratings.');
    setText('');
    onSubmitted?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">
                Rate {professionalName}
              </h3>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Verified purchase required — only paid bookings can review.</span>
            </div>

            {eligibleBookings.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Book and pay for a session first. Reviews from non-purchasers are not shown publicly.
              </p>
            ) : (
              <>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                  Select completed booking
                </label>
                <select
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  className="w-full mb-4 px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
                >
                  {eligibleBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.serviceTitle} — {b.date} {b.time}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className="p-1"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          n <= (hover || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-[hsl(var(--muted-foreground))]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Share your experience (verified review)..."
                  rows={4}
                  className="w-full mb-4 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={eligibleBookings.length === 0 || !text.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold disabled:opacity-50"
              >
                Submit verified review
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitReviewModal;
