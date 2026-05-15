import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser client — use in client components */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

/** Check if Supabase is configured */
export const isSupabaseConfigured = !!(  
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
