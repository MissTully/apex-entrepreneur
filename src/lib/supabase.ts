import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Fail loudly (in the console) if the deploy is missing its env vars. Without
// these, every auth and data call dies with an opaque "Failed to fetch", so make
// the real cause obvious instead of letting it look like a network glitch.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase is not configured: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY ' +
      'are missing. Set them in your Vercel project (Settings → Environment Variables) ' +
      'and redeploy.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Lets magic-link and password-recovery links establish a session from the URL.
    detectSessionInUrl: true,
  },
});
