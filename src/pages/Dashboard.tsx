import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Star,
  TrendingUp,
  Bell,
  Settings,
  BadgeCheck,
  Calendar,
  Zap,
  Eye,
  Award,
  Activity,
  Briefcase,
  ChevronRight,
  Search,
  Send,
  Check,
  CheckCheck,
  Clock,
  Video,
  MapPin,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { professionals } from '../data/professionals';
import { toast } from 'react-toastify';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { loadLocalBookings, type LocalBooking } from '../lib/localBookings';
import VerificationWizard from '../components/VerificationWizard';
import { useSocketConnection } from '../lib/useSocketConnection';
import { getSocket } from '../lib/socketClient';

interface DashboardProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

type OverviewStatsPayload = {
  profileViews: number;
  connections: number;
  messages: number;
  avgRating: number;
};

type OverviewActivityPoint = { day: string; views: number; connections: number };

const initialActivityData: OverviewActivityPoint[] = [
  { day: 'Mon', views: 24, connections: 4 },
  { day: 'Tue', views: 38, connections: 7 },
  { day: 'Wed', views: 31, connections: 5 },
  { day: 'Thu', views: 52, connections: 11 },
  { day: 'Fri', views: 47, connections: 9 },
  { day: 'Sat', views: 63, connections: 14 },
  { day: 'Sun', views: 58, connections: 12 },
];

type OverviewStat = {
  icon: typeof Eye;
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

const initialStats = [
  { icon: Eye, label: 'Profile Views', value: '1,284', change: '+18%', positive: true },
  { icon: Users, label: 'Connections', value: '347', change: '+12%', positive: true },
  { icon: MessageCircle, label: 'Messages', value: '89', change: '+5%', positive: true },
  { icon: Star, label: 'Avg Rating', value: '4.8', change: '+0.2', positive: true },
] as const;

const recentConnections = professionals.slice(0, 4);

const initialNotifications = [
  { id: 1, type: 'connection', text: 'Dr. Priya Sharma accepted your connection request', time: '2m ago', read: false },
  { id: 2, type: 'message', text: 'New message from Arjun Mehta', time: '15m ago', read: false },
  { id: 3, type: 'review', text: 'You received a 5-star review from Ananya Singh', time: '1h ago', read: true },
  { id: 4, type: 'match', text: 'New 94% match found: Chef Ravi Kumar', time: '3h ago', read: true },
];

const initialActivities = [
  { id: 'act-1', type: 'message', text: 'You chatted with Dr. Priya Sharma regarding ECG reports', time: '10m ago', icon: MessageCircle, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'act-2', type: 'booking', text: 'Appointment booked with Arjun Mehta for Jan 30', time: '2h ago', icon: Calendar, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'act-3', type: 'connection', text: 'Connected with Chef Ravi Kumar', time: '1d ago', icon: Users, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'act-4', type: 'review', text: 'Received 5-star rating from Ananya Singh', time: '2d ago', icon: Star, color: 'text-amber-500 bg-amber-500/10' },
];

// Initial Chat Conversations
type ChatMessage = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  seen: boolean;
};

const initialConversations: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', from: 'them', text: 'Hello! I reviewed your health consultation request. Everything looks in order.', time: '10:15 AM', seen: true },
    { id: 'm2', from: 'me', text: 'Thank you Dr. Sharma! Should I bring my past reports?', time: '10:20 AM', seen: true },
    { id: 'm3', from: 'them', text: 'Yes, please bring your ECG and latest blood tests for our call.', time: '10:22 AM', seen: true },
  ],
  '2': [
    { id: 'm4', from: 'them', text: 'Hey! I looked at the architecture diagram you sent for the React app.', time: 'Yesterday', seen: true },
    { id: 'm5', from: 'them', text: 'We should definitely use Vite and Tailwind for the front end.', time: 'Yesterday', seen: true },
  ],
  '3': [
    { id: 'm6', from: 'them', text: 'Bonjour! Confirming the French menu design for Saturday dinner.', time: '2 days ago', seen: true },
  ],
  '4': [
    { id: 'm7', from: 'them', text: 'Hi there! Here are the practice sheets for calculus differentiation.', time: '3 days ago', seen: true },
  ],
};

