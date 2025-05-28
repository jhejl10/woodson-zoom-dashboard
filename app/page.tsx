import { ZoomAuthGuard } from "@/components/zoom-auth-guard"
import { ZoomPhoneDashboard } from "@/components/zoom-phone-dashboard"
import { SafeErrorBoundary } from "@/components/safe-error-boundary"

export default function Page() {
  return (
    <SafeErrorBoundary>
      <ZoomAuthGuard>
        <ZoomPhoneDashboard />
      </ZoomAuthGuard>
    </SafeErrorBoundary>
  )
}
