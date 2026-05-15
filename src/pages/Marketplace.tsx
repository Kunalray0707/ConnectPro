import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, BadgeCheck, Filter, X, Zap, Calendar, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentGateway, { type PaymentBookingDetails } from '../components/PaymentGateway';
import { allSkills } from '../data/professionals';
import { parsePriceAmount } from '../lib/parsePrice';
import { toast } from 'react-toastify';

interface MarketplaceProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

type Service = {
  id: string;
  title: string;
  provider: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  verified: boolean;
  avatar: string;
  skills: string[];
  delivery: string;
  badge: string | null;
};

const services: Service[] = [
  { id: 's1', title: 'Math & Science Tutoring', provider: 'Ananya Singh', category: 'Education', price: '₹500/hr', rating: 4.9, reviews: 245, verified: true, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face', skills: ['Mathematics', 'Physics', 'JEE Prep', 'CBSE'], delivery: 'Online / In-person', badge: 'Top Rated' },
  { id: 's2', title: 'Full Stack Web Development', provider: 'Arjun Mehta', category: 'Technology', price: '₹2,500/hr', rating: 4.8, reviews: 189, verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', skills: ['React', 'Node.js', 'TypeScript', 'AWS'], delivery: 'Remote', badge: 'Expert' },
  { id: 's3', title: 'Cardiology Consultation', provider: 'Dr. Priya Sharma', category: 'Healthcare', price: '₹800/consult', rating: 4.9, reviews: 312, verified: true, avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face', skills: ['Cardiology', 'ECG', 'Echocardiography'], delivery: 'In-clinic / Video', badge: 'Verified Pro' },
  { id: 's4', title: 'Private Chef & Catering', provider: 'Chef Ravi Kumar', category: 'Culinary', price: '₹1,800/hr', rating: 4.7, reviews: 98, verified: true, avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&h=80&fit=crop&crop=face', skills: ['French Cuisine', 'Catering', 'Menu Design'], delivery: 'On-site', badge: 'Premium' },
  { id: 's5', title: 'UI/UX Design & Prototyping', provider: 'Vikram Nair', category: 'Creative', price: '₹1,500/hr', rating: 4.6, reviews: 134, verified: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', skills: ['Figma', 'User Research', 'Design Systems'], delivery: 'Remote', badge: null },
  { id: 's6', title: 'ICU Nursing Care', provider: 'Kavya Reddy', category: 'Healthcare', price: '₹600/shift', rating: 4.8, reviews: 76, verified: true, avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face', skills: ['Critical Care', 'IV Therapy', 'Patient Care'], delivery: 'Home / Hospital', badge: 'Verified Pro' },
  { id: 's7', title: 'Digital Marketing Strategy', provider: 'Neha Kapoor', category: 'Business', price: '₹1,200/hr', rating: 4.7, reviews: 167, verified: true, avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face', skills: ['SEO', 'SEM', 'Content Marketing', 'Social Media'], delivery: 'Remote', badge: 'Top Rated' },
  { id: 's8', title: 'Machine Learning Consulting', provider: 'Rohan Das', category: 'Technology', price: '₹3,000/hr', rating: 4.9, reviews: 88, verified: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'], delivery: 'Remote', badge: 'Expert' },
  { id: 's9', title: 'Legal Consultation', provider: 'Adv. Sunita Rao', category: 'Business', price: '₹2,000/hr', rating: 4.8, reviews: 143, verified: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', skills: ['Corporate Law', 'Contract Law', 'IP Law'], delivery: 'In-office / Video', badge: 'Verified Pro' },
  { id: 's10', title: 'Photography & Videography', provider: 'Karan Malhotra', category: 'Creative', price: '₹800/hr', rating: 4.6, reviews: 201, verified: false, avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face', skills: ['Photography', 'Video Editing', 'Adobe Premiere'], delivery: 'On-site', badge: null },
  { id: 's11', title: 'Physiotherapy Sessions', provider: 'Dr. Meera Joshi', category: 'Healthcare', price: '₹700/session', rating: 4.9, reviews: 156, verified: true, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&h=80&fit=crop&crop=face', skills: ['Physiotherapy', 'Sports Injury', 'Rehabilitation'], delivery: 'Clinic / Home', badge: 'Top Rated' },
  { id: 's12', title: 'Architecture & Interior Design', provider: 'Prateek Sharma', category: 'Engineering', price: '₹2,200/hr', rating: 4.7, reviews: 92, verified: true, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face', skills: ['Architecture', 'Interior Design', 'AutoCAD', '3D Modeling'], delivery: 'On-site / Remote', badge: 'Expert' },
];

const serviceCategories = ['All', 'Education', 'Healthcare', 'Technology', 'Culinary', 'Creative', 'Business', 'Engineering'];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const Marketplace: React.FC<MarketplaceProps> = ({ theme, toggleTheme }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [bookingTime, setBookingTime] = useState('10:00');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<PaymentBookingDetails | null>(null);

  const filteredSkills = useMemo(() =>
    skillSearch.length > 1 ? allSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).slice(0, 10) : [],
    [skillSearch]
  );

  const filtered = useMemo(() => {
    let list = [...services];
    if (search) list = list.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase()) || s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase())));
    if (selectedCategory !== 'All') list = list.filter(s => s.category === selectedCategory);
    if (verifiedOnly) list = list.filter(s => s.verified);
    if (selectedSkills.length > 0) list = list.filter(s => selectedSkills.some(sk => s.skills.includes(sk)));
    return list;
  }, [search, selectedCategory, verifiedOnly, selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    setSkillSearch('');
  };

  const openBooking = (service: Service) => {
    setBookingService(service);
    setBookingDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setBookingTime('10:00');
    setShowPayment(false);
    setPaymentBooking(null);
  };

  const closeBooking = () => {
    setBookingService(null);
    setShowPayment(false);
    setPaymentBooking(null);
  };

  const confirmBooking = () => {
    if (!bookingService) return;
    const details: PaymentBookingDetails = {
      serviceId: bookingService.id,
      serviceTitle: bookingService.title,
      provider: bookingService.provider,
      priceLabel: bookingService.price,
      priceAmount: parsePriceAmount(bookingService.price),
      date: bookingDate,
      time: bookingTime,
    };
    setPaymentBooking(details);
    setShowPayment(true);
    toast.info('Proceed to payment to confirm your booking.');
  };

  const handlePaymentComplete = () => {
    closeBooking();
    toast.success('Booking confirmed! View it in your Dashboard.');
  };

  return (
    <motion.div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-16">
        <div className="bg-gradient-to-br from-[hsl(var(--cp-dark))] to-[hsl(260,25%,12%)] py-14">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-bold text-white mb-4">
              Service Marketplace
            </motion.h1>
            <p className="text-white/60 mb-8">Browse 10,000+ professional services across every domain</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search services, skills, or providers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <Filter className="w-5 h-5" /> Filters
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 pb-16">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {serviceCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[hsl(var(--cp-indigo))] text-white shadow-md'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 mb-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--cp-indigo))]" />
                  <span className="text-sm text-[hsl(var(--foreground))]">Verified Providers Only</span>
                </label>
                <div className="flex-1">
                  <motion.div className="relative">
                    <input
                      type="text"
                      placeholder="Filter by skill (100+ available)..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
                    />
                    {filteredSkills.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-lg z-20 p-2 flex flex-wrap gap-1.5">
                        {filteredSkills.map(skill => (
                          <button key={skill} type="button" onClick={() => toggleSkill(skill)} className="px-3 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--cp-indigo))]/20 hover:text-[hsl(var(--cp-indigo))] transition-all duration-150">
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSkills.map(skill => (
                        <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[hsl(var(--cp-indigo))]/15 text-[hsl(var(--cp-indigo))] border border-[hsl(var(--cp-indigo))]/30">
                          {skill}
                          <button type="button" onClick={() => toggleSkill(skill)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
            Showing <span className="font-semibold text-[hsl(var(--foreground))]">{filtered.length}</span> services
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={service.avatar} alt={service.provider} width={44} height={44} className="w-11 h-11 rounded-xl object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{service.provider}</p>
                        {service.verified && <BadgeCheck className="w-3.5 h-3.5 text-[hsl(var(--cp-indigo))]" />}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{service.category}</p>
                    </div>
                  </div>
                  {service.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] border border-[hsl(var(--cp-indigo))]/20">
                      {service.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-1">{service.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-[hsl(var(--foreground))]">{service.rating}</span>
                      ({service.reviews})
                    </span>
                    <span>· {service.delivery}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {service.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-md">{skill}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                  <span className="font-heading font-bold text-[hsl(var(--foreground))]">{service.price}</span>
                  <button
                    type="button"
                    onClick={() => openBooking(service)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-semibold hover:scale-105 hover:shadow-md transition-all duration-200"
                  >
                    <Zap className="w-3.5 h-3.5" /> Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No services found</h3>
              <p className="text-[hsl(var(--muted-foreground))]">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {bookingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget && !showPayment) closeBooking(); }}
          >
            {!showPayment ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <motion.div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">Book service</h3>
                  <button type="button" onClick={closeBooking} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]">
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>

                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[hsl(var(--border))]">
                  <img src={bookingService.avatar} alt={bookingService.provider} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">{bookingService.title}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{bookingService.provider} · {bookingService.price}</p>
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
                    onClick={closeBooking}
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
                  serviceTitle={paymentBooking?.serviceTitle ?? bookingService.title}
                  amount={paymentBooking?.priceLabel ?? bookingService.price}
                  booking={paymentBooking ?? undefined}
                  onComplete={handlePaymentComplete}
                  onCancel={() => setShowPayment(false)}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Marketplace;
