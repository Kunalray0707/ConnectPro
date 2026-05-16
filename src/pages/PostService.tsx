import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

interface PostServiceProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const PostService: React.FC<PostServiceProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              Post Service
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
              Create / edit / delete services with title, price, category, skills, images, and availability.
            </p>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                TODO: Connect this page to backend APIs for listing services and saving edits.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => toast.info('TODO: implement service editor form')}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
                >
                  Open Service Editor
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostService;
