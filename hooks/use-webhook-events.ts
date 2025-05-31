"use client"

import { useEffect, useState } from "react"

export interface CallEvent {
  call_id: string
  caller: string
  callee: string
  status: "ringing" | "answered" | "ended" | "transferred" | "held"
  direction: "inbound" | "outbound"
  user_id?: string
  timestamp: number
}

export interface PresenceEvent {
  user_id: string
  presence: "available" | "busy" | "away" | "dnd" | "offline"
  status_message?: string
  timestamp: number
}

export function useWebhookEvents(enabled = false) {
  const [callEvents, setCallEvents] = useState<CallEvent[]>([])
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([])
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!enabled) {
      console.log("Webhook events disabled")
      return
    }

    console.log("Starting webhook event polling...")
    setIsPolling(true)

    // Poll for events every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/webhooks/zoom?type=all&limit=10")
        const events = await response.json()

        if (events.call_events) {
          setCallEvents(events.call_events)
        }

        if (events.presence_events) {
          setPresenceEvents(events.presence_events)
        }

        console.log("Polled webhook events:", events)
      } catch (error) {
        console.error("Error polling webhook events:", error)
      }
    }, 5000)

    return () => {
      console.log("Stopping webhook event polling...")
      clearInterval(pollInterval)
      setIsPolling(false)
    }
  }, [enabled])

  return {
    callEvents,
    presenceEvents,
    isPolling,
    isConnected: isPolling,
  }
}

export function useCallEvents(enabled = false) {
  const { callEvents, isConnected } = useWebhookEvents(enabled)
  return { recentCallEvents: callEvents, isConnected }
}

export function usePresenceEvents(enabled = false) {
  const { presenceEvents, isConnected } = useWebhookEvents(enabled)
  return { presenceUpdates: presenceEvents, isConnected }
}

export function useQueueEvents(enabled = false) {
  // Queue events would be handled similarly
  return { queueUpdates: [], isConnected: false }
}
