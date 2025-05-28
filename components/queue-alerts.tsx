"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { useZoomQueues } from "@/hooks/use-zoom-data"

export function QueueAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const { queues, loading } = useZoomQueues()

  useEffect(() => {
    if (!loading && queues) {
      // Find queues with high wait times or many waiting calls
      const urgentQueues = queues.filter((queue: any) => {
        const waitingCalls = queue.waiting_calls || 0
        const longestWaitTime = queue.longest_wait_time || "0:00"
        const [minutes] = longestWaitTime.split(":").map(Number)

        return waitingCalls > 2 || minutes > 3
      })

      if (urgentQueues.length > 0) {
        setAlerts(
          urgentQueues.map((queue: any) => ({
            id: queue.id,
            title: `${queue.name} needs attention`,
            description: `${queue.waiting_calls} calls waiting, longest wait: ${queue.longest_wait_time}`,
            queue: queue,
          })),
        )
      } else {
        setAlerts([])
      }
    }
  }, [queues, loading])

  const dismissAlert = (alertId: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== alertId))
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="flex-1">
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              View Queue
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => dismissAlert(alert.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
