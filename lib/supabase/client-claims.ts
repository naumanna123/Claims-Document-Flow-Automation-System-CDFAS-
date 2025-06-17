import { getSupabaseClient, isSupabaseConfigured } from "./client"
import type { ClaimRecord } from "./claims"

export interface ClientClaimRecord extends Omit<ClaimRecord, "user_id"> {
  // Remove user_id from the client-facing interface for security
}

export async function getClaimsByCorporateId(corporateId: string): Promise<{
  claims: ClientClaimRecord[]
  corporateName?: string
  error?: string
}> {
  try {
    if (!isSupabaseConfigured()) {
      return { claims: [] }
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return { claims: [] }
    }

    // First, get the corporate name from the first claim (if any)
    const { data: claims, error } = await supabase
      .from("claims")
      .select(`
        id,
        created_at,
        updated_at,
        date_received,
        corporate_name,
        employee_name,
        employee_id,
        claim_amount,
        claim_type,
        reimbursement_method,
        current_status,
        file_urls,
        notes
      `)
      .eq("corporate_name", corporateId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`)
    }

    const corporateName = claims && claims.length > 0 ? claims[0].corporate_name : corporateId

    return {
      claims: claims || [],
      corporateName,
    }
  } catch (error) {
    console.error("Error fetching client claims:", error)
    return {
      claims: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getClaimsByCorporateValue(corporateValue: string): Promise<{
  claims: ClientClaimRecord[]
  corporateName?: string
  error?: string
}> {
  try {
    if (!isSupabaseConfigured()) {
      return { claims: [] }
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return { claims: [] }
    }

    // Search by the corporate value (could be the label from combobox)
    const { data: claims, error } = await supabase
      .from("claims")
      .select(`
        id,
        created_at,
        updated_at,
        date_received,
        corporate_name,
        employee_name,
        employee_id,
        claim_amount,
        claim_type,
        reimbursement_method,
        current_status,
        file_urls,
        notes
      `)
      .ilike("corporate_name", `%${corporateValue}%`)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`)
    }

    const corporateName = claims && claims.length > 0 ? claims[0].corporate_name : corporateValue

    return {
      claims: claims || [],
      corporateName,
    }
  } catch (error) {
    console.error("Error fetching client claims:", error)
    return {
      claims: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
