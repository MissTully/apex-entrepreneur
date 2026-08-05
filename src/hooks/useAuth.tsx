import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { PRE_SURVEY_TYPES } from '../lib/surveys';

export interface AuthState {
      user: User | null;
      session: Session | null;
      loading: boolean;
      hasProfile: boolean;
      hasSurvey: boolean;
      refresh: () => Promise<void>;
}

// Auth state lives in a single context so every consumer (Navbar,
// ProtectedRoute, pages) sees the same values. Each component holding its own
// copy caused stale state: after submitting the onboarding survey, the
// Navbar's snapshot still had hasSurvey=false and its CTA looped users back
// to /onboarding.
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
      const [user, setUser] = useState<User | null>(null);
      const [session, setSession] = useState<Session | null>(null);
      const [loading, setLoading] = useState(true);
      const [hasProfile, setHasProfile] = useState(false);
      const [hasSurvey, setHasSurvey] = useState(false);

      const checkOnboarding = useCallback(async (userId: string) => {
              const [{ data: profile }, { data: survey }] = await Promise.all([
                        supabase.from('profiles').select('full_name').eq('id', userId).single(),
                        supabase.from('survey_responses').select('id').eq('user_id', userId).in('survey_type', PRE_SURVEY_TYPES).limit(1),
                      ]);
              setHasProfile(!!(profile?.full_name));
              // hasSurvey is true only if the pre-program survey has been completed
              setHasSurvey(!!(survey && survey.length > 0));
              setLoading(false);
      }, []);

  useEffect(() => {
          // Handle magic link token in URL hash (PKCE or implicit flow)
                supabase.auth.getSession().then(({ data: { session } }) => {
                          setSession(session);
                          setUser(session?.user ?? null);
                          if (session?.user) checkOnboarding(session.user.id);
                          else setLoading(false);
                });

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                          setSession(session);
                          setUser(session?.user ?? null);
                          if (session?.user) checkOnboarding(session.user.id);
                          else { setHasProfile(false); setHasSurvey(false); setLoading(false); }
                });

                return () => subscription.unsubscribe();
  }, [checkOnboarding]);

      // Re-query profile/survey completion — call after saving either one so
      // the whole app picks up the new state immediately.
      const refresh = useCallback(async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) await checkOnboarding(session.user.id);
      }, [checkOnboarding]);

      return (
            <AuthContext.Provider value={{ user, session, loading, hasProfile, hasSurvey, refresh }}>
                  {children}
            </AuthContext.Provider>
          );
}

export function useAuth(): AuthState {
      const ctx = useContext(AuthContext);
      if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
      return ctx;
}
