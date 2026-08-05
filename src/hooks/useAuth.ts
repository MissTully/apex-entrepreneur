import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { PRE_SURVEY_TYPES } from '../lib/surveys';

export interface AuthState {
      user: User | null;
      session: Session | null;
      loading: boolean;
      hasProfile: boolean;
      hasSurvey: boolean;
}

export function useAuth(): AuthState {
      const [user, setUser] = useState<User | null>(null);
      const [session, setSession] = useState<Session | null>(null);
      const [loading, setLoading] = useState(true);
      const [hasProfile, setHasProfile] = useState(false);
      const [hasSurvey, setHasSurvey] = useState(false);

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
  }, []);

  async function checkOnboarding(userId: string) {
          const [{ data: profile }, { data: survey }] = await Promise.all([
                    supabase.from('profiles').select('full_name').eq('id', userId).single(),
                    supabase.from('survey_responses').select('id').eq('user_id', userId).in('survey_type', PRE_SURVEY_TYPES).limit(1),
                  ]);
          setHasProfile(!!(profile?.full_name));
          // hasSurvey is true only if the pre-program survey has been completed
        setHasSurvey(!!(survey && survey.length > 0));
          setLoading(false);
  }

  return { user, session, loading, hasProfile, hasSurvey };
}
