import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAsDemo: () => Promise<{ error: any }>;
  signInAsGuest: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInAsDemo = async () => {
    // Try to sign in first, if fails then create the demo account
    let { error } = await supabase.auth.signInWithPassword({
      email: 'demo@hydrotrack.com',
      password: 'demo123456',
    });
    
    // If sign in fails, create the account
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'demo@hydrotrack.com',
        password: 'demo123456',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: 'Demo User'
          }
        }
      });
      
      if (!signUpError) {
        // After successful signup, sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'demo@hydrotrack.com',
          password: 'demo123456',
        });
        error = signInError;
      } else {
        error = signUpError;
      }
    }
    
    return { error };
  };

  const signInAsGuest = async () => {
    // Try to sign in first, if fails then create the guest account
    let { error } = await supabase.auth.signInWithPassword({
      email: 'guest@hydrotrack.com', 
      password: 'guest123456',
    });
    
    // If sign in fails, create the account
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'guest@hydrotrack.com',
        password: 'guest123456',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: 'Guest User'
          }
        }
      });
      
      if (!signUpError) {
        // After successful signup, sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'guest@hydrotrack.com',
          password: 'guest123456',
        });
        error = signInError;
      } else {
        error = signUpError;
      }
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInAsDemo,
    signInAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}