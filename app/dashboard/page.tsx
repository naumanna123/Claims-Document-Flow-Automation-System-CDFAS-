"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ClaimsTable } from "@/components/claims-table"
import { DashboardStats } from "@/components/dashboard-stats"
import { Plus, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your insurance claims</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/claims/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats refreshTrigger={refreshTrigger} />

      {/* Claims Table */}
      <ClaimsTable refreshTrigger={refreshTrigger} />
    </div>
  )
}
