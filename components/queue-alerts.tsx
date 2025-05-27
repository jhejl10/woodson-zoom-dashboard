"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, Clock } from "lucide-react"
import { useQueueEvents } from "@/hooks/use-websocket-events"

export function QueueAlerts() {
  const { queueUpdates } = useQueueEvents()
  const [urgentQueues, setUrgentQueues] = useState<any[]>([])

  useEffect(() => {
    const urgent = Array.from(queueUpdates.values()).filter(
      (queue) => queue.waiting_calls > 3 || queue.longest_wait_time > 300, // 5 minutes
    )
    setUrgentQueues(urgent)
  }, [queueUpdates])

  if (urgentQueues.length === 0) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          Queue Alerts
          <Badge variant="destructive" className="text-xs">
            {urgentQueues.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentQueues.map((queue) => (
          <div key={queue.queue_id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="space-y-1">
              <p className="text-sm font-medium">{queue.queue_name}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {queue.waiting_calls} waiting
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(queue.longest_wait_time / 60)}m longest wait
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              View Queue
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
