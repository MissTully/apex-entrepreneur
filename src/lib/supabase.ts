import { createClient } from '@supabase/supabase-js';

/**
 * The Supabase client.
 *
 * `createClient` throws on a missing URL or key, and it runs at module load —
 * so a deploy that forgot an environment variable rendered a completely blank
 * page with only "supabaseUrl is required" in the console. On launch day that
 * reads as "the site is down" rather than "one setting is missing."
 *
 * So: detect the misconfiguration, export it for <ConfigError/> to render, and
 * hand back a client pointed at a placeholder host. Every call fails, but the
 * app boots far enough to explain itself.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const missing = [
    !url?.trim() && 'VITE_SUPABASE_URL',
    !anonKey?.trim() && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean) as string[];

/** Names of the required env vars that weren't set at build time. Empty = fine. */
export const supabaseConfigError: string[] = missing;

export const supabase = createClient(
    url?.trim() || 'https://placeholder.supabase.co',
    anonKey?.trim() || 'placeholder-anon-key',
);
