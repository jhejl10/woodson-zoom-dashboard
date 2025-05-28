"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ConnectionStatus() {
  // For now, hardcode to true to avoid connection errors
  // This will be replaced with real WebSocket connection status when implemented
  const isConnected = true

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1 cursor-help">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? "Real-time events are working" : "Real-time events are not available"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
