import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseSecretConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  if (!hasSupabaseSecretConfig) {
    return null;
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
