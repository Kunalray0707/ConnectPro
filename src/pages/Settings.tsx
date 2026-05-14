import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Link2, Eye, BadgeCheck, ChevronRight, Camera, Save, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface SettingsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMode?: boolean;
  toggleMobileMode?: () => void;
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  role: z.string().min(2, 'Role is required'),
  skills: z.string().optional().or(z.literal('')),
  experience: z.string().optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'payment' | 'connected' | 'verification';

type ConnectedAccount = {
  name: string;
  icon: string;
  username: string;
  profileUrl: string;
  connected: boolean;
};

type ProfileChange = {
  label: string;
  before: string;
  after: string;
};

const settingsTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard size={18} /> },
  { id: 'connected', label: 'Connected Accounts', icon: <Link2 size={18} /> },
  { id: 'verification', label: 'Verification', icon: <BadgeCheck size={18} /> },
];

const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme, mobileMode = false, toggleMobileMode = () => {} }) => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [savedProfile, setSavedProfile] = useState<ProfileFormData | null>(null);
  const [profileChanges, setProfileChanges] = useState<ProfileChange[]>([]);
  const [showSaveSummary, setShowSaveSummary] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    connections: true,
    messages: true,
    appointments: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLocation: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    { name: 'GitHub', icon: '⚫', username: 'Kunalray0707', profileUrl: 'https://github.com/Kunalray0707', connected: false },
    { name: 'LinkedIn', icon: '🔷', username: 'kunal-ray-3483812b9', profileUrl: 'https://linkedin.com/in/kunal-ray-3483812b9', connected: false },
  ]);

  const defaultValues: ProfileFormData = useMemo(
    () => ({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      bio: '',
      location: currentUser?.location ?? '',
      role: currentUser?.role ?? '',
      skills: '',
      experience: '',
      avatar_url: '',
    }),
    [currentUser]
  );

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    const init = async () => {
      if (!currentUser?.id) return;

      setLoadingProfile(true);
      try {
        // Fetch user profile fields from `profiles`.
        // Expected columns: user_id, name, phone, location, role, bio, skills, experience, avatar_url.
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, name, phone, location, role, bio, skills, experience, avatar_url, avatar')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error) throw error;

        const row: any = data;
        const skillsStr = Array.isArray(row?.skills)
          ? row.skills.join(', ')
          : row?.skills
            ? String(row.skills)
            : '';

        const avatar = row?.avatar_url || row?.avatar || '';

        const loaded: ProfileFormData = {
          name: row?.name ?? currentUser.name ?? '',
          email: currentUser.email ?? row?.email ?? '',
          phone: row?.phone ?? currentUser.phone ?? '',
          bio: row?.bio ?? '',
          location: row?.location ?? currentUser.location ?? '',
          role: row?.role ?? currentUser.role ?? '',
          skills: skillsStr,
          experience: row?.experience ?? '',
          avatar_url: avatar,
        };

        setSavedProfile(loaded);
        reset(loaded);
      } catch (e: any) {
        console.error('Load profile error:', e);
        const loaded = {
          ...defaultValues,
          bio: '',
          skills: '',
          experience: '',
          avatar_url: '',
        };
        setSavedProfile(loaded);
        reset(loaded);
        toast.error('Could not load profile from database. Using local defaults.');
      } finally {
        setLoadingProfile(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    const storedAccounts = localStorage.getItem('cp-connected-accounts');
    if (storedAccounts) {
      try {
        setConnectedAccounts(JSON.parse(storedAccounts) as ConnectedAccount[]);
      } catch {
        // ignore
      }
    }
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser?.id || !savedProfile) return;

    const changes: ProfileChange[] = [];
    (Object.keys(data) as Array<keyof ProfileFormData>).forEach((key) => {
      const before = (savedProfile[key] ?? '') as any;
      const after = (data[key] ?? '') as any;
      if (String(before) !== String(after)) {
        changes.push({ label: String(key).replace(/([A-Z])/g, ' $1'), before: String(before), after: String(after) });
      }
    });

    try {
      // Upsert into profiles table (user profile record)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.id,
          name: data.name,
          phone: data.phone,
          location: data.location,
          role: data.role,
          bio: data.bio || null,
          experience: data.experience || null,
          skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          avatar_url: data.avatar_url || null,
          public: true,
        })
        .select();

      if (error) throw error;

      const nextSaved: ProfileFormData = {
        ...data,
        avatar_url: data.avatar_url || '',
      };

      setSavedProfile(nextSaved);
      setProfileChanges(changes);
      setShowSaveSummary(true);
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      console.error('Update profile error:', e);
      toast.error('Failed to update profile.');
    }
  };

  const handleToggleAccount = (accountName: string) => {
    setConnectedAccounts((prev) => {
      const next = prev.map((account) => (account.name === accountName ? { ...account, connected: !account.connected } : account));
      localStorage.setItem('cp-connected-accounts', JSON.stringify(next));
      return next;
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={toggleMobileMode} />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your account preferences and profile</p>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                Open Admin Panel
              </Link>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="md:w-56 flex-shrink-0">
              <nav className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-2 space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[hsl(var(--cp-blue))]/15 to-[hsl(var(--cp-violet))]/10 text-[hsl(var(--cp-blue))]'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <span className="flex items-center gap-3">{tab.icon}{tab.label}</span>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>
                ))}
              </nav>
            </aside>

            <div className="flex-1">
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div>
                        <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">Profile Information</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your details are saved to the database.</p>
                      </div>
                      <button
                        onClick={async () => {
                          await signOut();
                          toast.success('Signed out');
                          window.location.href = '/';
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-400/40 text-rose-500 hover:bg-rose-500/10 transition-all duration-200 text-sm font-semibold"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>

                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative">
                        <img
                          src={watchAvatar(savedProfile)}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[hsl(var(--cp-blue))] text-white flex items-center justify-center hover:scale-110 transition-transform duration-200" type="button">
                          <Camera size={14} />
                        </button>
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-[hsl(var(--foreground))]">{savedProfile?.name || currentUser?.name || 'Your Name'}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{savedProfile?.role || currentUser?.role || 'Role'}</p>
                        <p className="text-xs text-[hsl(var(--cp-blue))] hover:underline mt-1">Update photo via Profile Image URL</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Full Name</label>
                          <input {...register('name')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Role / Title</label>
                          <input {...register('role')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                          {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Email</label>
                          <input {...register('email')} type="email" className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Phone</label>
                          <input {...register('phone')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Location</label>
                          <input {...register('location')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                          {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Profile Image URL</label>
                          <input {...register('avatar_url')} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Bio</label>
                        <textarea {...register('bio')} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30 resize-none" />
                        {errors.bio && <p className="text-xs text-rose-500 mt-1">{errors.bio.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Skills (comma separated)</label>
                          <input {...register('skills')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">Experience</label>
                          <input {...register('experience')} className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingProfile}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200 disabled:opacity-60"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </form>

                    {showSaveSummary && savedProfile && (
                      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-5">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-3">Saved Profile Details</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(
                            Object.entries(savedProfile) as Array<[keyof ProfileFormData, any]>
                          ).map(([key, value]) => (
                            <div key={String(key)} className="rounded-2xl bg-[hsl(var(--card))] p-4">
                              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em]">{String(key)}</p>
                              <p className="mt-2 text-sm text-[hsl(var(--foreground))]">{Array.isArray(value) ? value.join(', ') : String(value ?? '')}</p>
                            </div>
                          ))}
                        </div>
                        {profileChanges.length > 0 && (
                          <div className="mt-5 rounded-2xl bg-[hsl(var(--card))] p-4">
                            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Changes applied</h4>
                            <ul className="space-y-2 text-sm text-[hsl(var(--foreground))]">
                              {profileChanges.map((change) => (
                                <li key={change.label}>
                                  <strong>{change.label}:</strong> "{change.before}" → "{change.after}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))] last:border-0">
                          <div>
                            <p className="font-medium text-sm text-[hsl(var(--foreground))] capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Receive {key} notifications</p>
                          </div>
                          <button
                            onClick={() => toggleNotification(key as keyof typeof notifications)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${value ? 'bg-[hsl(var(--cp-blue))]' : 'bg-[hsl(var(--muted))]'}`}
                            role="switch"
                            aria-checked={value}
                            type="button"
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => toast.success('Notification preferences saved!')} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200">
                      <Save size={16} /> Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Privacy Controls</h2>
                    <div className="space-y-4">
                      {Object.entries(privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))] last:border-0">
                          <div>
                            <p className="font-medium text-sm text-[hsl(var(--foreground))] capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Control your {key.replace(/([A-Z])/g, ' $1').toLowerCase()} visibility</p>
                          </div>
                          <button
                            onClick={() => togglePrivacy(key as keyof typeof privacy)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${value ? 'bg-[hsl(var(--cp-blue))]' : 'bg-[hsl(var(--muted))]'}`}
                            role="switch"
                            aria-checked={value}
                            type="button"
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => toast.success('Privacy settings saved!')} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200">
                      <Save size={16} /> Save Settings
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Payment Methods</h2>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-4 p-4 border border-[hsl(var(--border))] rounded-xl">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-[hsl(var(--foreground))]">•••• •••• •••• 4242</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Expires 12/27</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded-full font-medium">Default</span>
                      </div>
                    </div>
                    <button onClick={() => toast.info('To enable payment functionality, please continue with the Stripe setup in follow-up steps.')} className="flex items-center gap-2 px-6 py-3 rounded-full border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-all duration-200">
                      + Add Payment Method
                    </button>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">To enable payment functionality, please continue with the Stripe setup in follow-up steps.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'connected' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Connected Accounts</h2>
                    <div className="space-y-4">
                      {connectedAccounts.map((acc) => (
                        <div key={acc.name} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{acc.icon}</span>
                            <div>
                              <p className="font-medium text-sm text-[hsl(var(--foreground))]">{acc.name}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{acc.connected ? acc.profileUrl : `Not connected — ${acc.username}`}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleAccount(acc.name)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${acc.connected ? 'border border-rose-400/40 text-rose-500 hover:bg-rose-500/10' : 'bg-[hsl(var(--cp-blue))]/10 text-[hsl(var(--cp-blue))] hover:bg-[hsl(var(--cp-blue))]/20'}`}
                            type="button"
                          >
                            {acc.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'verification' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                    <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Verification Status</h2>
                    <div className="space-y-4">
                      {[
                        { label: 'Identity (Aadhaar/Passport)', status: 'verified', desc: 'Verified on Jan 5, 2026' },
                        { label: 'Professional Degree', status: 'verified', desc: 'B.Tech Computer Science' },
                        { label: 'Work Experience', status: 'pending', desc: 'Under review — submitted Jan 10' },
                        { label: 'Certifications', status: 'not_submitted', desc: 'Upload your certificates' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] rounded-xl">
                          <div className="flex items-center gap-3">
                            <BadgeCheck
                              size={20}
                              className={
                                item.status === 'verified'
                                  ? 'text-[hsl(var(--cp-blue))]'
                                  : item.status === 'pending'
                                    ? 'text-amber-500'
                                    : 'text-[hsl(var(--muted-foreground))]'
                              }
                            />
                            <div>
                              <p className="font-medium text-sm text-[hsl(var(--foreground))]">{item.label}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : item.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                            }`}
                          >
                            {item.status === 'verified' ? 'Verified' : item.status === 'pending' ? 'Pending' : 'Upload'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => toast.info('Document upload coming soon!')} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200" type="button">
                      Upload Documents
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function watchAvatar(profile: ProfileFormData | null | undefined) {
  return profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face';
}

export default Settings;

