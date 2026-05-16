import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface BookingNewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const BookingNew: React.FC<BookingNewProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              New Booking
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
              Select professional, date, time slot, meeting type, then confirm booking.
            </p>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                TODO: Wire booking scheduler/calendar UI to backend APIs.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <div className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))]">
                  Calendar component (to be implemented)
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingNew;
