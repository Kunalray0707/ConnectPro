import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, MessageCircle, Star, TrendingUp, Bell, Settings, BadgeCheck, Calendar, Zap, Eye, Award, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { professionals } from '../data/professionals';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { loadLocalBookings, type LocalBooking } from '../lib/localBookings';
import VerificationWizard from '../components/VerificationWizard';

interface DashboardProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const activityData = [
  { day: 'Mon', views: 24, connections: 4 },
  { day: 'Tue', views: 38, connections: 7 },
  { day: 'Wed', views: 31, connections: 5 },
  { day: 'Thu', views: 52, connections: 11 },
  { day: 'Fri', views: 47, connections: 9 },
  { day: 'Sat', views: 63, connections: 14 },
  { day: 'Sun', views: 58, connections: 12 },
];

const notifications = [
  { id: 1, type: 'connection', text: 'Dr. Priya Sharma accepted your connection request', time: '2m ago', read: false },
  { id: 2, type: 'message', text: 'New message from Arjun Mehta', time: '15m ago', read: false },
  { id: 3, type: 'review', text: 'You received a 5-star review from Ananya Singh', time: '1h ago', read: true },
  { id: 4, type: 'match', text: 'New 94% match found: Chef Ravi Kumar', time: '3h ago', read: true },
];

const recentConnections = professionals.slice(0, 4);

const tabs = ['Overview', 'Connections', 'Messages', 'Bookings', 'Analytics'];

