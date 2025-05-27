"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useWebSocketConnection } from "@/hooks/use-websocket-events"

export function ConnectionStatus() {
  const { isConnected, connectionError } = useWebSocketConnection()

  if (connectionError) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Connection Error
      </Badge>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isConnected ? "Live" : "Offline"}
    </Badge>
  )
}
