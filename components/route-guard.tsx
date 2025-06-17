"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { isSupabaseConfigured } from "@/lib/supabase/client"

interface RouteGuardProps {
  children: React.ReactNode
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/"]

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // If Supabase is not configured, allow access to all routes
      if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Allowing access to all routes.")
        setIsAuthorized(true)
        return
      }

      // If still loading, don't make any decisions yet
      if (loading) {
        return
      }

      const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.push("/login")
        return
      }

      if (user && (pathname === "/login" || pathname === "/signup")) {
        // User is authenticated but trying to access login/signup
        router.push("/dashboard")
        return
      }

      if (pathname === "/") {
        // Root path should redirect to appropriate page
        if (user) {
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
        return
      }

      // User is authorized to view this route
      setIsAuthorized(true)
    }

    checkAuth()
  }, [user, loading, pathname, router])

  // Show loading spinner while checking authentication
  if (loading || (!isAuthorized && isSupabaseConfigured())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
