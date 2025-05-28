"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"

export function ConnectionStatus() {
  // const { isConnected, connectionError } = useWebSocketConnection()
  const isConnected = true // Temporarily always show as connected
  const connectionError = null // No connection errors for now

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
