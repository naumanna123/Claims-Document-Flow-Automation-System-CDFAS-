import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if environment variables are available
const hasValidConfig = supabaseUrl && supabaseAnonKey

// Only create client if we have the required environment variables
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Helper function to ensure client exists
export function getSupabaseClient() {
  if (!hasValidConfig) {
    console.warn("Supabase environment variables not configured. Running in development mode without authentication.")
    return null
  }

  if (!supabase) {
    throw new Error("Supabase client not initialized. Please check your environment variables.")
  }

  return supabase
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured() {
  return hasValidConfig && supabase !== null
}
