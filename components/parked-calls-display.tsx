"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PauseCircle, X, ChevronRight, ChevronLeft } from "lucide-react"
import { getActiveCalls } from "@/lib/zoom-api"
import { getWebSocketClient } from "@/lib/websocket-client"

export function ParkedCallsDisplay() {
  const [parkedCalls, setParkedCalls] = useState<any[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "Unknown"
    // Basic formatting for US numbers
    if (phone.length === 10) {
      return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`
    }
    return phone
  }

  // Load parked calls
  const loadParkedCalls = async () => {
    try {
      const calls = await getActiveCalls()
      console.log("Checking for parked calls:", calls)

      // Filter for parked calls
      const parked = calls.filter((call: any) => call.status === "parked")
      console.log("Parked calls:", parked)

      setParkedCalls(parked)
      setIsVisible(parked.length > 0)
    } catch (error) {
      console.error("Error loading parked calls:", error)
    }
  }

  // Handle resuming a parked call
  const handleResumeCall = async (callId: string) => {
    try {
      console.log("Resuming parked call:", callId)
      // In a real implementation, this would call the Zoom API to resume the call

      // Remove from list
      setParkedCalls((prev) => prev.filter((call) => call.id !== callId))

      // Hide if no more parked calls
      if (parkedCalls.length <= 1) {
        setIsVisible(false)
      }
    } catch (error) {
      console.error("Error resuming parked call:", error)
    }
  }

  // Load parked calls on mount and set up WebSocket listener
  useEffect(() => {
    loadParkedCalls()

    // Set up WebSocket listener for parked call events
    const wsClient = getWebSocketClient()

    wsClient.on("parked_call_event", (event) => {
      console.log("Parked call event received in ParkedCallsDisplay:", event)
      loadParkedCalls()
    })

    wsClient.on("call_event", (event) => {
      // Reload on any call event as it might affect parked calls
      loadParkedCalls()
    })

    // Poll for parked calls every 30 seconds as a fallback
    const interval = setInterval(loadParkedCalls, 30000)

    return () => {
      clearInterval(interval)
      wsClient.removeAllListeners("parked_call_event")
      wsClient.removeAllListeners("call_event")
    }
  }, [])

  // Don't render if no parked calls
  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed right-0 top-1/4 z-40 transition-all duration-300 ${
        isExpanded ? "translate-x-0" : "translate-x-[calc(100%-2.5rem)]"
      }`}
    >
      <div className="flex">
        <Button
          variant="default"
          size="sm"
          className="rounded-l-md rounded-r-none h-auto py-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronRight /> : <ChevronLeft />}
          {!isExpanded && <div className="rotate-90 ml-1 whitespace-nowrap">Parked Calls ({parkedCalls.length})</div>}
        </Button>

        <Card className="w-80 rounded-l-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center">
                <PauseCircle className="h-4 w-4 mr-2 text-yellow-600" />
                Parked Calls ({parkedCalls.length})
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsVisible(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parkedCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div>
                    <div className="font-medium text-sm">
                      {call.direction === "inbound"
                        ? call.caller_name || formatPhoneNumber(call.caller_number)
                        : call.callee_name || formatPhoneNumber(call.callee_number)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Parked at {new Date(call.park_time || call.start_time).toLocaleTimeString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleResumeCall(call.id)}>
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
