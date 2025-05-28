"use client"

import { useEffect, useState } from "react"

export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // For now, keep WebSocket disabled to prevent forEach errors
  // This will be enabled once we have stable data loading
  useEffect(() => {
    console.log("WebSocket connection disabled to prevent forEach errors")
    setIsConnected(false)
  }, [])

  return { isConnected: false, connectionError: null }
}

export function useCallEvents(enabled = false) {
  const [recentCallEvents, setRecentCallEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Only enable if explicitly requested and data is loaded
  useEffect(() => {
    if (!enabled) {
      console.log("Call events disabled until data is loaded")
      return
    }

    // TODO: Initialize WebSocket call events here when enabled
    console.log("Call events would be enabled here")
  }, [enabled])

  return { recentCallEvents: [], isConnected: false }
}

export function usePresenceEvents(enabled = false) {
  const [presenceUpdates, setPresenceUpdates] = useState(new Map())
  const [isConnected, setIsConnected] = useState(false)

  // Only enable if explicitly requested and data is loaded
  useEffect(() => {
    if (!enabled) {
      console.log("Presence events disabled until data is loaded")
      return
    }

    // TODO: Initialize WebSocket presence events here when enabled
    console.log("Presence events would be enabled here")
  }, [enabled])

  return { presenceUpdates: new Map(), isConnected: false }
}

export function useQueueEvents(enabled = false) {
  const [queueUpdates, setQueueUpdates] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Only enable if explicitly requested and data is loaded
  useEffect(() => {
    if (!enabled) {
      console.log("Queue events disabled until data is loaded")
      return
    }

    // TODO: Initialize WebSocket queue events here when enabled
    console.log("Queue events would be enabled here")
  }, [enabled])

  return { queueUpdates: [], isConnected: false }
}
