"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ConnectionStatusProps {
  dataLoaded?: boolean
  enabled?: boolean
}

export function ConnectionStatus({ dataLoaded = false, enabled = false }: ConnectionStatusProps) {
  // Show different states based on data loading and WebSocket enablement
  const getStatus = () => {
    if (!dataLoaded) {
      return {
        variant: "secondary" as const,
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        text: "Loading",
        tooltip: "Loading initial data...",
      }
    }

    if (!enabled) {
      return {
        variant: "outline" as const,
        icon: <WifiOff className="h-3 w-3" />,
        text: "Disabled",
        tooltip: "Real-time events are disabled",
      }
    }

    // When enabled and data is loaded, show connected (for now)
    return {
      variant: "default" as const,
      icon: <Wifi className="h-3 w-3" />,
      text: "Ready",
      tooltip: "Ready for real-time events",
    }
  }

  const status = getStatus()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={status.variant} className="flex items-center gap-1 cursor-help">
            {status.icon}
            {status.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
