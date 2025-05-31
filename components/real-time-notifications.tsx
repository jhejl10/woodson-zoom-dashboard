"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Phone, PhoneIncoming, PhoneOff } from "lucide-react"
import { useCallEvents, usePresenceEvents, useQueueEvents } from "@/hooks/use-webhook-events"
import type { CallEvent, PresenceEvent } from "@/hooks/use-webhook-events"
import { CallNotification } from "./call-notification"

interface RealTimeNotificationsProps {
  enabled?: boolean
  dataLoaded?: boolean
}

export function RealTimeNotifications({ enabled = false, dataLoaded = false }: RealTimeNotificationsProps) {
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
  }, [enabled, dataLoaded, shouldEnable, recentCallEvents])

  // Handle call event notifications
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

  // Handle presence change notifications
  useEffect(() => {
    if (!shouldEnable || !Array.isArray(presenceUpdates) || presenceUpdates.length === 0) {
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

  const handleCallNotification = (event: CallEvent) => {
    try {
      if (!event || typeof event !== "object") return

      switch (event.status) {
        case "ringing":
          if (event.direction === "inbound") {
            setActiveIncomingCall(event)

            toast("Incoming Call", {
              description: `Call from ${event.caller || "Unknown"}`,
              icon: <PhoneIncoming className="h-4 w-4" />,
              action: {
                label: "Answer",
                onClick: () => {
                  console.log("Answer call from toast:", event.call_id)
                },
              },
              duration: 10000,
            })
          }
          break
        case "answered":
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

  const handleAnswerCall = () => {
    console.log("Answering call:", activeIncomingCall?.call_id)
    setActiveIncomingCall(null)
  }

  const handleRejectCall = () => {
    console.log("Rejecting call:", activeIncomingCall?.call_id)
    setActiveIncomingCall(null)
  }

  return (
    <>
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
