"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Phone, PhoneIncoming, PhoneOff, Users } from "lucide-react"
import { useCallEvents, usePresenceEvents, useQueueEvents } from "@/hooks/use-websocket-events"
import type { CallEvent, PresenceEvent, QueueEvent } from "@/lib/websocket-client"
import { CallNotification } from "./call-notification"

interface RealTimeNotificationsProps {
  enabled?: boolean
  dataLoaded?: boolean
}

export function RealTimeNotifications({ enabled = false, dataLoaded = false }: RealTimeNotificationsProps) {
  // Only enable WebSocket events if both enabled and data is loaded
  // Always enable WebSocket events - remove the dependency on dataLoaded
  const shouldEnable = enabled

  const [activeIncomingCall, setActiveIncomingCall] = useState<CallEvent | null>(null)

  const { recentCallEvents } = useCallEvents(shouldEnable)
  const { presenceUpdates } = usePresenceEvents(shouldEnable)
  const { queueUpdates } = useQueueEvents(shouldEnable)

  // Log the state for debugging
  useEffect(() => {
    console.log("RealTimeNotifications state:", {
      enabled,
      dataLoaded,
      shouldEnable,
      recentCallEventsLength: Array.isArray(recentCallEvents) ? recentCallEvents.length : 0,
    })

    // Force enable WebSocket if not already enabled
    if (enabled && !shouldEnable) {
      console.log("Force enabling WebSocket events...")
    }
  }, [enabled, dataLoaded, shouldEnable, recentCallEvents])

  // Handle call event notifications - with safety checks
  useEffect(() => {
    if (!shouldEnable || !Array.isArray(recentCallEvents) || recentCallEvents.length === 0) {
      return
    }

    try {
      const latestEvent = recentCallEvents[0]
      if (latestEvent && typeof latestEvent === "object") {
        handleCallNotification(latestEvent)
      }
    } catch (error) {
      console.error("Error processing call events:", error)
    }
  }, [recentCallEvents, shouldEnable])

  // Handle presence change notifications - with safety checks
  useEffect(() => {
    if (!shouldEnable || !presenceUpdates || typeof presenceUpdates.forEach !== "function") {
      return
    }

    try {
      presenceUpdates.forEach((event: PresenceEvent) => {
        if (event && typeof event === "object") {
          handlePresenceNotification(event)
        }
      })
    } catch (error) {
      console.error("Error processing presence events:", error)
    }
  }, [presenceUpdates, shouldEnable])

  // Handle queue event notifications - with safety checks
  useEffect(() => {
    if (!shouldEnable || !Array.isArray(queueUpdates) || queueUpdates.length === 0) {
      return
    }

    try {
      queueUpdates.forEach((event: QueueEvent) => {
        if (event && typeof event === "object") {
          handleQueueNotification(event)
        }
      })
    } catch (error) {
      console.error("Error processing queue events:", error)
    }
  }, [queueUpdates, shouldEnable])

  const handleCallNotification = (event: CallEvent) => {
    try {
      if (!event || typeof event !== "object") return

      switch (event.status) {
        case "ringing":
          if (event.direction === "inbound") {
            // Show incoming call notification
            setActiveIncomingCall(event)

            // Also show toast for awareness
            toast("Incoming Call", {
              description: `Call from ${event.caller || "Unknown"}`,
              icon: <PhoneIncoming className="h-4 w-4" />,
              action: {
                label: "Answer",
                onClick: () => {
                  console.log("Answer call from toast:", event.call_id)
                  // This would typically just focus the call notification
                },
              },
              duration: 10000,
            })
          }
          break
        case "answered":
          // Clear incoming call notification if this was the active call
          if (activeIncomingCall?.call_id === event.call_id) {
            setActiveIncomingCall(null)
          }

          toast.success("Call Connected", {
            description: `Connected with ${event.direction === "inbound" ? event.caller : event.callee}`,
            icon: <Phone className="h-4 w-4" />,
            duration: 3000,
          })
          break
        case "ended":
          // Clear incoming call notification if this was the active call
          if (activeIncomingCall?.call_id === event.call_id) {
            setActiveIncomingCall(null)
          }

          toast.info("Call Ended", {
            description: `Call with ${event.direction === "inbound" ? event.caller : event.callee} ended`,
            icon: <PhoneOff className="h-4 w-4" />,
            duration: 3000,
          })
          break
        case "transferred":
          toast.info("Call Transferred", {
            description: `Call transferred successfully`,
            icon: <Phone className="h-4 w-4" />,
            duration: 3000,
          })
          break
      }
    } catch (error) {
      console.error("Error handling call notification:", error)
    }
  }

  const handlePresenceNotification = (event: PresenceEvent) => {
    try {
      if (!event || typeof event !== "object") return

      // Only show notifications for significant presence changes
      if (event.presence === "offline") {
        toast.info("User Offline", {
          description: `User went offline`,
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error handling presence notification:", error)
    }
  }

  const handleQueueNotification = (event: QueueEvent) => {
    try {
      if (!event || typeof event !== "object") return

      if (event.waiting_calls && event.waiting_calls > 5) {
        toast.warning("Queue Alert", {
          description: `${event.queue_name || "Queue"} has ${event.waiting_calls} waiting calls`,
          icon: <Users className="h-4 w-4" />,
          action: {
            label: "View Queue",
            onClick: () => {
              console.log("Navigate to queue:", event.queue_id)
            },
          },
          duration: 8000,
        })
      }
    } catch (error) {
      console.error("Error handling queue notification:", error)
    }
  }

  // Handle call actions
  const handleAnswerCall = () => {
    console.log("Answering call:", activeIncomingCall?.call_id)
    // In a real implementation, this would call the Zoom API to answer the call
    setActiveIncomingCall(null)
  }

  const handleRejectCall = () => {
    console.log("Rejecting call:", activeIncomingCall?.call_id)
    // In a real implementation, this would call the Zoom API to reject the call
    setActiveIncomingCall(null)
  }

  // Show status in development
  if (process.env.NODE_ENV === "development") {
    console.log("RealTimeNotifications render:", { enabled, dataLoaded, shouldEnable })
  }

  return (
    <>
      {/* Incoming call notification */}
      {activeIncomingCall && (
        <div className="fixed top-4 right-4 z-50">
          <CallNotification
            call={activeIncomingCall}
            onAnswer={handleAnswerCall}
            onReject={handleRejectCall}
            onClose={() => setActiveIncomingCall(null)}
          />
        </div>
      )}
    </>
  )
}