// Initial Appointments
export type DashboardAppointment = {
  id: string;
  profId: string;
  profName: string;
  profRole: string;
  profAvatar: string;
  dateTime: string;
  meetingType: string;
  status: 'Confirmed' | 'Upcoming' | 'Pending' | 'Cancelled';
  notes: string;
  rate: string;
};

const initialAppointments: DashboardAppointment[] = [
  { id: 'apt-1', profId: '1', profName: 'Dr. Priya Sharma', profRole: 'Cardiologist', profAvatar: professionals[0].avatar, dateTime: 'Jan 28, 2026 · 10:00 AM', meetingType: 'Google Meet Video Call', status: 'Confirmed', notes: 'Initial cardiology consultation and ECG report evaluation.', rate: '₹800/hr' },
  { id: 'apt-2', profId: '2', profName: 'Arjun Mehta', profRole: 'Full Stack Developer', profAvatar: professionals[1].avatar, dateTime: 'Jan 30, 2026 · 2:00 PM', meetingType: 'Google Meet Video Call', status: 'Upcoming', notes: 'System architecture review and database schema optimization.', rate: '₹2,500/hr' },
  { id: 'apt-3', profId: '3', profName: 'Chef Ravi Kumar', profRole: 'Executive Chef', profAvatar: professionals[2].avatar, dateTime: 'Feb 1, 2026 · 11:00 AM', meetingType: 'In-Person Kitchen Visit', status: 'Pending', notes: 'Catering menu planning and wine pairing session.', rate: '₹1,800/hr' },
  { id: 'apt-4', profId: '4', profName: 'Ananya Singh', profRole: 'Mathematics Teacher', profAvatar: professionals[3].avatar, dateTime: 'Feb 3, 2026 · 4:00 PM', meetingType: 'Google Meet Video Call', status: 'Pending', notes: 'Advanced calculus test preparation and problem solving.', rate: '₹500/hr' },
];

const tabs = ['Overview', 'Connections', 'Messages', 'Bookings', 'Analytics'];

