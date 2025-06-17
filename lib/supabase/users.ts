import { getSupabaseClient, isSupabaseConfigured } from "./client"
import type { User } from "@supabase/supabase-js"

export interface UserWithRole {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
  }
  role?: string
}

export interface UserRole {
  id: string
  user_id: string
  role: string
  created_at: string
  updated_at: string
}

export async function getAllUsers(): Promise<{ users: UserWithRole[]; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { users: [] }
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return { users: [] }
    }

    // Note: In a real application, you would need to use Supabase Admin API
    // or create a server-side function to fetch all users from auth.users
    // For now, we'll fetch from a custom view or use RPC function

    const { data, error } = await supabase.rpc("get_all_users_with_roles")

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return { users: data || [] }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function inviteUser(email: string, role = "user"): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("User management service is not available. Please check your configuration.")
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("User management service is not available.")
    }

    // Invite user using Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
      },
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      throw new Error(`Failed to invite user: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error inviting user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateUserRole(userId: string, newRole: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("User management service is not available.")
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("User management service is not available.")
    }

    const { error } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role: newRole,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getUserRole(userId: string): Promise<{ role: string; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { role: "user" }
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return { role: "user" }
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw new Error(`Failed to fetch user role: ${error.message}`)
    }

    return { role: data?.role || "user" }
  } catch (error) {
    console.error("Error fetching user role:", error)
    return {
      role: "user",
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function checkIsAdmin(user: User): Promise<boolean> {
  try {
    const { role } = await getUserRole(user.id)
    return role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
