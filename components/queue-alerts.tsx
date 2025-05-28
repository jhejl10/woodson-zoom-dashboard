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
    if (!loading && Array.isArray(queues) && queues.length > 0) {
      try {
        // Find queues with high wait times or many waiting calls
        const urgentQueues = queues.filter((queue: any) => {
          if (!queue) return false

          const waitingCalls = queue.waiting_calls || 0
          const longestWaitTime = queue.longest_wait_time || "0:00"

          // Safely parse the wait time
          let minutes = 0
          try {
            const timeParts = longestWaitTime.split(":")
            if (Array.isArray(timeParts) && timeParts.length > 0) {
              minutes = Number.parseInt(timeParts[0]) || 0
            }
          } catch (error) {
            console.error("Error parsing wait time:", error)
          }

          return waitingCalls > 2 || minutes > 3
        })

        if (Array.isArray(urgentQueues) && urgentQueues.length > 0) {
          setAlerts(
            urgentQueues.map((queue: any) => ({
              id: queue?.id || Math.random().toString(),
              title: `${queue?.name || "Unknown Queue"} needs attention`,
              description: `${queue?.waiting_calls || 0} calls waiting, longest wait: ${queue?.longest_wait_time || "0:00"}`,
              queue: queue,
            })),
          )
        } else {
          setAlerts([])
        }
      } catch (error) {
        console.error("Error processing queue alerts:", error)
        setAlerts([])
      }
    } else {
      setAlerts([])
    }
  }, [queues, loading])

  const dismissAlert = (alertId: string) => {
    try {
      setAlerts((current) => (Array.isArray(current) ? current.filter((alert) => alert?.id !== alertId) : []))
    } catch (error) {
      console.error("Error dismissing alert:", error)
    }
  }

  if (!Array.isArray(alerts) || alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        if (!alert || !alert.id) return null

        return (
          <Alert key={alert.id} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle>{alert.title || "Queue Alert"}</AlertTitle>
              <AlertDescription>{alert.description || "Queue needs attention"}</AlertDescription>
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
        )
      })}
    </div>
  )
}
