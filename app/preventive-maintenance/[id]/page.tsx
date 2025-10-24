"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MaintenanceDetail } from "@/components/preventive-maintenance/maintenance-detail"
import { useParams } from "next/navigation"

export default function MaintenanceDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <DashboardLayout>
      <MaintenanceDetail maintenanceId={id} />
    </DashboardLayout>
  )
}
