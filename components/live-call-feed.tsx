"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, ArrowRightLeft } from "lucide-react"
import { useCallEvents } from "@/hooks/use-websocket-events"
import { formatDistanceToNow } from "date-fns"

export function LiveCallFeed() {
  const { recentCallEvents } = useCallEvents()

  const getCallIcon = (event: any) => {
    switch (event.status) {
      case "ringing":
        return event.direction === "inbound" ? PhoneIncoming : PhoneOutgoing
      case "answered":
        return Phone
      case "ended":
        return PhoneOff
      case "transferred":
        return ArrowRightLeft
      default:
        return Phone
    }
  }

  const getCallColor = (event: any) => {
    switch (event.status) {
      case "ringing":
        return "text-blue-500"
      case "answered":
        return "text-green-500"
      case "ended":
        return "text-gray-500"
      case "transferred":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadge = (event: any) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ringing: "default",
      answered: "secondary",
      ended: "outline",
      transferred: "secondary",
    }

    return (
      <Badge variant={variants[event.status] || "outline"} className="text-xs">
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </Badge>
    )
  }

  if (recentCallEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Call Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No recent call events</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          Live Call Feed
          <Badge variant="secondary" className="text-xs">
            {recentCallEvents.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="space-y-2 p-4">
            {recentCallEvents.map((event, index) => {
              const Icon = getCallIcon(event)
              return (
                <div
                  key={`${event.call_id}-${index}`}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className={`p-1 rounded-full ${getCallColor(event)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium truncate">
                        {event.direction === "inbound" ? event.caller : event.callee}
                      </p>
                      {getStatusBadge(event)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp || Date.now()), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
