import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BadgeCheck, Zap, MessageCircle, Video, Calendar as CalendarIcon, Heart, Share2, ArrowLeft, Award, Clock, Globe, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import type { Professional } from '../components/ProfileCard';
import ProfileChat from '../components/ProfileChat';
import { useAuth } from '../context/AuthContext';
import { professionals as fallbackProfessionals } from '../data/professionals';
import { toast } from 'react-toastify';

interface ProfileDetailProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMode?: boolean;
  toggleMobileMode?: () => void;
}

const reviews = [
  { name: 'Rohan Das', rating: 5, date: 'Dec 2025', text: 'Absolutely brilliant! Helped me crack JEE with flying colors. Highly recommended.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
  { name: 'Sneha Gupta', rating: 5, date: 'Nov 2025', text: 'Very patient and knowledgeable. My daughter improved significantly in 3 months.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
  { name: 'Amit Joshi', rating: 4, date: 'Oct 2025', text: 'Great teaching style. Explains complex concepts in a simple way.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  details: { date: string; time: string } | null;
  professional: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onConfirm, details, professional }) => {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-lg text-[hsl(var(--foreground))]">
            Confirm Booking
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={professional.avatar}
              alt={professional.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-medium text-[hsl(var(--foreground))]">{professional.name}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{professional.role}</p>
            </div>
          </div>

          <div className="bg-[hsl(var(--muted))]/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon size={16} className="text-[hsl(var(--cp-blue))]" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {format(new Date(details.date), 'EEEE, MMMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[hsl(var(--cp-blue))]" />
              <span className="text-sm text-[hsl(var(--foreground))]">
                {details.time} - 1 hour session
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[hsl(var(--border))]">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Session Fee</span>
            <span className="font-semibold text-[hsl(var(--foreground))]">{professional.hourlyRate}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-[hsl(var(--cp-blue))] text-white text-sm font-medium hover:bg-[hsl(var(--cp-blue))]/90 transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileDetail: React.FC<ProfileDetailProps> = ({ theme, toggleTheme, mobileMode = false, toggleMobileMode = () => {} }) => {
  const { id } = useParams<{ id: string }>();
  const { profiles, loadProfessionals } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(fallbackProfessionals[0] ?? null);

  if (!professional) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading profile...</p>
      </div>
    );
  }

  const [saved, setSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [connected, setConnected] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    loadProfessionals();
  }, []);


  useEffect(() => {
    if (profiles.length > 0) {
      const found = profiles.find((profile) => profile.id === id);
      setProfessional(found ?? profiles[0] ?? null);
    } else {
      const fallback = fallbackProfessionals.find((profile) => profile.id === id) ?? fallbackProfessionals[0] ?? null;
      setProfessional(fallback);
    }
  }, [id, profiles]);

  const handleConnect = () => {
    if (!professional) return;
    setConnected(true);
    toast.success(`Connected with ${professional.name}!`);
  };

  const handleSlotSelect = ({ date, time }: { date: Date; time: string; tier: any }) => {
    setBookingDetails({ date: format(date, 'yyyy-MM-dd'), time });
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (bookingDetails) {
      toast.success(`Appointment booked for ${format(new Date(bookingDetails.date), 'MMM dd')} at ${bookingDetails.time}!`);
      setShowBookingModal(false);
      setBookingDetails(null);
    }
  };

  const handleBook = () => {
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    toast.success(`Appointment booked for ${selectedSlot}!`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={toggleMobileMode} />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors duration-200">
            <ArrowLeft size={16} /> Back to Discover
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    {professional.available && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[hsl(var(--card))]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">{professional.name}</h1>
                      {professional.verified && <BadgeCheck size={20} className="text-[hsl(var(--cp-blue))]" />}
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] mb-2">{professional.role}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1"><MapPin size={14} />{professional.location} · {professional.distance}</span>
                      <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{professional.rating} ({professional.reviews} reviews)</span>
                      <span className="flex items-center gap-1 text-[hsl(var(--cp-blue))]"><Zap size={14} />{professional.matchScore}% match</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSaved(!saved); toast.info(saved ? 'Removed from saved' : 'Saved to favorites'); }}
                      className={`p-2 rounded-lg border transition-all duration-200 ${saved ? 'border-rose-400 text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}
                      aria-label="Save profile"
                    >
                      <Heart size={18} className={saved ? 'fill-rose-500' : ''} />
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                      className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
                      aria-label="Share profile"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {professional.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-[hsl(var(--cp-blue))]/10 text-[hsl(var(--cp-blue))] text-sm rounded-full font-medium">{skill}</span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-[hsl(var(--muted))]/40 rounded-xl">
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">{professional.reviews}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Reviews</p>
                  </div>
                  <div className="text-center border-x border-[hsl(var(--border))]">
                    <p className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">5+ yrs</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Experience</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">{professional.hourlyRate}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Per Hour</p>
                  </div>
                </div>
              </motion.div>

              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8"
              >
                <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-4">About</h2>
                <p className="text-[hsl(var(--foreground))]/80 leading-relaxed text-sm">
                  Experienced professional with over 5 years in the field. Passionate about delivering high-quality results and building long-term professional relationships. Available for both online and in-person sessions.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: <Globe size={14} />, label: 'Languages', value: 'English, Hindi' },
                    { icon: <Clock size={14} />, label: 'Response Time', value: 'Within 1 hour' },
                    { icon: <Award size={14} />, label: 'Certifications', value: '3 verified' },
                    { icon: <BadgeCheck size={14} />, label: 'Verification', value: 'ID + Degree' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 p-3 bg-[hsl(var(--muted))]/40 rounded-lg">
                      <span className="text-[hsl(var(--cp-blue))]">{item.icon}</span>
                      <div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8"
              >
                <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Reviews</h2>
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r.name} className="pb-5 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={r.avatar} alt={r.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-[hsl(var(--foreground))]">{r.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}</div>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground))]/80 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 sticky top-24"
              >
                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleConnect}
                    disabled={connected}
                    className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-200 ${connected ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white hover:scale-105 shadow-md'}`}
                  >
                    {connected ? '✓ Connected' : 'Connect Now'}
                  </button>
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full py-3 rounded-full border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Send Message
                  </button>
                  <button
                    onClick={() => toast.info('Starting video call...')}
                    className="w-full py-3 rounded-full border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Video size={16} /> Video Call
                  </button>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-5">
                  <Calendar
                    onSlotSelect={handleSlotSelect}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {showChat && professional && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto px-6 mt-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">Live demo chat</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ask {professional.name} about availability, service details, or next steps.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                Close Chat
              </button>
            </div>
            <ProfileChat professional={professional} />
          </motion.div>
        )}
      </main>

      <Footer />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        details={bookingDetails}
        professional={professional}
      />
    </div>
  );
};

export default ProfileDetail;