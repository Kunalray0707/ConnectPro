import React from 'react';
import { motion } from 'framer-motion';

interface MobileFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[420px]"
      >
        {/* Outer device frame */}
        <div className="relative rounded-[48px] border-8 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-40 bg-slate-900 rounded-b-3xl z-10 border-b border-slate-700" />
          
          {/* Screen inner border */}
          <div className="absolute inset-2 rounded-[44px] border border-slate-700/50 pointer-events-none z-5" />
          
          {/* Inner content container */}
          <div className="relative h-screen max-h-[844px] overflow-hidden rounded-[40px] bg-[hsl(var(--background))]">
            {/* Status bar simulation */}
            <div className="absolute top-0 inset-x-0 h-8 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] flex items-center justify-between px-6 z-20 text-xs font-semibold text-[hsl(var(--foreground))]">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Main content */}
            <div className="relative h-full pt-8 pb-24 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-hide">
                {children}
              </div>
            </div>

            {/* Bottom nav background */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--background))] to-transparent pointer-events-none" />
          </div>

          {/* Bezels and reflections */}
          <div className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
          
          {/* Bottom accent */}
          <div className="absolute bottom-0 inset-x-0 h-2 rounded-b-[48px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700" />
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-12 bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent rounded-full blur-3xl -z-10 opacity-60" />
      </motion.div>
    </div>
  );
};

export default MobileFrame;
