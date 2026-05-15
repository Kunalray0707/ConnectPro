import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { ShieldCheck, Github, Chrome, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PhoneOtpLogin from '../components/PhoneOtpLogin';

interface LoginProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMode?: boolean;
  toggleMobileMode?: () => void;
}

const Login: React.FC<LoginProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { signIn, signUp, socialSignIn } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('Client');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await signIn(email || phone, password);
    if (!user) {
      toast.error('Sign in failed. Please check your email, phone, or password.');
      return;
    }
    toast.success('Login successful');
    navigate(user.isAdmin ? '/admin' : '/dashboard');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      toast.error('Please add an email or phone number.');
      return;
    }
    if (!password || password.length < 5) {
      toast.error('Password must be at least 5 characters long.');
      return;
    }
    const user = await signUp({
      name: name || 'New User',
      email: email || `user-${Date.now()}@example.com`,
      password,
      phone,
      location: location || 'India',
      role,
    });
    if (!user) {
      toast.error('An account already exists with this email or phone.');
      return;
    }
    toast.success('Signup complete. Welcome!');
    navigate('/discover');
  };

  const handleSocialLogin = async (provider: 'Google' | 'GitHub' | 'Phone') => {
    await socialSignIn(provider);
    toast.success(`Signed in with ${provider}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-10 shadow-sm">
            <div className="mb-8 text-center">
              <ShieldCheck size={42} className="mx-auto text-[hsl(var(--cp-blue))] mb-4" />
              <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">
                {mode === 'signin' ? 'Welcome Back' : 'Create your account'}
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-3">
                {mode === 'signin'
                  ? 'Sign in to access your ConnectPro dashboard and discover professionals.'
                  : 'Sign up to build your profile and connect with professionals near you.'}
              </p>
            </div>

            <div className="grid gap-3 mb-8 sm:grid-cols-2">
              <button
                onClick={() => setMode('signin')}
                className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  mode === 'signin' ? 'bg-[hsl(var(--cp-blue))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  mode === 'signup' ? 'bg-[hsl(var(--cp-blue))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="grid gap-3 mb-8 sm:grid-cols-3">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                <Chrome size={18} /> Google
              </button>
              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                <Github size={18} /> GitHub
              </button>
              <button
                onClick={() => setMode('signin')}
                className="flex items-center justify-center gap-2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                <Phone size={18} /> Phone
              </button>
            </div>

            <div className="space-y-5">
              {mode === 'signin' && (
                <PhoneOtpLogin
                  onVerified={() => {
                    toast.success('Signed in');
                    navigate('/dashboard');
                  }}
                  onCancel={() => setMode('signin')}
                />
              )}

              <form
                onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
                className="space-y-5"
              >
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                    />
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, India"
                        className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Client, Professional, Recruiter"
                        className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                  />
                </div>

                {mode !== 'signin' && (
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200"
                  >
                    Create account
                  </button>
                )}
              </form>
            </div>

            <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
              {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-[hsl(var(--cp-blue))] hover:underline">
                {mode === 'signin' ? 'Create your account' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
