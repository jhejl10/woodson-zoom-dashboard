"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Phone, PhoneIncoming, PhoneOff, Users } from "lucide-react"
import { useCallEvents, usePresenceEvents, useQueueEvents } from "@/hooks/use-websocket-events"
import type { CallEvent, PresenceEvent, QueueEvent } from "@/lib/websocket-client"

export function RealTimeNotifications() {
  const { recentCallEvents } = useCallEvents()
  const { presenceUpdates } = usePresenceEvents()
  const { queueUpdates } = useQueueEvents()

  // Handle call event notifications
  useEffect(() => {
    if (recentCallEvents.length > 0) {
      const latestEvent = recentCallEvents[0]
      handleCallNotification(latestEvent)
    }
  }, [recentCallEvents])

  // Handle presence change notifications
  useEffect(() => {
    presenceUpdates.forEach((event) => {
      handlePresenceNotification(event)
    })
  }, [presenceUpdates])

  // Handle queue event notifications
  useEffect(() => {
    queueUpdates.forEach((event) => {
      handleQueueNotification(event)
    })
  }, [queueUpdates])

  const handleCallNotification = (event: CallEvent) => {
    switch (event.status) {
      case "ringing":
        if (event.direction === "inbound") {
          toast("Incoming Call", {
            description: `Call from ${event.caller}`,
            icon: <PhoneIncoming className="h-4 w-4" />,
            action: {
              label: "Answer",
              onClick: () => {
                // Handle answer call
                console.log("Answer call:", event.call_id)
              },
            },
            duration: 10000,
          })
        }
        break
      case "answered":
        toast.success("Call Connected", {
          description: `Connected with ${event.direction === "inbound" ? event.caller : event.callee}`,
          icon: <Phone className="h-4 w-4" />,
          duration: 3000,
        })
        break
      case "ended":
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
  }

  const handlePresenceNotification = (event: PresenceEvent) => {
    // Only show notifications for significant presence changes
    if (event.presence === "offline") {
      toast.info("User Offline", {
        description: `User went offline`,
        duration: 2000,
      })
    }
  }

  const handleQueueNotification = (event: QueueEvent) => {
    if (event.waiting_calls > 5) {
      toast.warning("Queue Alert", {
        description: `${event.queue_name} has ${event.waiting_calls} waiting calls`,
        icon: <Users className="h-4 w-4" />,
        action: {
          label: "View Queue",
          onClick: () => {
            // Navigate to queue view
            console.log("Navigate to queue:", event.queue_id)
          },
        },
        duration: 8000,
      })
    }
  }

  return null // This component only handles notifications
}
