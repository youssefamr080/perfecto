import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Ensure a single browser client instance (avoids multiple GoTrueClient warnings)
// HMR in Next.js can evaluate modules multiple times; cache on globalThis
type SBClient = ReturnType<typeof createTypedClient>
declare const globalThis: {
  __SB?: SBClient
} & typeof global

function createTypedClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
function createBrowserClient(): SBClient {
  return createTypedClient()
}

let browserClient: SBClient
if (typeof window !== "undefined") {
  browserClient = globalThis.__SB ?? createBrowserClient()
  globalThis.__SB = browserClient
} else {
  // On the server we can safely create a new anon client per request scope
  browserClient = createBrowserClient()
}

export const supabase = browserClient

// Server-only helper to get a client with the Service Role key when available.
// Use this ONLY in server environments (API routes, edge functions). Never expose this key to the client.
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    // Fallback to anon client if service role key isn't configured (e.g., local dev).
    // Suppress warning in development to reduce console noise
    return supabase
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Deprecated: keep export for compatibility, but internally use service client when possible.
export const supabaseAdmin = getServiceSupabase()

// Client-side accessor (returns the singleton above)
export const getSupabaseClient = () => supabase
