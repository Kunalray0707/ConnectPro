import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MatchesProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Matches: React.FC<MatchesProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              Matches
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
              AI recommended professionals will appear here.
            </p>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                TODO: Connect to backend for filters + live availability + connect button.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Matches;
