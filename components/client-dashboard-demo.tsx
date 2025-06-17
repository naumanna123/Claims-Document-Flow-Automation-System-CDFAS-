"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Building2 } from "lucide-react"

// Sample corporate names that match the ones in the claim form
const sampleCorporates = [
  { id: "acme-corp", name: "Acme Corporation" },
  { id: "tech-solutions", name: "Tech Solutions Ltd" },
  { id: "global-industries", name: "Global Industries Inc" },
  { id: "innovative-systems", name: "Innovative Systems" },
  { id: "premier-services", name: "Premier Services Group" },
  { id: "dynamic-enterprises", name: "Dynamic Enterprises" },
  { id: "strategic-partners", name: "Strategic Partners LLC" },
  { id: "excellence-group", name: "Excellence Group" },
]

export function ClientDashboardDemo() {
  const [customCorporateId, setCustomCorporateId] = useState("")

  const handleViewDashboard = (corporateId: string) => {
    const url = `/client-dashboard?corporateId=${encodeURIComponent(corporateId)}`
    window.open(url, "_blank")
  }

  const handleCustomDashboard = () => {
    if (customCorporateId.trim()) {
      handleViewDashboard(customCorporateId.trim())
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Client Dashboard Demo</h1>
        <p className="text-muted-foreground">Test the client dashboard with different corporate IDs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sample Corporate Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Sample Corporate Dashboards
            </CardTitle>
            <CardDescription>Click on any corporate name to view their claims dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleCorporates.map((corporate) => (
              <Button
                key={corporate.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleViewDashboard(corporate.id)}
              >
                <span>{corporate.name}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Custom Corporate ID */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Corporate ID</CardTitle>
            <CardDescription>Enter a custom corporate ID to view its dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-id">Corporate ID</Label>
              <Input
                id="custom-id"
                value={customCorporateId}
                onChange={(e) => setCustomCorporateId(e.target.value)}
                placeholder="Enter corporate ID..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCustomDashboard()
                  }
                }}
              />
            </div>
            <Button onClick={handleCustomDashboard} className="w-full" disabled={!customCorporateId.trim()}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Examples:</strong>
              </p>
              <p>• acme-corp</p>
              <p>• Acme Corporation</p>
              <p>• tech-solutions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• The client dashboard filters claims by corporate name/ID</p>
          <p>• It supports both exact matches and partial text searches</p>
          <p>• The dashboard is completely read-only with no edit/delete options</p>
          <p>• Document viewing and downloading functionality is preserved</p>
          <p>
            • URL format: <code>/client-dashboard?corporateId=CORPORATE_ID</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
