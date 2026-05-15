import React, { useState, useEffect, Suspense, lazy } from 'react';
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

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

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