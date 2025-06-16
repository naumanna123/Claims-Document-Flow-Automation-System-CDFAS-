"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { getCurrentUser, onAuthStateChange } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    // Get initial user
    getCurrentUser()
      .then((user) => {
        setUser(user)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error getting current user:", error)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = onAuthStateChange((user) => {
        setUser(user)
        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
