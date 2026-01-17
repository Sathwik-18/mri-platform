'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'patient' | 'doctor' | 'radiologist' | 'admin';
  phone?: string;
  account_status: 'active' | 'inactive' | 'suspended';
  roleProfile?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = async (currentUser: User) => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Fetch role-specific profile
      let roleProfile = null;
      const role = profile.role;

      if (role === 'patient') {
        const { data } = await supabase
          .from('patient_profiles')
          .select(`
            *,
            blood_groups (blood_group)
          `)
          .eq('user_id', currentUser.id)
          .single();
        roleProfile = data;
      } else if (role === 'doctor') {
        const { data } = await supabase
          .from('doctor_profiles')
          .select(`
            *,
            qualifications (qualification_name),
            hospitals (name, city)
          `)
          .eq('user_id', currentUser.id)
          .single();
        roleProfile = data;
      } else if (role === 'radiologist') {
        const { data } = await supabase
          .from('radiologist_profiles')
          .select(`
            *,
            qualifications (qualification_name),
            hospitals (name, city)
          `)
          .eq('user_id', currentUser.id)
          .single();
        roleProfile = data;
      } else if (role === 'admin') {
        const { data } = await supabase
          .from('admin_profiles')
          .select(`
            *,
            hospitals (name, city)
          `)
          .eq('user_id', currentUser.id)
          .single();
        roleProfile = data;
      }

      setUserProfile({ ...profile, roleProfile });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout - setting loading to false');
          setLoading(false);
        }, 5000); // 5 second timeout

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all state
      setUser(null);
      setUserProfile(null);
      setSession(null);

      // Force redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  // Don't block rendering with loading screen - let pages handle their own loading states

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        session,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
