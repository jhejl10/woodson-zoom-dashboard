"use client"

import { useEffect, useState } from "react"
import { getWebSocketClient } from "@/lib/websocket-client"

export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const wsClient = getWebSocketClient()

    const handleConnect = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleDisconnect = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    }

    const handleError = (error: any) => {
      console.error("WebSocket error:", error)
      setConnectionError(error.message || "Connection error")
      setIsConnected(false)
    }

    // Check initial connection state
    setIsConnected(wsClient.isConnected())

    // Set up event listeners
    wsClient.on("connected", handleConnect)
    wsClient.on("disconnected", handleDisconnect)
    wsClient.on("error", handleError)

    return () => {
      wsClient.off("connected", handleConnect)
      wsClient.off("disconnected", handleDisconnect)
      wsClient.off("error", handleError)
    }
  }, [])

  return { isConnected, connectionError }
}

export function useCallEvents(enabled = false) {
  const [recentCallEvents, setRecentCallEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!enabled) {
      console.log("Call events disabled")
      return
    }

    console.log("Initializing call events listener")
    const wsClient = getWebSocketClient()

    const handleCallEvent = (event: any) => {
      console.log("Call event received:", event)
      setRecentCallEvents((prev) => [event, ...prev.slice(0, 9)]) // Keep last 10 events
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    // Set up event listeners
    wsClient.on("call_event", handleCallEvent)
    wsClient.on("connected", handleConnect)
    wsClient.on("disconnected", handleDisconnect)

    // Check initial connection state
    setIsConnected(wsClient.isConnected())

    return () => {
      wsClient.off("call_event", handleCallEvent)
      wsClient.off("connected", handleConnect)
      wsClient.off("disconnected", handleDisconnect)
    }
  }, [enabled])

  return { recentCallEvents, isConnected }
}

export function usePresenceEvents(enabled = false) {
  const [presenceUpdates, setPresenceUpdates] = useState(new Map())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!enabled) {
      console.log("Presence events disabled")
      return
    }

    console.log("Initializing presence events listener")
    const wsClient = getWebSocketClient()

    const handlePresenceEvent = (event: any) => {
      console.log("Presence event received:", event)
      setPresenceUpdates((prev) => {
        const newMap = new Map(prev)
        if (event.user_id) {
          newMap.set(event.user_id, event)
        }
        return newMap
      })
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    // Set up event listeners
    wsClient.on("presence_event", handlePresenceEvent)
    wsClient.on("connected", handleConnect)
    wsClient.on("disconnected", handleDisconnect)

    // Check initial connection state
    setIsConnected(wsClient.isConnected())

    return () => {
      wsClient.off("presence_event", handlePresenceEvent)
      wsClient.off("connected", handleConnect)
      wsClient.off("disconnected", handleDisconnect)
    }
  }, [enabled])

  return { presenceUpdates, isConnected }
}

export function useQueueEvents(enabled = false) {
  const [queueUpdates, setQueueUpdates] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!enabled) {
      console.log("Queue events disabled")
      return
    }

    console.log("Initializing queue events listener")
    const wsClient = getWebSocketClient()

    const handleQueueEvent = (event: any) => {
      console.log("Queue event received:", event)
      setQueueUpdates((prev) => {
        // Update existing queue or add new one
        const existingIndex = prev.findIndex((q) => q.queue_id === event.queue_id)
        if (existingIndex >= 0) {
          const newUpdates = [...prev]
          newUpdates[existingIndex] = event
          return newUpdates
        } else {
          return [...prev, event]
        }
      })
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    // Set up event listeners
    wsClient.on("queue_event", handleQueueEvent)
    wsClient.on("connected", handleConnect)
    wsClient.on("disconnected", handleDisconnect)

    // Check initial connection state
    setIsConnected(wsClient.isConnected())

    return () => {
      wsClient.off("queue_event", handleQueueEvent)
      wsClient.off("connected", handleConnect)
      wsClient.off("disconnected", handleDisconnect)
    }
  }, [enabled])

  return { queueUpdates, isConnected }
}
