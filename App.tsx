import React, { useEffect, useState, Suspense, lazy } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles.css';

import SplashScreen from './src/components/SplashScreen';
import { AuthProvider } from './src/context/AuthContext';

const Home = lazy(() => import('./src/pages/Home'));
const Discover = lazy(() => import('./src/pages/Discover'));
const Marketplace = lazy(() => import('./src/pages/Marketplace'));
const Dashboard = lazy(() => import('./src/pages/Dashboard'));
const About = lazy(() => import('./src/pages/About'));
const Profile = lazy(() => import('./src/pages/Profile'));
const NotFound = lazy(() => import('./src/pages/NotFound'));
const Admin = lazy(() => import('./src/pages/Admin'));

const Matches = lazy(() => import('./src/pages/Matches'));
const PostService = lazy(() => import('./src/pages/PostService'));
const BookingNew = lazy(() => import('./src/pages/BookingNew'));
const SettingsProfile = lazy(() => import('./src/pages/SettingsProfile'));
const SettingsSecurity = lazy(() => import('./src/pages/SettingsSecurity'));
const SettingsNotifications = lazy(() => import('./src/pages/SettingsNotifications'));
const SettingsPrivacy = lazy(() => import('./src/pages/SettingsPrivacy'));
const SettingsAppearance = lazy(() => import('./src/pages/SettingsAppearance'));
const SettingsAccounts = lazy(() => import('./src/pages/SettingsAccounts'));

// Uses Settings page’s “verification” tab to support /verification
const Settings = lazy(() => import('./src/pages/Settings'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--cp-indigo))]/30 border-t-[hsl(var(--cp-indigo))] animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [splashDone, setSplashDone] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('cp-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('cp-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <AuthProvider>
      <Theme appearance={theme} radius="large" scaling="100%">
        {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/discover" element={<Discover theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/marketplace" element={<Marketplace theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/dashboard" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/about" element={<About theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/profile/:id" element={<Profile theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/admin" element={<Admin theme={theme} toggleTheme={toggleTheme} />} />

              {/* Required routes */}
              <Route path="/matches" element={<Matches theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/post-service" element={<PostService theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/bookings/new" element={<BookingNew theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/verification" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />

              {/* Existing settings routes */}
              <Route path="/settings/profile" element={<SettingsProfile theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings/security" element={<SettingsSecurity theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings/notifications" element={<SettingsNotifications theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings/privacy" element={<SettingsPrivacy theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings/appearance" element={<SettingsAppearance theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/settings/accounts" element={<SettingsAccounts theme={theme} toggleTheme={toggleTheme} />} />

              {/* Mount for /settings/* (backward compatible) */}
              <Route path="/settings/*" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme={theme}
          />
        </Router>
      </Theme>
    </AuthProvider>
  );
};

export default App;

