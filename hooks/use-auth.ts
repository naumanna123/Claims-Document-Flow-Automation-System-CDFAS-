"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { getCurrentUser, onAuthStateChange } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    let mounted = true

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured. Running in development mode.")
      if (mounted) {
        setUser(null)
        setLoading(false)
      }
      return
    }

    // Get initial user
    getCurrentUser()
      .then((user) => {
        if (mounted) {
          setUser(user)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error("Error getting current user:", error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      })

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = onAuthStateChange((user) => {
        if (mounted) {
          setUser(user)
          setLoading(false)
        }
      })

      return () => {
        mounted = false
        if (subscription && typeof subscription.unsubscribe === "function") {
          subscription.unsubscribe()
        }
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      if (mounted) {
        setLoading(false)
      }
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
