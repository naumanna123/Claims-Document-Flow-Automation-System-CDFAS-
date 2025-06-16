"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Combobox } from "@/components/ui/combobox"
import { FileUpload } from "@/components/file-upload"
import { cn } from "@/lib/utils"

// Sample corporate names for the combobox
const corporateNames = [
  { value: "acme-corp", label: "Acme Corporation" },
  { value: "tech-solutions", label: "Tech Solutions Ltd" },
  { value: "global-industries", label: "Global Industries Inc" },
  { value: "innovative-systems", label: "Innovative Systems" },
  { value: "premier-services", label: "Premier Services Group" },
  { value: "dynamic-enterprises", label: "Dynamic Enterprises" },
  { value: "strategic-partners", label: "Strategic Partners LLC" },
  { value: "excellence-group", label: "Excellence Group" },
]

const claimTypes = ["Dental", "Optical", "General Medical", "Maternity", "Surgery", "Hospitalization", "Other"]

const statusOptions = [
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

export default function NewClaimPage() {
  const [dateReceived, setDateReceived] = useState<Date>()
  const [corporateName, setCorporateName] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [claimAmount, setClaimAmount] = useState("")
  const [claimType, setClaimType] = useState("")
  const [reimbursementMethod, setReimbursementMethod] = useState("cheque")
  const [status, setStatus] = useState("Received from client")
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      dateReceived,
      corporateName,
      employeeName,
      employeeId,
      claimAmount: Number.parseFloat(claimAmount),
      claimType,
      reimbursementMethod,
      status,
      files,
      notes,
    }

    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">New Claim Submission</CardTitle>
          <CardDescription>Fill out the form below to submit a new insurance claim</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Received */}
              <div className="space-y-2">
                <Label htmlFor="date-received">Date Received *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateReceived && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateReceived ? format(dateReceived, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateReceived} onSelect={setDateReceived} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Corporate Name */}
              <div className="space-y-2">
                <Label htmlFor="corporate-name">Corporate Name *</Label>
                <Combobox
                  options={corporateNames}
                  value={corporateName}
                  onValueChange={setCorporateName}
                  placeholder="Search corporate name..."
                  emptyText="No corporate name found."
                />
              </div>

              {/* Employee Name */}
              <div className="space-y-2">
                <Label htmlFor="employee-name">Employee Name *</Label>
                <Input
                  id="employee-name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input
                  id="employee-id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID (optional)"
                />
              </div>

              {/* Claim Amount */}
              <div className="space-y-2">
                <Label htmlFor="claim-amount">Claim Amount *</Label>
                <Input
                  id="claim-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Claim Type */}
              <div className="space-y-2">
                <Label htmlFor="claim-type">Claim Type *</Label>
                <Select value={claimType} onValueChange={setClaimType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {claimTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reimbursement Method */}
            <div className="space-y-3">
              <Label>Reimbursement Method *</Label>
              <RadioGroup
                value={reimbursementMethod}
                onValueChange={setReimbursementMethod}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cheque" id="cheque" />
                  <Label htmlFor="cheque">Cheque</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Label htmlFor="bank-transfer">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Received from client">Received from client</SelectItem>
                  {/* Other status options are disabled for now as per requirements */}
                  {statusOptions.slice(1).map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption} disabled>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Other statuses will be available for updates later</p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <FileUpload onFilesChange={setFiles} acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png"]} maxFiles={10} />
              <p className="text-xs text-muted-foreground">
                Upload supporting documents (PDF, JPG, JPEG, PNG formats only)
              </p>
            </div>

            {/* Notes/Tags */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes/Tags</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or tags..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button type="submit" size="lg" className="px-8">
                Submit Claim
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
