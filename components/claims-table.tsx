"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Search, Filter, FileText, Download, Eye, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { getUserClaims, type ClaimRecord } from "@/lib/supabase/claims"

const statusOptions = [
  "All Statuses",
  "Received from client",
  "Document scanned & uploaded",
  "Claim reviewed internally",
  "Sent to IGI",
  "Pending with IGI",
  "Approved by IGI",
  "Cheque Received",
  "Cheque Sent to Client",
  "Cheque Delivered",
]

const getStatusColor = (currentStatus: string) => {
  switch (currentStatus) {
    case "Received from client":
      return "bg-blue-100 text-blue-800"
    case "Document scanned & uploaded":
      return "bg-purple-100 text-purple-800"
    case "Claim reviewed internally":
      return "bg-yellow-100 text-yellow-800"
    case "Sent to IGI":
    case "Pending with IGI":
      return "bg-orange-100 text-orange-800"
    case "Approved by IGI":
      return "bg-green-100 text-green-800"
    case "Cheque Received":
    case "Cheque Sent to Client":
      return "bg-indigo-100 text-indigo-800"
    case "Cheque Delivered":
      return "bg-emerald-100 text-emerald-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

interface ClaimsTableProps {
  refreshTrigger?: number
}

export function ClaimsTable({ refreshTrigger = 0 }: ClaimsTableProps) {
  const { user } = useAuth()
  const [claims, setClaims] = useState<ClaimRecord[]>([])
  const [filteredClaims, setFilteredClaims] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")

  const loadClaims = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const result = await getUserClaims(user)
      if (result.error) {
        setError(result.error)
      } else {
        setClaims(result.claims)
        setFilteredClaims(result.claims)
      }
    } catch (err) {
      setError("Failed to load claims. Please try again.")
      console.error("Error loading claims:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [user, refreshTrigger])

  useEffect(() => {
    let filtered = claims

    // Filter by search term (employee name)
    if (searchTerm.trim()) {
      filtered = filtered.filter((claim) => claim.employee_name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    }

    // Filter by status
    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter((claim) => claim.current_status === statusFilter)
    }

    setFilteredClaims(filtered)
  }, [claims, searchTerm, statusFilter])

  const handleViewDocument = (url: string, filename?: string) => {
    window.open(url, "_blank")
  }

  const handleDownloadDocument = (url: string, filename?: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename || "document"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims Overview</CardTitle>
          <CardDescription>Loading your submitted claims...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims Overview</CardTitle>
        <CardDescription>View and manage all your submitted insurance claims</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Search by employee name
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredClaims.length} of {claims.length} claims
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "All Statuses" && ` with status "${statusFilter}"`}
          </p>
        </div>

        {/* Claims Table */}
        {filteredClaims.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {claims.length === 0
                ? "You haven't submitted any claims yet."
                : "No claims match your current search criteria."}
            </p>
            {claims.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => (window.location.href = "/claims/new")}>Submit Your First Claim</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Corporate Name</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Claim Amount</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>View Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-sm">{claim.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{claim.corporate_name}</TableCell>
                    <TableCell>{claim.employee_name}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(claim.claim_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(claim.current_status)} variant="secondary">
                        {claim.current_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(claim.date_received)}</TableCell>
                    <TableCell>
                      {claim.file_urls && claim.file_urls.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              {claim.file_urls.length} file{claim.file_urls.length !== 1 ? "s" : ""}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {claim.file_urls.map((url, index) => {
                              const filename = url.split("/").pop() || `Document ${index + 1}`
                              const displayName = filename.includes("-")
                                ? filename.split("-").slice(1).join("-")
                                : filename

                              return (
                                <div key={index} className="px-2 py-1">
                                  <div className="text-xs font-medium text-gray-700 mb-1">{displayName}</div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleViewDocument(url, displayName)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleDownloadDocument(url, displayName)}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => window.open(url, "_blank")}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Open
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-sm text-gray-500">No documents</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
