import { getSupabaseClient } from "./supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      throw error
    }

    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function signOut() {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  try {
    const supabase = getSupabaseClient()
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  } catch (error) {
    console.error("Error setting up auth state change listener:", error)
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}
