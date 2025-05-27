"use client"

import { useEffect, useState } from "react"
import { Circle, CircleDot, Clock, Minus } from "lucide-react"
import { usePresenceEvents } from "@/hooks/use-websocket-events"

interface LivePresenceIndicatorProps {
  userId: string
  initialPresence?: string
  className?: string
}

export function LivePresenceIndicator({
  userId,
  initialPresence = "offline",
  className = "",
}: LivePresenceIndicatorProps) {
  const { presenceUpdates } = usePresenceEvents()
  const [currentPresence, setCurrentPresence] = useState(initialPresence)

  useEffect(() => {
    const update = presenceUpdates.get(userId)
    if (update) {
      setCurrentPresence(update.presence)
    }
  }, [presenceUpdates, userId])

  const getPresenceIcon = () => {
    switch (currentPresence) {
      case "available":
        return <Circle className={`h-3 w-3 fill-green-500 text-green-500 ${className}`} />
      case "busy":
        return <CircleDot className={`h-3 w-3 fill-red-500 text-red-500 ${className}`} />
      case "away":
        return <Clock className={`h-3 w-3 fill-yellow-500 text-yellow-500 ${className}`} />
      case "dnd":
        return <Minus className={`h-3 w-3 fill-red-600 text-red-600 ${className}`} />
      case "offline":
        return <Circle className={`h-3 w-3 fill-gray-400 text-gray-400 ${className}`} />
      default:
        return <Circle className={`h-3 w-3 fill-gray-500 text-gray-500 ${className}`} />
    }
  }

  const getPresenceColor = () => {
    switch (currentPresence) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-red-500"
      case "away":
        return "bg-yellow-500"
      case "dnd":
        return "bg-red-600"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={`relative ${className}`}>
      {getPresenceIcon()}
      <div
        className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-background ${getPresenceColor()}`}
      />
    </div>
  )
}
