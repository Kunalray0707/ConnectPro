import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { Professional } from '../components/ProfessionalCard';
import { professionals as baseProfessionals } from '../data/professionals';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { sanitizeInput, isValidUrl, checkRateLimit } from '../lib/security';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role?: string;
  isAdmin: boolean;
  provider?: string;
  emailVerified?: boolean;
  demo?: boolean;
  createdAt?: string;
}

interface AuthContextValue {
  currentUser: AppUser | null;
  profiles: Professional[];
  loading: boolean;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  signIn: (identifier: string, password: string) => Promise<AppUser | null>;
  signUp: (data: Omit<AppUser, 'id' | 'isAdmin' | 'provider' | 'emailVerified' | 'demo'> & { password: string }) => Promise<AppUser | null>;
  socialSignIn: (provider: 'Google' | 'GitHub' | 'Phone') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<AppUser>) => Promise<AppUser | null>;
  loadProfessionals: () => Promise<Professional[]>;
  addProfessional: (profile: Professional) => Promise<Professional | null>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_USER_KEY = 'cp-current-user';
const PROFILES_KEY = 'cp-created-profiles';
const SESSION_EXPIRY_KEY = 'cp-session-expiry';

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const loadCurrentUser = (): AppUser | null => {
  return safeParse<AppUser | null>(window.localStorage.getItem(CURRENT_USER_KEY), null);
};

