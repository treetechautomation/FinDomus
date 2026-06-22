'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { bootstrapCurrentUser } from '@/lib/onboarding/bootstrap-client';
import { UserProfile, getUserProfile } from '@/services/firestore/users';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrappedUidRef = useRef<string | null>(null);

  const fetchProfile = async (uid: string) => {
    try {
      const p = await getUserProfile(uid);
      setProfile(p);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (bootstrappedUidRef.current !== currentUser.uid) {
          bootstrappedUidRef.current = currentUser.uid;
          setLoading(true);
          try {
            await bootstrapCurrentUser(currentUser);
            await fetchProfile(currentUser.uid);
          } catch (error) {
            console.error('Failed to bootstrap onboarding for user:', error);
          } finally {
            setUser(currentUser);
            setLoading(false);
          }
        } else {
          setUser(currentUser);
          setLoading(false);
        }
      } else {
        bootstrappedUidRef.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