const Dashboard: React.FC<DashboardProps> = ({ theme, toggleTheme }) => {
  const { currentUser, loading } = useAuth();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [localBookings, setLocalBookings] = useState<LocalBooking[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(72);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread] = useState(notifications.filter(n => !n.read).length);
  const [onlineStatus, setOnlineStatus] = useState(true);

  useEffect(() => {
    setLocalBookings(loadLocalBookings());
    const interval = setInterval(() => {
      setProfileCompletion(prev => Math.min(prev + 1, 100));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'Bookings') {
      setLocalBookings(loadLocalBookings());
    }
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Payment successful! Your booking is confirmed.');
      setLocalBookings(loadLocalBookings());
      setActiveTab('Bookings');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const stats = [
    { icon: Eye, label: 'Profile Views', value: '1,284', change: '+18%', positive: true },
    { icon: Users, label: 'Connections', value: '347', change: '+12%', positive: true },
    { icon: MessageCircle, label: 'Messages', value: '89', change: '+5%', positive: true },
    { icon: Star, label: 'Avg Rating', value: '4.8', change: '+0.2', positive: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--cp-indigo))]/30 border-t-[hsl(var(--cp-indigo))] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] pt-8 pb-6 px-4 fixed top-16 bottom-0 left-0 z-30">
          {/* User info */}
          <div className="flex flex-col items-center text-center mb-8 px-2">
            <div className="relative mb-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
                alt="Your profile"
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[hsl(var(--cp-indigo))]/30"
              />
              <button
                onClick={() => { setOnlineStatus(!onlineStatus); toast.info(onlineStatus ? 'Status set to Away' : 'Status set to Online'); }}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[hsl(var(--card))] transition-colors ${onlineStatus ? 'bg-emerald-500' : 'bg-amber-400'}`}
              />
            </div>
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{currentUser?.name ?? 'Your Profile'}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Account Settings</p>
            <div className="mt-3 w-full">
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
                <span>Profile</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] rounded-full"
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {tab === 'Overview' && <Activity className="w-4 h-4" />}
                {tab === 'Connections' && <Users className="w-4 h-4" />}
                {tab === 'Messages' && <MessageCircle className="w-4 h-4" />}
                {tab === 'Bookings' && <Calendar className="w-4 h-4" />}
                {tab === 'Analytics' && <TrendingUp className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </nav>

          <div className="space-y-1 border-t border-[hsl(var(--border))] pt-4">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all duration-200">
              <Settings className="w-4 h-4" /> Settings
            </button>

          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
                {activeTab === 'Overview' ? 'Dashboard' : activeTab}
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile tabs */}
              <div className="lg:hidden">
                <select
                  value={activeTab}
                  onChange={e => setActiveTab(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm focus:outline-none"
                >
                  {tabs.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--cp-indigo))] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-12 w-80 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[hsl(var(--border))]">
                      <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">Notifications</h3>
                    </div>
                    <div className="divide-y divide-[hsl(var(--border))]">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 flex gap-3 ${!n.read ? 'bg-[hsl(var(--cp-indigo))]/5' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[hsl(var(--cp-indigo))]' : 'bg-transparent'}`} />
                          <div>
                            <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed">{n.text}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, change, positive }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[hsl(var(--cp-indigo))]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[hsl(var(--cp-indigo))]" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                        {change}
                      </span>
                    </div>
                    <p className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-6">Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--cp-violet))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--cp-violet))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--cp-indigo))" strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
                    <Area type="monotone" dataKey="connections" stroke="hsl(var(--cp-violet))" strokeWidth={2} fill="url(#connGrad)" name="Connections" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent connections + AI suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading font-semibold text-[hsl(var(--foreground))]">Recent Connections</h2>
                    <Link to="/discover" className="text-xs text-[hsl(var(--cp-indigo))] hover:underline">View all</Link>
                  </div>
                  <div className="space-y-4">
                    {recentConnections.map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                        <img src={p.avatar} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{p.name}</p>
                            {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-[hsl(var(--cp-indigo))] flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{p.role}</p>
                        </div>
                        <Link
                          to={`/profile/${p.id}`}
                          className="text-xs px-3 py-1.5 rounded-full border border-[hsl(var(--cp-indigo))]/30 text-[hsl(var(--cp-indigo))] hover:bg-[hsl(var(--cp-indigo))]/10 transition-all duration-200"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-4 h-4 text-[hsl(var(--cp-indigo))]" />
                    <h2 className="font-heading font-semibold text-[hsl(var(--foreground))]">AI Recommendations</h2>
                  </div>
                  <div className="space-y-3">
                    {professionals.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] transition-all duration-200">
                        <img src={p.avatar} alt={p.name} width={36} height={36} className="w-9 h-9 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{p.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.matchScore}% match · {p.distance}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Users, label: 'Find Matches', action: () => toast.info('Opening discover...'), color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
                    { icon: Briefcase, label: 'Post Service', action: () => toast.success('Service posting opened!'), color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
                    { icon: Calendar, label: 'Book Slot', action: () => toast.info('Calendar opened!'), color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                    { icon: Award, label: 'Get Verified', action: () => setVerifyOpen(true), color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                  ].map(({ icon: Icon, label, action, color }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[hsl(var(--border))] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'Connections' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 flex items-center gap-4"
                  >
                    <img src={p.avatar} alt={p.name} width={48} height={48} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm text-[hsl(var(--foreground))] truncate">{p.name}</p>
                        {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-[hsl(var(--cp-indigo))] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{p.available ? 'Online' : 'Away'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/profile/${p.id}`} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                        <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </Link>
                      <button onClick={() => toast.success(`Message sent to ${p.name}!`)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                        <MessageCircle className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'Messages' && (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
                <div className="border-r border-[hsl(var(--border))] overflow-y-auto">
                  <div className="p-4 border-b border-[hsl(var(--border))]">
                    <input type="text" placeholder="Search messages..." className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40" />
                  </div>
                  {professionals.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-3 p-4 hover:bg-[hsl(var(--muted))]/50 cursor-pointer transition-colors ${i === 0 ? 'bg-[hsl(var(--cp-indigo))]/5 border-l-2 border-[hsl(var(--cp-indigo))]' : ''}`}>
                      <div className="relative">
                        <img src={p.avatar} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                        {p.available && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[hsl(var(--card))] rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{p.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">Hey, are you available for...</p>
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">2m</span>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <div className="p-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
                    <img src={professionals[0].avatar} alt={professionals[0].name} width={36} height={36} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-sm text-[hsl(var(--foreground))]">{professionals[0].name}</p>
                      <p className="text-xs text-emerald-500">Online</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {[
                      { from: 'them', text: 'Hello! I saw your profile and I think we could collaborate.', time: '10:30 AM' },
                      { from: 'me', text: 'Hi! That sounds great. What did you have in mind?', time: '10:32 AM' },
                      { from: 'them', text: 'I need a consultation for a complex case. Are you available this week?', time: '10:33 AM' },
                    ].map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'}`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-[hsl(var(--border))] flex gap-3">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
                    />
                    <button
                      onClick={() => toast.success('Message sent!')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-medium hover:scale-105 transition-all duration-200"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'Bookings' && (
            <div className="space-y-4">
              {localBookings.length > 0 && (
                <>
                  <h2 className="font-heading text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Your marketplace bookings
                  </h2>
                  {localBookings.map((bk, i) => (
                    <motion.div
                      key={bk.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[hsl(var(--foreground))]">{bk.serviceTitle}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{bk.provider} · {bk.priceLabel}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          {bk.date} at {bk.time}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        bk.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        {bk.status === 'paid' ? 'Paid' : 'Pending payment'}
                      </span>
                    </motion.div>
                  ))}
                </>
              )}
              <h2 className="font-heading text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide pt-2">
                Sample appointments
              </h2>
              {professionals.slice(0, 4).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <img src={p.avatar} alt={p.name} width={48} height={48} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-[hsl(var(--foreground))]">{p.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{p.role} · {p.rate}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      {['Jan 28, 2026 · 10:00 AM', 'Jan 30, 2026 · 2:00 PM', 'Feb 1, 2026 · 11:00 AM', 'Feb 3, 2026 · 4:00 PM'][i]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${i === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : i === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {['Confirmed', 'Upcoming', 'Pending', 'Pending'][i]}
                    </span>
                    <button
                      onClick={() => toast.info('Booking details opened!')}
                      className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Profile Views', value: '12,840', icon: Eye, change: '+24%' },
                  { label: 'Connection Rate', value: '68%', icon: Users, change: '+8%' },
                  { label: 'Response Rate', value: '94%', icon: MessageCircle, change: '+3%' },
                ].map(({ label, value, icon: Icon, change }) => (
                  <div key={label} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--cp-indigo))]/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">{change}</span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">{value}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <h2 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-6">30-Day Performance</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[...activityData, ...activityData.map(d => ({ ...d, views: d.views * 1.3, connections: d.connections * 1.2 })), ...activityData.map(d => ({ ...d, views: d.views * 1.6, connections: d.connections * 1.5 }))]}>
                    <defs>
                      <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--cp-indigo))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--cp-indigo))" strokeWidth={2} fill="url(#viewsGrad2)" name="Views" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>

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