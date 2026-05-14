import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatsBar from '../components/StatsBar';
import CategoryGrid from '../components/CategoryGrid';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';
import ProfessionalCard from '../components/ProfessionalCard';
import { professionals } from '../data/professionals';

interface HomeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Home: React.FC<HomeProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cp-dark))] via-[hsl(240,25%,10%)] to-[hsl(260,30%,12%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(var(--cp-indigo))/15%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(var(--cp-violet))/10%,transparent_60%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(hsl(var(--cp-indigo-light)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cp-indigo-light)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--cp-indigo))]/20 border border-[hsl(var(--cp-indigo))]/30 text-[hsl(var(--cp-indigo-light))] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Professional Matchmaking
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
          >
            Connect with the{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--cp-indigo-light))] to-[hsl(var(--cp-violet-light))] bg-clip-text text-transparent">
              Right Professionals
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Students, teachers, doctors, chefs, engineers — find your perfect professional match using AI-powered smart matching, real-time location, and verified profiles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/discover"
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white font-semibold hover:scale-105 hover:shadow-2xl hover:shadow-[hsl(var(--cp-indigo))]/30 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
              Find Professionals
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              Browse Marketplace
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Verified Profiles</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location-Based</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Real-time Chat</span>
          </motion.div>
        </div>

        {/* Floating cards */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute left-8 top-1/3 hidden xl:block"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-52">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-white text-xs font-medium">Match Found!</span>
            </div>
            <p className="text-white/60 text-xs">Dr. Priya Sharma — 97% match for your cardiology needs</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute right-8 top-1/2 hidden xl:block"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-52">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--cp-indigo))]/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[hsl(var(--cp-indigo-light))]" />
              </div>
              <span className="text-white text-xs font-medium">Nearby</span>
            </div>
            <p className="text-white/60 text-xs">24 professionals within 2km of your location</p>
          </div>
        </motion.div>
      </section>

      <StatsBar />
      <CategoryGrid />

      {/* Featured Professionals */}
      <section className="py-20 bg-[hsl(var(--muted))]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">Top Matches Near You</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-2">AI-curated professionals based on your profile</p>
            </div>
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-[hsl(var(--cp-indigo))] hover:gap-3 transition-all duration-200"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((p, i) => (
              <ProfessionalCard key={p.id} professional={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSection />

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[hsl(var(--cp-dark))] to-[hsl(260,30%,12%)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Join 2.4 million professionals already using ConnectPro to grow their careers and businesses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Start for Free
              </Link>
              <Link
                to="/about"
                className="px-10 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;