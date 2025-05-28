"use client"

import { useEffect, useState } from "react"
import { getWebSocketClient } from "@/lib/websocket-client"

export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const wsClient = getWebSocketClient()

    const handleConnected = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleDisconnected = () => {
      setIsConnected(false)
    }

    const handleError = (error: any) => {
      setConnectionError(error.message || "WebSocket connection error")
    }

    wsClient.on("connected", handleConnected)
    wsClient.on("disconnected", handleDisconnected)
    wsClient.on("error", handleError)

    // Set initial state
    setIsConnected(wsClient.isConnected())

    return () => {
      wsClient.off("connected", handleConnected)
      wsClient.off("disconnected", handleDisconnected)
      wsClient.off("error", handleError)
    }
  }, [])

  return { isConnected, connectionError }
}

export function useCallEvents() {
  const [recentCallEvents, setRecentCallEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // For now, we'll just return an empty array
  // This will be replaced with real WebSocket events when implemented
  return { recentCallEvents: [], isConnected: false }
}

export function usePresenceEvents() {
  const [presenceEvents, setPresenceEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // For now, we'll just return an empty array
  // This will be replaced with real WebSocket events when implemented
  return { presenceEvents: [], isConnected: false }
}

export function useQueueEvents() {
  const [queueEvents, setQueueEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // For now, we'll just return an empty array
  // This will be replaced with real WebSocket events when implemented
  return { queueEvents: [], isConnected: false }
}
