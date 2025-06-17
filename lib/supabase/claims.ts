import { getSupabaseClient, isSupabaseConfigured } from "./client"
import type { User } from "@supabase/supabase-js"

export interface ClaimData {
  dateReceived: Date
  corporateName: string
  employeeName: string
  employeeId?: string
  claimAmount: number
  claimType: string
  reimbursementMethod: string
  currentStatus: string // Changed from status to currentStatus
  notes?: string
  files: File[]
}

export interface ClaimRecord {
  id: string
  created_at: string
  updated_at: string
  date_received: string
  corporate_name: string
  employee_name: string
  employee_id?: string
  claim_amount: number
  claim_type: string
  reimbursement_method: string
  current_status: string // Changed from status to current_status
  file_urls: string[]
  notes?: string
  user_id: string
}

export async function uploadClaimFiles(files: File[], claimId: string): Promise<string[]> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error("Storage service is not available. Please check your configuration.")
  }

  const uploadedUrls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split(".").pop()
    const fileName = `${claimId}/${Date.now()}-${i}.${fileExt}`

    const { data, error } = await supabase.storage.from("claim-documents").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw new Error(`Failed to upload file ${file.name}: ${error.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("claim-documents").getPublicUrl(data.path)

    uploadedUrls.push(urlData.publicUrl)
  }

  return uploadedUrls
}

export async function submitClaim(
  claimData: ClaimData,
  user: User,
): Promise<{ success: boolean; claimId?: string; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Database service is not available. Please check your configuration.")
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      throw new Error("Database service is not available. Please check your configuration.")
    }

    // First, insert the claim record without file URLs
    const { data: claim, error: insertError } = await supabase
      .from("claims")
      .insert({
        date_received: claimData.dateReceived.toISOString().split("T")[0],
        corporate_name: claimData.corporateName,
        employee_name: claimData.employeeName,
        employee_id: claimData.employeeId || null,
        claim_amount: claimData.claimAmount,
        claim_type: claimData.claimType,
        reimbursement_method: claimData.reimbursementMethod,
        current_status: claimData.currentStatus, // Changed from status to current_status
        notes: claimData.notes || null,
        user_id: user.id,
        file_urls: [],
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to insert claim: ${insertError.message}`)
    }

    let fileUrls: string[] = []

    // Upload files if any
    if (claimData.files.length > 0) {
      try {
        fileUrls = await uploadClaimFiles(claimData.files, claim.id)

        // Update the claim record with file URLs
        const { error: updateError } = await supabase.from("claims").update({ file_urls: fileUrls }).eq("id", claim.id)

        if (updateError) {
          throw new Error(`Failed to update claim with file URLs: ${updateError.message}`)
        }
      } catch (fileError) {
        // If file upload fails, we should still keep the claim but log the error
        console.error("File upload failed:", fileError)
        // Optionally, you might want to delete the claim record if file upload is critical
        // For now, we'll keep the claim and return a partial success
      }
    }

    return {
      success: true,
      claimId: claim.id,
    }
  } catch (error) {
    console.error("Error submitting claim:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getUserClaims(user: User): Promise<{ claims: ClaimRecord[]; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      // Return empty claims array if Supabase is not configured
      return { claims: [] }
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return { claims: [] }
    }

    const { data: claims, error } = await supabase
      .from("claims")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`)
    }

    return { claims: claims || [] }
  } catch (error) {
    console.error("Error fetching claims:", error)
    return {
      claims: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
