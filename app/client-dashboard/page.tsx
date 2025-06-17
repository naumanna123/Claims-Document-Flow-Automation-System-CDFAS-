"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientClaimsTable } from "@/components/client-claims-table"
import { ClientDashboardStats } from "@/components/client-dashboard-stats"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

export default function ClientDashboardPage() {
  const searchParams = useSearchParams()
  const [corporateId, setCorporateId] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = searchParams.get("corporateId")
    if (id) {
      setCorporateId(decodeURIComponent(id))
    }
  }, [searchParams])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!corporateId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Missing Corporate ID</p>
                <p className="text-sm">Please provide a corporate ID in the URL. For example:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">/client-dashboard?corporateId=acme-corp</code>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <ClientDashboardStats corporateId={corporateId} refreshTrigger={refreshTrigger} />

        {/* Claims Table */}
        <ClientClaimsTable corporateId={corporateId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
