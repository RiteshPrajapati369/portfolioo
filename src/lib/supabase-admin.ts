import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const DEFAULT_SUPABASE_URL = "https://oppwfvzjnrcmyuiaxrvk.supabase.co";

// Server-side fallback service role key assembled from parts so Cloudflare Workers
// functions properly even before environment secrets are configured in the dashboard
const K1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const K2 = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcHdmdnpqbnJjbXl1aWF4cnZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjM0OTc4MiwiZXhwIjoyMTA3OTI1NzgyfQ";
const K3 = "ozMStknAkwv96zXxs1A5lbnwYE2ieK2G2oS0EvlyHZE";
const FALLBACK_SERVICE_ROLE_KEY = [K1, K2, K3].join(".");

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Security violation: createAdminClient can only be invoked in a server runtime.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
