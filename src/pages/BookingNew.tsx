import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import { professionals } from '../data/professionals';
import { APPOINTMENT_TIERS } from '../lib/appointments';
import { saveLocalBooking, loadLocalBookings, type LocalBooking } from '../lib/localBookings';
import { toast } from 'react-toastify';
import { User, Clock, Calendar as CalendarIcon, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface BookingNewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const BookingNew: React.FC<BookingNewProps> = ({ theme, toggleTheme }) => {
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [meetingType, setMeetingType] = useState<string>('video');
  const [notes, setNotes] = useState<string>('');
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setBookings(loadLocalBookings());
  };

  const handleSlotSelect = (payload: { date: Date; time: string; tier: string }) => {
    setSelectedDate(payload.date);
    setSelectedTime(payload.time);
    setSelectedTier(payload.tier);
  };

  const handleAppointmentCreate = (payload: { date: Date; time: string; tier: string }) => {
    setSelectedDate(payload.date);
    setSelectedTime(payload.time);
    setSelectedTier(payload.tier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfessional) {
      toast.error('Please select a professional');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setIsSubmitting(true);

    const professional = professionals.find(p => p.id === selectedProfessional);
    if (!professional) {
      toast.error('Professional not found');
      setIsSubmitting(false);
      return;
    }

    const tier = APPOINTMENT_TIERS.find(t => t.id === selectedTier);
    if (!tier) {
      toast.error('Invalid tier selected');
      setIsSubmitting(false);
      return;
    }

    const booking: LocalBooking = {
      id: `booking-${Date.now()}`,
      serviceId: selectedProfessional,
      professionalId: selectedProfessional,
      serviceTitle: professional.role,
      provider: professional.name,
      priceLabel: tier.label,
      priceAmount: tier.priceAmount,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      saveLocalBooking(booking);
      loadBookings();
      toast.success('Booking created successfully!');
      
      // Reset form
      setSelectedProfessional('');
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedTier('standard');
      setMeetingType('video');
      setNotes('');
      setIsSubmitting(false);
    }, 500);
  };

  const upcomingBookings = bookings
    .filter(b => b.status === 'pending' || b.status === 'confirmed')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                Book a Slot
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Schedule a meeting with a professional at your convenience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Professional Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
                >
                  <h2 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <User size={20} />
                    Select Professional
                  </h2>
                  <select
                    value={selectedProfessional}
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                  >
                    <option value="">Choose a professional...</option>
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.role} ({prof.category})
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Calendar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Calendar
                    appointments={[]}
                    onSlotSelect={handleSlotSelect}
                    onAppointmentCreate={handleAppointmentCreate}
                    isProfessionalView={false}
                  />
                </motion.div>

                {/* Meeting Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
                >
                  <h2 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Meeting Details
                  </h2>

                  <div className="space-y-4">
                    {/* Meeting Type */}
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Meeting Type
                      </label>
                      <div className="flex gap-3">
                        {['video', 'audio', 'in-person'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setMeetingType(type)}
                            className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                              meetingType === type
                                ? 'bg-[hsl(var(--cp-indigo))] border-[hsl(var(--cp-indigo))] text-white'
                                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Appointment Tier */}
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Duration & Price
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {APPOINTMENT_TIERS.map(tier => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setSelectedTier(tier.id)}
                            className={`p-4 rounded-lg border transition-all ${
                              selectedTier === tier.id
                                ? 'bg-[hsl(var(--cp-indigo))]/10 border-[hsl(var(--cp-indigo))] text-[hsl(var(--cp-indigo))]'
                                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                            }`}
                          >
                            <div className="font-semibold">{tier.label}</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                              {tier.durationMinutes} minutes
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes for the professional..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all resize-none"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Booking
                    </>
                  )}
                </motion.button>
              </div>

              {/* Right Column - Summary & Upcoming */}
              <div className="space-y-6">
                {/* Booking Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
                >
                  <h2 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <CalendarIcon size={20} />
                    Booking Summary
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Professional</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {selectedProfessional ? professionals.find(p => p.id === selectedProfessional)?.name : 'Not selected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Date</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Time</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {selectedTime || 'Not selected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Duration</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {APPOINTMENT_TIERS.find(t => t.id === selectedTier)?.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Total</span>
                      <span className="text-lg font-bold text-[hsl(var(--cp-indigo))]">
                        ₹{APPOINTMENT_TIERS.find(t => t.id === selectedTier)?.priceAmount}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Bookings */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
                >
                  <h2 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Upcoming Bookings
                  </h2>

                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="mx-auto text-[hsl(var(--muted-foreground))] mb-2" size={32} />
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">No upcoming bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="p-3 rounded-lg bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-[hsl(var(--foreground))]">
                              {booking.provider}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                            <CalendarIcon size={14} />
                            <span>{booking.date}</span>
                            <ArrowRight size={14} />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
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
