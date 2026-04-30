import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";

  if (env.MODE === "development") {
    console.error(message);
  }

  throw new Error(message);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
