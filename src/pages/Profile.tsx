import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BadgeCheck, MessageCircle, Calendar, Share2, Heart, Award, Briefcase, GraduationCap, Clock, ChevronLeft, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingPaymentModal from '../components/BookingPaymentModal';
import SubmitReviewModal from '../components/SubmitReviewModal';
import VerificationBadges from '../components/VerificationBadges';
import ProfileChat from '../components/ProfileChat';
import { professionals } from '../data/professionals';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getProfessionalVerification, isPubliclyVerified } from '../lib/verification';
import {
  getProfessionalRatingStats,
  getReviewsForProfessional,
  getEligibleBookingsForReview,
  RATING_TIER_META,
} from '../lib/ratings';

interface ProfileProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Profile: React.FC<ProfileProps> = ({ theme, toggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const professional = professionals.find(p => p.id === id);
  const [connected, setConnected] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'portfolio'>('overview');
  const [reviewVersion, setReviewVersion] = useState(0);

  const verification = professional ? getProfessionalVerification(professional.id) : null;
  const ratingStats = useMemo(
    () => professional ? getProfessionalRatingStats(professional.id, professional.rating, professional.reviews) : null,
    [professional, reviewVersion],
  );
  const verifiedReviews = useMemo(
    () => (professional ? getReviewsForProfessional(professional.id) : []),
    [professional, reviewVersion],
  );
  const reviewerId = currentUser?.id ?? 'guest-user';
  const eligibleBookings = professional
    ? getEligibleBookingsForReview(reviewerId, professional.id)
    : [];
  const showVerifiedBadge = professional ? isPubliclyVerified(professional.id, professional.verified) : false;

  if (!professional) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Profile not found</h2>
          <Link to="/discover" className="text-[hsl(var(--cp-indigo))] hover:underline">Back to Discover</Link>
        </div>
      </div>
    );
  }

  const handleConnect = () => {
    setConnected(true);
    toast.success(`Connected with ${professional.name}! You can now chat.`);
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.info(saved ? 'Removed from saved' : 'Saved to your list');
  };

  const handleBook = () => setBookingOpen(true);

  const displayRating = ratingStats?.verifiedReviewCount
    ? ratingStats.averageRating
    : professional.rating;
  const displayReviewCount = ratingStats?.verifiedReviewCount || professional.reviews;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-16">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-br from-[hsl(var(--cp-dark))] via-[hsl(240,25%,12%)] to-[hsl(260,30%,14%)] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,hsl(var(--cp-indigo))/20%,transparent_70%)]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Back */}
          <Link to="/discover" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mt-4 mb-2 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Discover
          </Link>

          {/* Profile header */}
          <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="relative w-28 h-28">
                <img
                  src={professional.avatar}
                  alt={professional.name}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-[hsl(var(--background))] shadow-xl"
                />
                {professional.available && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[hsl(var(--background))] rounded-full" />
                )}
              </div>
            </motion.div>

            <div className="flex-1 pt-4 md:pt-12">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">{professional.name}</h1>
                    {showVerifiedBadge && <BadgeCheck className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />}
                    <span className="text-xs font-bold text-[hsl(var(--cp-indigo))] bg-[hsl(var(--cp-indigo))]/10 px-2.5 py-1 rounded-full">
                      {professional.matchScore}% match
                    </span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))] mt-1">{professional.role} · {professional.category}</p>
                  <VerificationBadges
                    verification={verification}
                    ratingTier={ratingStats?.tier}
                    showRatingTier
                  />
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-4 h-4" /> {professional.location} · {professional.distance}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-[hsl(var(--foreground))]">{displayRating}</span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        ({displayReviewCount} verified {displayReviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                      {ratingStats && ratingStats.tier !== 'new' && (
                        <span className={`text-xs font-semibold ${RATING_TIER_META[ratingStats.tier].color}`}>
                          · {RATING_TIER_META[ratingStats.tier].label}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                      <Clock className="w-4 h-4" /> {professional.experience}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleSave}
                    className={`p-2.5 rounded-xl border transition-all duration-200 ${saved ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-800' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-red-300 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                    className="p-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--cp-indigo))]/40 hover:text-[hsl(var(--cp-indigo))] transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleBook}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(var(--cp-indigo))]/40 text-[hsl(var(--cp-indigo))] hover:bg-[hsl(var(--cp-indigo))]/10 transition-all duration-200 text-sm font-medium"
                  >
                    <Calendar className="w-4 h-4" /> Book
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={connected}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      connected
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 cursor-default'
                        : 'bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages (realtime chat) */}
          <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-10">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">Messages</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Chat with {professional.name} in real-time.
              </p>
            </div>
            <ProfileChat professional={professional} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[hsl(var(--border))] mb-8">
            {(['overview', 'reviews', 'portfolio'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-[hsl(var(--cp-indigo))] text-[hsl(var(--cp-indigo))]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pb-16">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-3">About</h2>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">
                      {professional.name} is a highly experienced {professional.role} with {professional.experience} in the {professional.category} industry. Public ratings count only verified purchases — {displayReviewCount} verified reviews, {displayRating}/5 average.
                    </p>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-4">Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {professional.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 rounded-lg bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] text-sm font-medium border border-[hsl(var(--cp-indigo))]/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-4">Experience</h2>
                    <div className="space-y-4">
                      {[
                        { title: `Senior ${professional.role}`, org: 'Top Organization', period: '2020 – Present' },
                        { title: professional.role, org: 'Previous Company', period: '2017 – 2020' },
                      ].map((exp, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[hsl(var(--foreground))]">{exp.title}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{exp.org} · {exp.period}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-4">Quick Info</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Award, label: 'Verified Pro', value: showVerifiedBadge ? (verification?.badgeLevel ?? 'Yes') : 'No' },
                        { icon: Star, label: 'Rating', value: `${professional.rating}/5` },
                        { icon: Clock, label: 'Experience', value: professional.experience },
                        { icon: MapPin, label: 'Location', value: professional.location },
                        { icon: GraduationCap, label: 'Category', value: professional.category },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                            <Icon className="w-4 h-4" /> {label}
                          </div>
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {professional.rate && (
                    <div className="bg-gradient-to-br from-[hsl(var(--cp-indigo))]/10 to-[hsl(var(--cp-violet))]/10 border border-[hsl(var(--cp-indigo))]/20 rounded-2xl p-6">
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Rate</p>
                      <p className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">{professional.rate}</p>
                      <button
                        onClick={handleBook}
                        className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200"
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Only verified purchase reviews are shown.
                  </p>
                  <button type="button" onClick={() => setReviewOpen(true)} className="px-4 py-2 rounded-xl border border-[hsl(var(--cp-indigo))]/40 text-[hsl(var(--cp-indigo))] text-sm font-medium">
                    Write verified review
                  </button>
                </div>
                {verifiedReviews.length === 0 && (
                  <p className="text-sm text-center text-[hsl(var(--muted-foreground))] py-6">No verified reviews yet.</p>
                )}
                {verifiedReviews.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm text-[hsl(var(--foreground))]">{r.reviewerName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(r.createdAt).toLocaleDateString()} · Verified purchase</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{r.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="w-full h-32 bg-gradient-to-br from-[hsl(var(--cp-indigo))]/10 to-[hsl(var(--cp-violet))]/10 rounded-xl mb-4 flex items-center justify-center">
                      <Award className="w-8 h-8 text-[hsl(var(--cp-indigo))]/40" />
                    </div>
                    <p className="font-medium text-sm text-[hsl(var(--foreground))]">Project {i}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Portfolio item {i} — {professional.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <BookingPaymentModal
        open={bookingOpen}
        target={{
          id: professional.id,
          title: `${professional.role} session`,
          provider: professional.name,
          price: professional.rate ?? '₹999/hr',
          avatar: professional.avatar,
        }}
        onClose={() => setBookingOpen(false)}
      />

      <SubmitReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        professionalId={professional.id}
        professionalName={professional.name}
        reviewerId={reviewerId}
        reviewerName={currentUser?.name ?? 'Guest'}
        eligibleBookings={eligibleBookings}
        onSubmitted={() => setReviewVersion(v => v + 1)}
      />
    </div>
  );
};

export default Profile;
