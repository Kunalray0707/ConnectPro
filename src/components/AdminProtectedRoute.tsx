import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--cp-indigo))]/30 border-t-[hsl(var(--cp-indigo))] animate-spin" />
      </div>
    );
  }

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col justify-between">
        <Header theme="dark" toggleTheme={() => {}} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[hsl(var(--card))] border border-rose-500/20 rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Access Denied</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              You need Administrator privileges to access the ProConnect Admin Portal. Please log in with admin credentials.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:scale-105 transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                <ShieldAlert size={18} /> Log In as Administrator
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                <ArrowLeft size={18} /> Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