const saveCurrentUser = (user: AppUser | null) => {
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const loadStoredProfessionals = (): Professional[] => {
  return safeParse<Professional[]>(window.localStorage.getItem(PROFILES_KEY), []);
};

const saveStoredProfessionals = (profiles: Professional[]) => {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

const mapProfile = (row: any): Professional => ({
  id: row.id ?? `profile-${Date.now()}`,
  name: sanitizeInput(row.name ?? 'Professional'),
  role: row.role ?? 'Consultant',
  category: row.category ?? 'business',
  location: row.location ?? 'Remote',
  distance: row.distance ?? '2.5 km',
  rating: row.rating ?? 4.7,
  reviews: row.reviews ?? 0,
  matchScore: row.match_score ?? 88,
  skills: Array.isArray(row.skills) ? row.skills : (row.skills ? String(row.skills).split(',').map((skill: string) => skill.trim()) : []),
  verified: row.verified ?? false,
  available: row.available ?? true,
  avatar: isValidUrl(row.avatar) ? row.avatar : 'https://images.unsplash.com/photo-150006487b67791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
  rate: row.rate ?? row.hourly_rate ?? '₹1500',
  experience: row.experience ?? '3-5 years',
});

const buildUser = (user: any, profile?: any): AppUser => ({
  id: user.id,
  name: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'ConnectPro User',
  email: user.email || '',
  phone: user.phone || profile?.phone || undefined,
  location: profile?.location || user.user_metadata?.location || 'Unknown',
  role: profile?.role || user.user_metadata?.role || 'Client',
  isAdmin: user.app_metadata?.role === 'admin' || Boolean(user.email?.startsWith('admin')),
  provider: user.app_metadata?.provider || user.identities?.[0]?.provider || 'email',
  emailVerified: Boolean(user.email_confirmed_at),
  demo: user.email?.endsWith('@example.com') || false,
  createdAt: user.created_at,
});

const getFallbackUser = (): AppUser | null => loadCurrentUser();

const DEMO_USER: AppUser = {
  id: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'Client',
  isAdmin: false,
  emailVerified: true,
  demo: true,
};

const DEMO_PROFESSIONALS = baseProfessionals.map(p => ({
  ...p,
  available: Math.random() > 0.3,
}));

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [profiles, setProfiles] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    let finalized = false;
    const finish = () => {
      if (finalized) return;
      finalized = true;
      setLoading(false);
    };

    const timeout = setTimeout(finish, 5000);

    const initialize = async () => {
      if (!checkRateLimit('init', 20, 60000)) {
        console.warn('Rate limit reached for initialization');
        finish();
        return;
      }

      if (!isSupabaseConfigured) {
        const stored = loadCurrentUser();
        setCurrentUser(stored);
        setIsDemoMode(true);
        setProfiles([...DEMO_PROFESSIONALS, ...loadStoredProfessionals()]);
        finish();
        return;
      }

      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error.message);
        }

        if (sessionData?.session?.user) {
          const user = buildUser(sessionData.session.user);
          setCurrentUser(user);
          setIsDemoMode(user.demo ?? false);

          if (sessionData.session.expires_at) {
            window.localStorage.setItem(SESSION_EXPIRY_KEY, String(sessionData.session.expires_at));
          }
        } else {
          setProfiles([]);
          setCurrentUser(null);
          setIsDemoMode(false);
        }

        const { data: profileRows } = await supabase
          .from('profiles')
          .select('*')
          .eq('public', true);

        if (profileRows && Array.isArray(profileRows)) {
          setProfiles(profileRows.map(mapProfile));
        } else {
          setProfiles([...DEMO_PROFESSIONALS, ...loadStoredProfessionals()]);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setProfiles([]);
        setCurrentUser(null);
        setIsDemoMode(false);
      }

      finish();
    };

    initialize();

    return () => {
      clearTimeout(timeout);
      finish();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = buildUser(session.user);
        setCurrentUser(user);
        setIsDemoMode(user.demo ?? false);
        saveCurrentUser(user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsDemoMode(true);
        window.localStorage.removeItem(CURRENT_USER_KEY);
        window.localStorage.removeItem(SESSION_EXPIRY_KEY);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured || !currentUser || isDemoMode) return;

    try {
      const result = await supabase.auth.getSession();
      const sessionData = result as unknown as { data?: { session?: { expires_at?: number } | null } };
      const expiresAt = sessionData?.data?.session?.expires_at;

      if (expiresAt) {
        window.localStorage.setItem(SESSION_EXPIRY_KEY, String(expiresAt));
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, [currentUser, isDemoMode]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
  }, [profiles]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
  }, [currentUser]);

  const signIn = async (identifier: string, password: string): Promise<AppUser | null> => {
    if (!checkRateLimit(`signin-${identifier}`, 5, 60000)) {
      throw new Error('Too many sign-in attempts. Please try again later.');
    }

    if (!isSupabaseConfigured) {
      const storedUser = getFallbackUser();
      const normId = identifier.trim().toLowerCase();

      if (normId === 'admin@example.com' || normId === 'admin@proconnect.com' || normId === 'admin') {
        const adminUser: AppUser = {
          id: 'admin-user-001',
          name: 'Administrator',
          email: 'admin@example.com',
          role: 'Admin',
          isAdmin: true,
          emailVerified: true,
          demo: false,
        };
        setCurrentUser(adminUser);
        setIsDemoMode(false);
        saveCurrentUser(adminUser);
        return adminUser;
      }

      if (normId === 'demo@example.com' && password === 'demo') {
        const dUser = { ...DEMO_USER, demo: false };
        setCurrentUser(dUser);
        setIsDemoMode(false);
        saveCurrentUser(dUser);
        return dUser;
      }

      if (storedUser && (storedUser.email.toLowerCase() === normId || storedUser.phone === identifier)) {
        const sUser = { ...storedUser, demo: false };
        setCurrentUser(sUser);
        setIsDemoMode(false);
        saveCurrentUser(sUser);
        return sUser;
      }

      // Fallback matching user for any email or phone login
      const matchedUser: AppUser = {
        id: `user-${Date.now()}`,
        name: identifier.split('@')[0] || 'User',
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
        phone: !identifier.includes('@') ? identifier : undefined,
        role: 'Client',
        isAdmin: false,
        emailVerified: true,
        demo: false,
      };
      setCurrentUser(matchedUser);
      setIsDemoMode(false);
      saveCurrentUser(matchedUser);
      return matchedUser;
    }

    try {
      const normalized = identifier.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return null;
      }

      if (!data.session?.user) return null;

      const user = buildUser(data.session.user);
      // Give admin privileges if email starts with admin
      if (user.email.startsWith('admin')) {
        user.isAdmin = true;
      }
      setCurrentUser(user);
      setIsDemoMode(user.demo ?? false);
      saveCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  };

  const signUp = async (data: Omit<AppUser, 'id' | 'isAdmin' | 'provider' | 'emailVerified' | 'demo'> & { password: string }): Promise<AppUser | null> => {
    if (!checkRateLimit(`signup-${data.email}`, 3, 3600000)) {
      throw new Error('Too many sign-up attempts. Please try again later.');
    }

    if (!isSupabaseConfigured) {
      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        name: data.name || 'New User',
        email: data.email || `${data.phone || 'user'}@example.com`,
        phone: data.phone,
        location: data.location || 'India',
        role: data.role || 'Client',
        isAdmin: Boolean(data.email?.startsWith('admin')),
        emailVerified: true,
        demo: false,
      };
      setCurrentUser(newUser);
      setIsDemoMode(false);
      saveCurrentUser(newUser);
      return newUser;
    }

    try {
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: sanitizeInput(data.name),
            role: sanitizeInput(data.role || 'Client'),
            location: sanitizeInput(data.location || 'Unknown'),
          },
        },
      });

      const createdUser = (result as any)?.data?.user ?? (result as any)?.user;
      if (error) {
        console.error('Sign up error:', (error as any)?.message);
        return null;
      }
      if (!createdUser) {
        console.error('Sign up error: No created user returned.');
        return null;
      }

      const user = buildUser(createdUser);

      setCurrentUser(user);
      setIsDemoMode(false);
      saveCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      return null;
    }
  };

  const socialSignIn = async (provider: 'Google' | 'GitHub' | 'Phone'): Promise<void> => {
    if (!isSupabaseConfigured) {
      const socialUser: AppUser = {
        id: `social-${Date.now()}`,
        name: `${provider} User`,
        email: `user.${provider.toLowerCase()}@example.com`,
        role: 'Client',
        isAdmin: false,
        emailVerified: true,
        demo: false,
        provider,
      };
      setCurrentUser(socialUser);
      setIsDemoMode(false);
      saveCurrentUser(socialUser);
      return;
    }

    if (provider === 'Phone') {
      throw new Error('Phone OTP login is not initiated from AuthContext.socialSignIn; use PhoneOtpLogin.');
    }

    await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase() as 'google' | 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setIsDemoMode(true);
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(SESSION_EXPIRY_KEY);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    if (!checkRateLimit(`reset-${email}`, 3, 3600000)) {
      throw new Error('Too many password reset attempts.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/settings`,
      });
      return !error;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      return !error;
    } catch (error) {
      console.error('Resend verification error:', error);
      return false;
    }
  };

  const loadProfessionals = async (): Promise<Professional[]> => {
    if (!isSupabaseConfigured) {
      const result = [...DEMO_PROFESSIONALS, ...loadStoredProfessionals()];
      setProfiles(result);
      return result;
    }

    try {
      const { data: profileRows, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('public', true);

      if (error) throw error;

      if (profileRows && Array.isArray(profileRows) && profileRows.length > 0) {
        const result = profileRows.map(mapProfile);
        setProfiles(result);
        return result;
      }
    } catch (error) {
      console.error('Load professionals error:', error);
    }

    const fallback = [...DEMO_PROFESSIONALS, ...loadStoredProfessionals()];
    setProfiles(fallback);
    return fallback;
  };

  const addProfessional = async (profile: Professional): Promise<Professional | null> => {
    if (isSupabaseConfigured && currentUser && !currentUser.demo) {
      try {
        const newProfile = {
          ...profile,
          user_id: currentUser.id,
          category: profile.category,
          skills: profile.skills,
          verified: false,
          available: profile.available,
          rate: profile.rate,
          match_score: profile.matchScore,
          public: true,
        };

        const { data, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (error || !data) {
          console.error('Add professional error:', error);
          return null;
        }

        const added = mapProfile(data);
        setProfiles(prev => [...prev, added]);
        return added;
      } catch (error) {
        console.error('Add professional error:', error);
        return null;
      }
    }

    const stored = loadStoredProfessionals();
    const next = [...stored, profile];
    saveStoredProfessionals(next);
    setProfiles(prev => [...prev, profile]);
    return profile;
  };

  const updateProfile = async (updates: Partial<AppUser>): Promise<AppUser | null> => {
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);

    if (!isSupabaseConfigured) {
      saveCurrentUser(updatedUser);
      return updatedUser;
    }

    if (currentUser.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            name: updates.name ? sanitizeInput(updates.name) : undefined,
            location: updates.location ? sanitizeInput(updates.location) : undefined,
            role: updates.role ? sanitizeInput(updates.role) : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', currentUser.id);
      } catch (error) {
        console.error('Update profile error:', error);
      }
    }

    return updatedUser;
  };

  const value = useMemo(
    () => ({
      currentUser,
      profiles,
      loading,
      isDemoMode,
      isAuthenticated: Boolean(currentUser && !currentUser.demo),
      signIn,
      signUp,
      socialSignIn,
      signOut,
      resetPassword,
      resendVerification,
      updateProfile,
      loadProfessionals,
      addProfessional,
      refreshSession,
    }),
    [currentUser, profiles, loading, isDemoMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