const Dashboard: React.FC<DashboardProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const { connected: socketConnected } = useSocketConnection();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [localBookings, setLocalBookings] = useState<LocalBooking[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(72);
  const [notifOpen, setNotifOpen] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  // Dynamic States
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activities, setActivities] = useState(initialActivities);
  const [stats, setStats] = useState<OverviewStat[]>(initialStats as unknown as OverviewStat[]);
  const [activityData, setActivityData] = useState<OverviewActivityPoint[]>(initialActivityData);

  // Messaging System States
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('cp_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });
  const [selectedProf, setSelectedProf] = useState<typeof professionals[0]>(professionals[0]);
  const [messageSearch, setMessageSearch] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingProfId, setTypingProfId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Appointments States
  const [appointments, setAppointments] = useState<DashboardAppointment[]>(() => {
    const saved = localStorage.getItem('cp_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });
  const [selectedAppointment, setSelectedAppointment] = useState<DashboardAppointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setLocalBookings(loadLocalBookings());
    const interval = setInterval(() => {
      setProfileCompletion((prev) => Math.min(prev + 1, 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'Bookings') {
      setLocalBookings(loadLocalBookings());
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('cp_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('cp_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Payment successful! Your booking is confirmed.');
      setLocalBookings(loadLocalBookings());
      setActiveTab('Bookings');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedProf, isTyping]);

  useEffect(() => {
    const socket = getSocket();
    const onStats = (payload: OverviewStatsPayload) => {
      const next = [
        { icon: Eye, label: 'Profile Views', value: payload.profileViews.toLocaleString('en-IN'), change: '+live', positive: true },
        { icon: Users, label: 'Connections', value: payload.connections.toString(), change: '+live', positive: true },
        { icon: MessageCircle, label: 'Messages', value: payload.messages.toString(), change: '+live', positive: true },
        { icon: Star, label: 'Avg Rating', value: payload.avgRating.toFixed(1), change: '+live', positive: true },
      ] as const;
      setStats(next as unknown as OverviewStat[]);
    };

    const onActivity = (payload: OverviewActivityPoint[]) => {
      if (!Array.isArray(payload)) return;
      setActivityData(payload);
    };

    socket.on('overview:stats', onStats as unknown as (payload: OverviewStatsPayload) => void);
    socket.on('overview:activity', onActivity as unknown as (payload: OverviewActivityPoint[]) => void);

    return () => {
      socket.off('overview:stats', onStats as unknown as (payload: OverviewStatsPayload) => void);
      socket.off('overview:activity', onActivity as unknown as (payload: OverviewActivityPoint[]) => void);
    };
  }, []);

  // Open Chat Handler
  const handleOpenChat = (prof: typeof professionals[0]) => {
    setSelectedProf(prof);
    setActiveTab('Messages');
  };

  // Send Message Handler
  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'me',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false,
    };

    const currentConv = conversations[selectedProf.id] || [];
    const updatedConv = [...currentConv, newMsg];
    setConversations(prev => ({ ...prev, [selectedProf.id]: updatedConv }));
    setInputMsg('');

    // Push Activity
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'message',
        text: `You sent a message to ${selectedProf.name}`,
        time: 'Just now',
        icon: MessageCircle,
        color: 'text-blue-500 bg-blue-500/10',
      },
      ...prev,
    ]);

    // Simulate Seen and AI Typing Response
    const activeProf = selectedProf;
    setTimeout(() => {
      setConversations(prev => {
        const conv = prev[activeProf.id] || [];
        return {
          ...prev,
          [activeProf.id]: conv.map(m => ({ ...m, seen: true })),
        };
      });
      setIsTyping(true);
      setTypingProfId(activeProf.id);

      setTimeout(() => {
        setIsTyping(false);
        setTypingProfId(null);
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          from: 'them',
          text: `Thank you for your message! I have received your request and will follow up with complete details shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true,
        };
        setConversations(prev => ({
          ...prev,
          [activeProf.id]: [...(prev[activeProf.id] || []), replyMsg],
        }));

        // Push real notification
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'message',
            text: `New reply from ${activeProf.name}`,
            time: 'Just now',
            read: false,
          },
          ...prev,
        ]);
        toast.info(`New message from ${activeProf.name}`);
      }, 3000);
    }, 1500);
  };

  // Appointment Actions
  const handleCancelAppointment = (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    setSelectedAppointment(prev => prev && prev.id === id ? { ...prev, status: 'Cancelled' } : prev);
    toast.success('Appointment cancelled successfully.');
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'booking',
        text: `You cancelled your appointment`,
        time: 'Just now',
        icon: X,
        color: 'text-rose-500 bg-rose-500/10',
      },
      ...prev,
    ]);
  };

  const handleRescheduleConfirm = () => {
    if (!selectedAppointment || !rescheduleDate) {
      toast.warn('Please select a valid date for rescheduling.');
      return;
    }
    const newDateTime = `${new Date(rescheduleDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} · ${rescheduleTime}`;
    setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, dateTime: newDateTime, status: 'Confirmed' } : a));
    setSelectedAppointment(prev => prev ? { ...prev, dateTime: newDateTime, status: 'Confirmed' } : null);
    setIsRescheduling(false);
    toast.success(`Appointment successfully rescheduled to ${newDateTime}!`);
  };

  const filteredChatProfs = useMemo(() => {
    if (!messageSearch.trim()) return professionals;
    return professionals.filter(p => p.name.toLowerCase().includes(messageSearch.toLowerCase()) || p.role.toLowerCase().includes(messageSearch.toLowerCase()));
  }, [messageSearch]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--cp-indigo))]/30 border-t-[hsl(var(--cp-indigo))] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] pt-8 pb-6 px-4 fixed top-16 bottom-0 left-0 z-30 shadow-sm">
          <div className="flex flex-col items-center text-center mb-8 px-2">
            <div className="relative mb-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
                alt="Your profile"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[hsl(var(--cp-indigo))]/30"
              />
              <button
                type="button"
                onClick={() => {
                  setOnlineStatus(prev => {
                    const next = !prev;
                    toast.info(next ? 'Status set to Online' : 'Status set to Away');
                    return next;
                  });
                }}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[hsl(var(--card))] transition-colors shadow-sm ${
                  onlineStatus ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={onlineStatus ? 'Online' : 'Away'}
              />
            </div>
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{currentUser?.name ?? 'Your Profile'}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Premium Account</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1.5 font-medium">
                <span>Profile Strength</span>
                <span className="text-[hsl(var(--cp-indigo))] font-bold">{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] rounded-full"
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))]/15 to-[hsl(var(--cp-violet))]/15 border-l-4 border-[hsl(var(--cp-indigo))] text-[hsl(var(--cp-indigo))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80 hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {tab === 'Overview' && <Activity className="w-4 h-4" />}
                {tab === 'Connections' && <Users className="w-4 h-4" />}
                {tab === 'Messages' && <MessageCircle className="w-4 h-4" />}
                {tab === 'Bookings' && <Calendar className="w-4 h-4" />}
                {tab === 'Analytics' && <TrendingUp className="w-4 h-4" />}
                <span>{tab}</span>
              </button>
            ))}
          </nav>

          <div className="space-y-1 border-t border-[hsl(var(--border))] pt-4">
            <button
              type="button"
              onClick={() => navigate('/settings/profile')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all duration-200"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[hsl(var(--border))]/50">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
                {activeTab === 'Overview' ? 'User Dashboard' : activeTab}
              </h1>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-3 font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    socketConnected
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-sm'
                      : 'bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[hsl(var(--muted-foreground))]'
                    }`}
                  />
                  Live API
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile tabs */}
              <div className="lg:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm font-bold focus:outline-none shadow-sm"
                >
                  {tabs.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="relative z-50">
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/80 transition-all shadow-sm"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-md animate-bounce">
                      {unread}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 top-14 w-80 sm:w-96 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--background))]/50">
                        <h3 className="font-bold text-sm text-[hsl(var(--foreground))] flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[hsl(var(--cp-indigo))]" />
                          Notifications ({unread})
                        </h3>
                        {unread > 0 && (
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-bold text-[hsl(var(--cp-indigo))] hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-[hsl(var(--border))]/60 max-h-80 overflow-y-auto scrollbar-thin">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-4 flex gap-3 transition-colors ${!n.read ? 'bg-[hsl(var(--cp-indigo))]/10' : 'hover:bg-[hsl(var(--muted))]/40'}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[hsl(var(--cp-indigo))] shadow-sm' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[hsl(var(--foreground))] leading-snug">{n.text}</p>
                              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 font-medium">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map(({ icon: Icon, label, value, change, positive }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:border-[hsl(var(--cp-indigo))]/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--cp-indigo))]/15 to-[hsl(var(--cp-violet))]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                          positive
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        }`}
                      >
                        {change}
                      </span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">{value}</p>
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart & Recent Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[hsl(var(--cp-indigo))]" /> Weekly Activity Analytics
                    </h2>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">Updated Real-Time</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--cp-violet))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--cp-violet))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                        }}
                      />
                      <Area type="monotone" dataKey="views" stroke="hsl(var(--cp-indigo))" strokeWidth={3} fill="url(#viewsGrad)" name="Profile Views" />
                      <Area type="monotone" dataKey="connections" stroke="hsl(var(--cp-violet))" strokeWidth={3} fill="url(#connGrad)" name="New Connections" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-[hsl(var(--border))]/50">
                    <h2 className="font-heading font-bold text-base text-[hsl(var(--foreground))] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Recent Activity
                    </h2>
                    <span className="text-xs font-bold text-[hsl(var(--cp-indigo))] bg-[hsl(var(--cp-indigo))]/10 px-2 py-0.5 rounded-full">
                      Live Stream
                    </span>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin">
                    {activities.map((act) => {
                      const Icon = act.icon;
                      return (
                        <div key={act.id} className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[hsl(var(--muted))]/50 transition-all group">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${act.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[hsl(var(--foreground))] leading-snug group-hover:text-[hsl(var(--cp-indigo))] transition-colors">
                              {act.text}
                            </p>
                            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">{act.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent connections + AI suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-[hsl(var(--border))]/50">
                    <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[hsl(var(--cp-indigo))]" /> Active Connections
                    </h2>
                    <button type="button" onClick={() => setActiveTab('Connections')} className="text-xs font-bold text-[hsl(var(--cp-indigo))] hover:underline flex items-center gap-1">
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentConnections.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--muted))]/60 border border-transparent hover:border-[hsl(var(--border))] transition-all">
                        <div className="relative">
                          <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--card))] ${
                            p.available ? 'bg-emerald-500' : 'bg-amber-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] truncate">{p.name}</p>
                            {p.verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">{p.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenChat(p)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-[hsl(var(--border))]/50">
                    <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[hsl(var(--cp-indigo))]" /> Smart AI Recommendations
                    </h2>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      95%+ Fit
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {professionals.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/profile/${p.id}`)}
                        className="flex items-center gap-4 p-3.5 rounded-xl bg-gradient-to-r hover:from-[hsl(var(--cp-indigo))]/10 hover:to-[hsl(var(--cp-violet))]/10 border border-[hsl(var(--border))] cursor-pointer transition-all duration-200 group shadow-sm"
                      >
                        <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--cp-indigo))] transition-colors">{p.name}</p>
                            {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
                            <span className="text-emerald-500 font-bold">{p.matchScore}% Match Score</span> · {p.distance}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--cp-indigo))] group-hover:text-white transition-colors flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[hsl(var(--cp-indigo))]" /> Quick Action Shortcuts
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Users, label: 'Find Matches', action: () => navigate('/matches'), color: 'text-blue-500 bg-blue-500/15 border-blue-500/30' },
                    { icon: Briefcase, label: 'Post Service', action: () => navigate('/post-service'), color: 'text-violet-500 bg-violet-500/15 border-violet-500/30' },
                    { icon: Calendar, label: 'Book Slot', action: () => navigate('/bookings/new'), color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30' },
                    { icon: Award, label: 'Get Verified', action: () => setVerifyOpen(true), color: 'text-amber-500 bg-amber-500/15 border-amber-500/30' },
                  ].map(({ icon: Icon, label, action, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl border bg-[hsl(var(--background))]/50 hover:bg-[hsl(var(--muted))]/80 hover:scale-[1.02] transition-all shadow-sm group"
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:rotate-6 transition-transform ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[hsl(var(--foreground))]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'Connections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/50 pb-4 mb-6">
                <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Users className="text-[hsl(var(--cp-indigo))]" /> My Verified Connections ({professionals.length})
                </h2>
                <span className="text-xs bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] font-bold px-3 py-1 rounded-full">
                  Fully Connected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {professionals.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative flex-shrink-0">
                        <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[hsl(var(--card))] ${
                          p.available ? 'bg-emerald-500' : 'bg-amber-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="font-bold text-base text-[hsl(var(--foreground))] truncate">{p.name}</p>
                          {p.verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 truncate">{p.role}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          p.available ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {p.available ? 'Online Now' : 'Away'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-4 border-t border-[hsl(var(--border))]/50">
                      <Link
                        to={`/profile/${p.id}`}
                        className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold text-center hover:bg-[hsl(var(--muted))] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenChat(p)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" /> Message Box
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'Messages' && (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 h-[640px]">
                {/* Left Sidebar: Conversations List */}
                <div className="border-r border-[hsl(var(--border))] flex flex-col h-full bg-[hsl(var(--background))]/50">
                  <div className="p-4 border-b border-[hsl(var(--border))]">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={messageSearch}
                        onChange={e => setMessageSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border))]/50 scrollbar-thin">
                    {filteredChatProfs.map((p) => {
                      const conv = conversations[p.id] || [];
                      const lastMsg = conv[conv.length - 1];
                      const isSelected = selectedProf.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProf(p)}
                          className={`flex items-start gap-3.5 p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))]/15 to-transparent border-l-4 border-[hsl(var(--cp-indigo))] shadow-sm'
                              : 'hover:bg-[hsl(var(--muted))]/60'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--card))] ${
                              p.available ? 'bg-emerald-500' : 'bg-amber-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-bold text-[hsl(var(--foreground))] truncate">{p.name}</h4>
                              <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">{lastMsg ? lastMsg.time : 'New'}</span>
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">
                              {lastMsg ? lastMsg.text : 'Click to start conversation...'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Main Chat Box */}
                <div className="md:col-span-2 flex flex-col h-full bg-[hsl(var(--card))]">
                  {/* Active User Header */}
                  <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--background))]/30 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex-shrink-0">
                        <img src={selectedProf.avatar} alt={selectedProf.name} className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--card))] ${
                          selectedProf.available ? 'bg-emerald-500' : 'bg-amber-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-[hsl(var(--foreground))]">{selectedProf.name}</h3>
                          {selectedProf.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedProf.available ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className={selectedProf.available ? 'text-emerald-500 font-semibold' : ''}>{selectedProf.available ? 'Online now' : 'Away'}</span> · {selectedProf.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${selectedProf.id}`}
                        className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> View Profile
                      </Link>
                    </div>
                  </div>

                  {/* Messages Scroll View */}
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin">
                    {(conversations[selectedProf.id] || []).map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4.5 py-3 rounded-2xl text-xs sm:text-sm shadow-md font-medium ${
                            msg.from === 'me'
                              ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white rounded-br-sm'
                              : 'bg-[hsl(var(--muted))]/80 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-bl-sm'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap font-sans">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1.5 mt-2 text-[10px] font-bold ${
                            msg.from === 'me' ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'
                          }`}>
                            <span>{msg.time}</span>
                            {msg.from === 'me' && (
                              msg.seen ? (
                                <span title="Seen" className="inline-flex items-center">
                                  <CheckCheck className="w-4 h-4 text-sky-300" />
                                </span>
                              ) : (
                                <span title="Sent" className="inline-flex items-center">
                                  <Check className="w-4 h-4 text-white/60" />
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && typingProfId === selectedProf.id && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="px-4.5 py-3 rounded-2xl bg-[hsl(var(--muted))] text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-2.5 rounded-bl-sm shadow-sm border border-[hsl(var(--border))]">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--cp-indigo))] animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--cp-indigo))] animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--cp-indigo))] animate-bounce [animation-delay:0.4s]" />
                          </div>
                          <span>{selectedProf.name} is typing...</span>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Box */}
                  <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/30 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={`Write your message to ${selectedProf.name}...`}
                      value={inputMsg}
                      onChange={e => setInputMsg(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="flex-1 px-4.5 py-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!inputMsg.trim()}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'Bookings' && (
            <div className="space-y-6">
              {localBookings.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h2 className="font-heading text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Marketplace Custom Bookings
                  </h2>
                  {localBookings.map((bk, i) => (
                    <motion.div
                      key={bk.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-[hsl(var(--foreground))] mb-1 truncate">{bk.serviceTitle}</p>
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">
                          Provider: <span className="text-[hsl(var(--foreground))]">{bk.provider}</span> · {bk.priceLabel}
                        </p>
                        <p className="text-xs font-bold text-[hsl(var(--cp-indigo))] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 inline mr-0.5" />
                          {bk.date} at {bk.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm ${
                            bk.status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {bk.status === 'paid' ? 'Paid & Confirmed' : 'Pending Payment'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/50 pb-4 mb-6">
                <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Calendar className="text-[hsl(var(--cp-indigo))]" /> Scheduled Professional Appointments
                </h2>
                <span className="text-xs bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] font-bold px-3 py-1 rounded-full">
                  {appointments.filter(a => a.status !== 'Cancelled').length} Active
                </span>
              </div>

              <div className="space-y-4">
                {appointments.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-[hsl(var(--card))] border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5 shadow-sm transition-all ${
                      apt.status === 'Cancelled' ? 'border-rose-500/30 opacity-75 bg-[hsl(var(--background))]/50' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--cp-indigo))]/40'
                    }`}
                  >
                    <img src={apt.profAvatar} alt={apt.profName} className="w-14 h-14 rounded-2xl object-cover shadow-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-base text-[hsl(var(--foreground))] truncate">{apt.profName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          apt.status === 'Confirmed' ? 'bg-emerald-500/15 text-emerald-500' : apt.status === 'Upcoming' ? 'bg-blue-500/15 text-blue-500' : apt.status === 'Pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 truncate">
                        {apt.profRole} · <span className="text-[hsl(var(--foreground))]">{apt.rate}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[hsl(var(--cp-indigo))]">
                        <span className="flex items-center gap-1 bg-[hsl(var(--cp-indigo))]/10 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" /> {apt.dateTime}
                        </span>
                        <span className="flex items-center gap-1 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-2.5 py-1 rounded-lg">
                          <Video className="w-3.5 h-3.5 text-[hsl(var(--cp-indigo))]" /> {apt.meetingType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(apt)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Booking Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Total Profile Views', value: '12,840', icon: Eye, change: '+24%' },
                  { label: 'Connection Conversion', value: '68%', icon: Users, change: '+8%' },
                  { label: 'Instant Response Rate', value: '94%', icon: MessageCircle, change: '+3%' },
                ].map(({ label, value, icon: Icon, change }) => (
                  <div key={label} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:border-[hsl(var(--cp-indigo))]/40 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--cp-indigo))]/15 to-[hsl(var(--cp-violet))]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-sm">{change}</span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">{value}</p>
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--cp-indigo))]" /> 30-Day Growth Trajectory
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={[
                      ...activityData,
                      ...activityData.map((d) => ({ ...d, views: d.views * 1.3, connections: d.connections * 1.2 })),
                      ...activityData.map((d) => ({ ...d, views: d.views * 1.6, connections: d.connections * 1.5 })),
                    ]}
                  >
                    <defs>
                      <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--cp-indigo))" strokeWidth={3} fill="url(#viewsGrad2)" name="Profile Views" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setSelectedAppointment(null); setIsRescheduling(false); } }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-7 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--cp-blue))] via-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))]" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]/50">
                <h3 className="font-heading text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                  Appointment Details
                </h3>
                <button
                  type="button"
                  onClick={() => { setSelectedAppointment(null); setIsRescheduling(false); }}
                  className="p-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[hsl(var(--background))]/50 border border-[hsl(var(--border))] mb-6 shadow-sm">
                <img src={selectedAppointment.profAvatar} alt={selectedAppointment.profName} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] truncate">{selectedAppointment.profName}</h4>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                      selectedAppointment.status === 'Confirmed' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : selectedAppointment.status === 'Upcoming' ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30' : selectedAppointment.status === 'Pending' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">{selectedAppointment.profRole}</p>
                  <span className="text-xs font-bold text-[hsl(var(--cp-indigo))]">{selectedAppointment.rate}</span>
                </div>
              </div>

              {!isRescheduling ? (
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-2xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Scheduled Date & Time:
                      </span>
                      <span className="font-bold text-[hsl(var(--foreground))]">{selectedAppointment.dateTime}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-[hsl(var(--border))]/50">
                      <span className="font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                        <Video className="w-4 h-4 text-[hsl(var(--cp-indigo))]" /> Consultation Mode:
                      </span>
                      <span className="font-bold text-[hsl(var(--foreground))] bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] px-2.5 py-1 rounded-lg">
                        {selectedAppointment.meetingType}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[hsl(var(--background))]/50 border border-[hsl(var(--border))]">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block mb-1.5 uppercase tracking-wider">
                      Meeting Notes / Objective
                    </label>
                    <p className="text-xs font-medium text-[hsl(var(--foreground))] leading-relaxed">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-8 p-4 rounded-2xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--cp-indigo))] mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Pick New Date & Time Slot
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">New Appointment Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50"
                    />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">New Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleTime(slot)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            rescheduleTime === slot
                              ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white border-transparent shadow-md'
                              : 'bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--cp-indigo))]/40'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold hover:bg-[hsl(var(--muted))] transition-all"
                    >
                      Back to Details
                    </button>
                    <button
                      type="button"
                      onClick={handleRescheduleConfirm}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
                    >
                      Save New Slot
                    </button>
                  </div>
                </div>
              )}

              {!isRescheduling && selectedAppointment.status !== 'Cancelled' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="flex-1 py-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Cancel Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(true)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> Reschedule Slot
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VerificationWizard
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onComplete={() => setVerifyOpen(false)}
        userId={currentUser?.id ?? 'guest-user'}
        userName={currentUser?.name ?? 'Your Profile'}
        professionalId="p-self"
      />
    </div>
  );
};

export default Dashboard;
