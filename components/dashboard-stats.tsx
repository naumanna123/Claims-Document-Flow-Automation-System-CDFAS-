"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { getUserClaims, type ClaimRecord } from "@/lib/supabase/claims"

interface DashboardStatsProps {
  refreshTrigger?: number
}

export function DashboardStats({ refreshTrigger = 0 }: DashboardStatsProps) {
  const { user } = useAuth()
  const [claims, setClaims] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClaims = async () => {
      if (!user) return

      setLoading(true)
      try {
        const result = await getUserClaims(user)
        if (!result.error) {
          setClaims(result.claims)
        }
      } catch (err) {
        console.error("Error loading claims for stats:", err)
      } finally {
        setLoading(false)
      }
    }

    loadClaims()
  }, [user, refreshTrigger])

  const totalClaims = claims.length
  const activeClaims = claims.filter(
    (claim) => !["Cheque Delivered", "Approved by IGI"].includes(claim.current_status),
  ).length
  const totalAmount = claims.reduce((sum, claim) => sum + claim.claim_amount, 0)
  const pendingReviews = claims.filter((claim) => claim.current_status === "Received from client").length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClaims}</div>
          <p className="text-xs text-muted-foreground">All submitted claims</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClaims}</div>
          <p className="text-xs text-muted-foreground">Currently in progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <p className="text-xs text-muted-foreground">Sum of all claims</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingReviews}</div>
          <p className="text-xs text-muted-foreground">Awaiting initial review</p>
        </CardContent>
      </Card>
    </div>
  )
}
