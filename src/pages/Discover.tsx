import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Locate, Calendar, Clock, Video, CheckCircle, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfessionalCard from '../components/ProfessionalCard';
import { professionals, allSkills } from '../data/professionals';
import DiscoverMap, { type NearbyItem } from '../components/DiscoverMap';
import { toast } from 'react-toastify';

interface DiscoverProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const categories = ['All', 'Education', 'Healthcare', 'Culinary', 'Technology', 'Business', 'Creative', 'Engineering'];
const sortOptions = ['Best Match', 'Highest Rated', 'Nearest', 'Most Reviews'];
const TIME_SLOTS = ['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:30 PM'];

const Discover: React.FC<DiscoverProps> = ({ theme, toggleTheme }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Best Match');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(30);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  // Booking Modal State
  const [bookingItem, setBookingItem] = useState<NearbyItem | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [bookingMode, setBookingMode] = useState<'video' | 'in-person'>('video');

  const filteredSkills = useMemo(() =>
    skillSearch.length > 1
      ? allSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).slice(0, 12)
      : [],
    [skillSearch]
  );

  const filtered = useMemo(() => {
    let list = [...professionals];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()) || p.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));
    if (selectedCategory !== 'All') list = list.filter(p => p.category === selectedCategory);
    if (availableOnly) list = list.filter(p => p.available);
    if (verifiedOnly) list = list.filter(p => p.verified);
    if (minRating > 0) list = list.filter(p => p.rating >= minRating);
    if (selectedSkills.length > 0) list = list.filter(p => selectedSkills.some(sk => p.skills.includes(sk)));
    if (selectedSort === 'Highest Rated') list.sort((a, b) => b.rating - a.rating);
    else if (selectedSort === 'Best Match') list.sort((a, b) => b.matchScore - a.matchScore);
    else if (selectedSort === 'Most Reviews') list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [search, selectedCategory, availableOnly, verifiedOnly, minRating, selectedSkills, selectedSort]);

  const handleLocate = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLabel(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        setLocating(false);
        toast.success('Location detected! Showing nearby professionals.');
      },
      () => {
        toast.error('Unable to retrieve your location.');
        setLocating(false);
      }
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    setSkillSearch('');
  };

  const confirmBooking = () => {
    if (!bookingDate) {
      toast.warn('Please select a preferred date for the consultation.');
      return;
    }
    toast.success(`Meeting successfully booked with ${bookingItem?.name}! Confirmation details sent to your registered email.`);
    setBookingItem(null);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-24 pb-16">
        {/* Search Hero */}
        <div className="bg-gradient-to-br from-[hsl(var(--cp-dark))] to-[hsl(260,25%,12%)] py-14">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl font-bold text-white mb-4"
            >
              Discover Professionals
            </motion.h1>
            <p className="text-white/60 mb-8">Search from 2.4M+ verified professionals near you</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, role, or skill..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 focus:border-[hsl(var(--cp-indigo))]/50 transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={handleLocate}
                disabled={locating}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[hsl(var(--cp-indigo))]/20 border border-[hsl(var(--cp-indigo))]/30 text-[hsl(var(--cp-indigo-light))] hover:bg-[hsl(var(--cp-indigo))]/30 transition-all duration-200 disabled:opacity-60"
              >
                <Locate className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
                {locationLabel ? locationLabel : 'Near Me'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
          <div className="mb-8">
            <DiscoverMap
              radiusKm={maxDistance}
              professionalsList={filtered}
              showServices={true}
              onBookMeeting={(item) => {
                setBookingItem(item);
                const tm = new Date();
                tm.setDate(tm.getDate() + 1);
                setBookingDate(tm.toISOString().split('T')[0]);
              }}
            />
          </div>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {categories.map(cat => (
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

          {/* Filters panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 mb-6 shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">Max Distance: {maxDistance}km</label>
                  <input type="range" min={5} max={100} step={5} value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} className="w-full accent-[hsl(var(--cp-indigo))]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">Min Rating: {minRating > 0 ? `${minRating}+` : 'Any'}</label>
                  <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full accent-[hsl(var(--cp-indigo))]" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--cp-indigo))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">Available Online Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--cp-indigo))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">Verified Pro Only</span>
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">Sort By</label>
                  <select value={selectedSort} onChange={e => setSelectedSort(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40">
                    {sortOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Skill search */}
              <div className="mt-4">
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">Filter by Specific Skills</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search 100+ skills..."
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
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[hsl(var(--cp-indigo))]/15 text-[hsl(var(--cp-indigo))] border border-[hsl(var(--cp-indigo))]/30">
                        {skill}
                        <button type="button" onClick={() => toggleSkill(skill)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing <span className="font-semibold text-[hsl(var(--foreground))]">{filtered.length}</span> professionals
              {locationLabel && <span className="ml-1 text-[hsl(var(--cp-indigo))]">near {locationLabel}</span>}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No professionals found</h3>
              <p className="text-[hsl(var(--muted-foreground))]">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ProfessionalCard key={p.id} professional={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Book Instant Consultation Modal */}
      <AnimatePresence>
        {bookingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setBookingItem(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--cp-blue))] via-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))]" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                  Schedule Consultation
                </h3>
                <button
                  type="button"
                  onClick={() => setBookingItem(null)}
                  className="p-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] mb-6">
                <img src={bookingItem.avatar} alt={bookingItem.name} className="w-14 h-14 rounded-xl object-cover border border-[hsl(var(--border))]" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-[hsl(var(--foreground))] truncate">{bookingItem.name}</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mb-1">{bookingItem.role}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {bookingItem.rating} ({bookingItem.reviews} reviews)
                    </span>
                    <span className="text-[hsl(var(--cp-indigo))] font-semibold">
                      {bookingItem.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                    <Calendar className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Select Consultation Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40 font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                    <Clock className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          bookingTime === slot
                            ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white border-transparent shadow-md'
                            : 'bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--cp-indigo))]/40'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                    <Video className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingMode('video')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        bookingMode === 'video'
                          ? 'bg-[hsl(var(--cp-indigo))]/15 border-[hsl(var(--cp-indigo))] text-[hsl(var(--cp-indigo))]'
                          : 'bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      <Video className="w-4 h-4" /> Google Meet Video Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingMode('in-person')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        bookingMode === 'in-person'
                          ? 'bg-[hsl(var(--cp-indigo))]/15 border-[hsl(var(--cp-indigo))] text-[hsl(var(--cp-indigo))]'
                          : 'bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" /> In-Person Meeting
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setBookingItem(null)}
                  className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm font-semibold text-[hsl(var(--foreground))] hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBooking}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-bold hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm & Pay Deposit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;