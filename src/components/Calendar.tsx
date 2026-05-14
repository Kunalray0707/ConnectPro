import React, { useState } from 'react';
import { motion } from 'framer-motion';


import {
  ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon,
  CheckCircle, X, Plus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';



interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  booked: boolean;
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
  clientName: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export type CalendarTier = 'basic' | 'standard' | 'premium';

interface CalendarProps {
  appointments?: Appointment[];
  onSlotSelect?: (payload: { date: Date; time: string; tier: CalendarTier }) => void;
  onAppointmentCreate?: (payload: { date: Date; time: string; tier: CalendarTier }) => void;
  onAppointmentCancel?: (appointmentId: string) => void;
  isProfessionalView?: boolean;
  initialTier?: CalendarTier;
}


const Calendar: React.FC<CalendarProps> = ({
  appointments = [],
  onSlotSelect,
  onAppointmentCreate,
  onAppointmentCancel,
  isProfessionalView = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTier] = useState<CalendarTier>('standard');


  // Generate time slots (9 AM to 6 PM)
  const generateTimeSlots = (): TimeSlot[] => {

    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = format(new Date().setHours(hour, 0), 'h:mm a');

      // Check if slot is booked
      const isBooked = appointments.some(apt =>
        selectedDate && isSameDay(apt.date, selectedDate) && apt.time === time24
      );

      slots.push({
        id: time24,
        time: time12,
        available: !isBooked,
        booked: isBooked
      });
    }
    return slots;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowTimeSlots(true);
  };

  const handleTimeSlotClick = (time: string) => {
    if (selectedDate) {
      setSelectedTime(time);
      if (onSlotSelect) {
        onSlotSelect({ date: selectedDate, time, tier: 'standard' });

      }
    }
  };

  const handleCreateAppointment = () => {
    if (selectedDate && selectedTime && onAppointmentCreate) {
      onAppointmentCreate({ date: selectedDate, time: selectedTime, tier: 'standard' });

      setShowTimeSlots(false);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const getDayAppointments = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-[hsl(var(--cp-blue))]" size={24} />
          <div>
            <h3 className="font-heading font-semibold text-lg text-[hsl(var(--foreground))]">
              {isProfessionalView ? 'Schedule Management' : 'Book Appointment'}
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dayAppointments = getDayAppointments(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={`relative p-3 text-sm rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-[hsl(var(--cp-blue))] text-white'
                  : isToday
                  ? 'bg-[hsl(var(--cp-blue))]/10 text-[hsl(var(--cp-blue))] border-2 border-[hsl(var(--cp-blue))]'
                  : isCurrentMonth
                  ? 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] opacity-50'
              }`}
              disabled={!isCurrentMonth}
            >
              {format(day, 'd')}
              {dayAppointments.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Time Slots */}
      {showTimeSlots && selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-[hsl(var(--border))] pt-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[hsl(var(--foreground))]">
              Available Times - {format(selectedDate, 'MMM d, yyyy')}
            </h4>
            <button
              onClick={() => setShowTimeSlots(false)}
              className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.id}
                  onClick={() => !slot.booked && handleTimeSlotClick(slot.time)}
                  disabled={slot.booked}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    slot.booked
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[hsl(var(--cp-blue))] border-[hsl(var(--cp-blue))] text-white'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--cp-blue))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--cp-blue))]/5'
                  }`}
                >
                  <Clock size={16} />
                  <span className="text-sm font-medium">{slot.time}</span>
                  {slot.booked && <X size={14} />}
                </button>
              );
            })}
          </div>

          {selectedTime && (
            <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))]/40 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Selected: {selectedTime}
                </span>
              </div>
              {isProfessionalView ? (
                <button
                  onClick={handleCreateAppointment}
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--cp-blue))] text-white rounded-lg hover:bg-[hsl(var(--cp-blue))]/90 transition-colors"
                >
                  <Plus size={16} />
                  Add Appointment
                </button>
              ) : (
                <button
                  onClick={handleCreateAppointment}
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--cp-blue))] text-white rounded-lg hover:bg-[hsl(var(--cp-blue))]/90 transition-colors"
                >
                  Book Appointment
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Appointments List */}
      {isProfessionalView && appointments.length > 0 && (
        <div className="border-t border-[hsl(var(--border))] pt-4">
          <h4 className="font-medium text-[hsl(var(--foreground))] mb-3">Today's Appointments</h4>
          <div className="space-y-2">
            {appointments
              .filter(apt => isSameDay(apt.date, new Date()))
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-[hsl(var(--muted))]/40 rounded-lg">
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">{appointment.clientName}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.service} at {appointment.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {appointment.status}
                    </span>
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => onAppointmentCancel?.(appointment.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;