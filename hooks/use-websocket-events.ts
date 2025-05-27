"use client"

import { useEffect, useState, useCallback } from "react"
import { getWebSocketClient, type CallEvent, type PresenceEvent, type QueueEvent } from "@/lib/websocket-client"

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
  const [recentCallEvents, setRecentCallEvents] = useState<CallEvent[]>([])

  const handleCallEvent = useCallback((event: CallEvent) => {
    setRecentCallEvents((prev) => [event, ...prev.slice(0, 9)]) // Keep last 10 events
  }, [])

  useEffect(() => {
    const wsClient = getWebSocketClient()
    wsClient.on("call_event", handleCallEvent)

    return () => {
      wsClient.off("call_event", handleCallEvent)
    }
  }, [handleCallEvent])

  return { recentCallEvents }
}

export function usePresenceEvents() {
  const [presenceUpdates, setPresenceUpdates] = useState<Map<string, PresenceEvent>>(new Map())

  const handlePresenceEvent = useCallback((event: PresenceEvent) => {
    setPresenceUpdates((prev) => new Map(prev.set(event.user_id, event)))
  }, [])

  useEffect(() => {
    const wsClient = getWebSocketClient()
    wsClient.on("presence_event", handlePresenceEvent)

    return () => {
      wsClient.off("presence_event", handlePresenceEvent)
    }
  }, [handlePresenceEvent])

  return { presenceUpdates }
}

export function useQueueEvents() {
  const [queueUpdates, setQueueUpdates] = useState<Map<string, QueueEvent>>(new Map())

  const handleQueueEvent = useCallback((event: QueueEvent) => {
    setQueueUpdates((prev) => new Map(prev.set(event.queue_id, event)))
  }, [])

  useEffect(() => {
    const wsClient = getWebSocketClient()
    wsClient.on("queue_event", handleQueueEvent)

    return () => {
      wsClient.off("queue_event", handleQueueEvent)
    }
  }, [handleQueueEvent])

  return { queueUpdates }
}
