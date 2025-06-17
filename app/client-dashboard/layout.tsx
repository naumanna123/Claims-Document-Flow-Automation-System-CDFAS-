import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Dashboard - ClaimsPro",
  description: "View your insurance claims status and documents",
}

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
