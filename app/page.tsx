import { ZoomAuthGuard } from "@/components/zoom-auth-guard"
import { ZoomPhoneDashboard } from "@/components/zoom-phone-dashboard"

export default function Page() {
  return (
    <ZoomAuthGuard>
      <ZoomPhoneDashboard />
    </ZoomAuthGuard>
  )
}
