"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PauseCircle,
  UserPlus,
  Minimize2,
  Maximize2,
  Clock,
} from "lucide-react"
import { getActiveCalls, makeCall, endCall, holdCall, muteCall } from "@/lib/zoom-api"
import { getWebSocketClient } from "@/lib/websocket-client"

export function SmartCallDock() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isOnHold, setIsOnHold] = useState(false)
  const [activeTab, setActiveTab] = useState("keypad")
  const [activeCall, setActiveCall] = useState<any>(null)
  const [parkedCalls, setParkedCalls] = useState<any[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [dialNumber, setDialNumber] = useState("")
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "Unknown"
    // Basic formatting for US numbers
    if (phone.length === 10) {
      return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`
    }
    return phone
  }

  // Load active calls on mount
  useEffect(() => {
    const loadActiveCalls = async () => {
      try {
        setIsLoading(true)
        const calls = await getActiveCalls()
        console.log("Active calls:", calls)

        if (calls && calls.length > 0) {
          // Find calls where the user is a participant
          const userCall = calls.find((call: any) => call.status === "in_progress" || call.status === "ringing")

          if (userCall) {
            setActiveCall(userCall)

            // Start timer if call is in progress
            if (userCall.status === "in_progress") {
              const startTime = new Date(userCall.start_time).getTime()
              const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
              setCallDuration(elapsedSeconds)

              const interval = setInterval(() => {
                setCallDuration((prev) => prev + 1)
              }, 1000)
              setTimerInterval(interval)
            }
          }

          // Find parked calls
          const parked = calls.filter((call: any) => call.status === "parked")
          setParkedCalls(parked)
        }
      } catch (error) {
        console.error("Error loading active calls:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActiveCalls()

    // Set up WebSocket listener for call events
    const wsClient = getWebSocketClient()

    wsClient.on("call_event", (event) => {
      console.log("Call event received in SmartCallDock:", event)
      loadActiveCalls() // Reload calls when events occur
    })

    wsClient.on("parked_call_event", (event) => {
      console.log("Parked call event received:", event)
      loadActiveCalls() // Reload calls when parked call events occur
    })

    return () => {
      if (timerInterval) clearInterval(timerInterval)
      wsClient.removeAllListeners("call_event")
      wsClient.removeAllListeners("parked_call_event")
    }
  }, [])

  // Handle call actions
  const handleEndCall = async () => {
    if (!activeCall) return

    try {
      await endCall(activeCall.id)
      setActiveCall(null)
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
      setCallDuration(0)
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  const handleToggleMute = async () => {
    if (!activeCall) return

    try {
      await muteCall(activeCall.id, !isMuted)
      setIsMuted(!isMuted)
    } catch (error) {
      console.error("Error toggling mute:", error)
    }
  }

  const handleToggleHold = async () => {
    if (!activeCall) return

    try {
      await holdCall(activeCall.id, !isOnHold)
      setIsOnHold(!isOnHold)
    } catch (error) {
      console.error("Error toggling hold:", error)
    }
  }

  const handleResumeParkedCall = async (callId: string) => {
    try {
      // In a real implementation, this would call the Zoom API to resume a parked call
      console.log("Resuming parked call:", callId)

      // Remove from parked calls and set as active
      const call = parkedCalls.find((c) => c.id === callId)
      if (call) {
        setParkedCalls((prev) => prev.filter((c) => c.id !== callId))
        setActiveCall(call)

        // Start timer
        const interval = setInterval(() => {
          setCallDuration((prev) => prev + 1)
        }, 1000)
        setTimerInterval(interval)
      }
    } catch (error) {
      console.error("Error resuming parked call:", error)
    }
  }

  const handleMakeCall = async () => {
    if (!dialNumber.trim()) return

    try {
      console.log("Making call to:", dialNumber)
      const response = await makeCall("me", dialNumber)
      console.log("Call response:", response)

      // In a real implementation, the WebSocket would notify us of the new call
      // For now, we'll simulate it
      setActiveCall({
        id: response.id || "temp-id",
        direction: "outbound",
        status: "in_progress",
        callee: dialNumber,
        callee_number: dialNumber,
        start_time: new Date().toISOString(),
      })

      // Start timer
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)

      setDialNumber("")
    } catch (error) {
      console.error("Error making call:", error)
    }
  }

  const handleKeypadPress = (key: string | number) => {
    setDialNumber((prev) => prev + key)
  }

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // If no active or parked calls, don't show the dock
  if (isLoading) {
    return null // Don't show anything while loading
  }

  if (!activeCall && parkedCalls.length === 0) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? "w-96" : "w-64"}`}>
      <Card className="overflow-hidden">
        {/* Call Header */}
        <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span className="font-medium">Call Console</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Active Call */}
        {activeCall && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {(activeCall.direction === "inbound"
                    ? activeCall.caller_name || activeCall.caller_number || "?"
                    : activeCall.callee_name || activeCall.callee_number || "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {activeCall.direction === "inbound"
                      ? activeCall.caller_name || formatPhoneNumber(activeCall.caller_number)
                      : activeCall.callee_name || formatPhoneNumber(activeCall.callee_number)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activeCall.direction}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activeCall.direction === "inbound" ? activeCall.caller_number : activeCall.callee_number}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatDuration(callDuration)}</span>
                  {isOnHold && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      On Hold
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                className="flex flex-col items-center p-2 h-auto"
                onClick={handleToggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="text-xs mt-1">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              <Button
                variant={isOnHold ? "destructive" : "outline"}
                size="sm"
                className="flex flex-col items-center p-2 h-auto"
                onClick={handleToggleHold}
              >
                <PauseCircle className="h-4 w-4" />
                <span className="text-xs mt-1">{isOnHold ? "Resume" : "Hold"}</span>
              </Button>
              <Button
                variant={isSpeakerOn ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center p-2 h-auto"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-xs mt-1">Speaker</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col items-center p-2 h-auto">
                <UserPlus className="h-4 w-4" />
                <span className="text-xs mt-1">Add</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex flex-col items-center p-2 h-auto"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-4 w-4" />
                <span className="text-xs mt-1">End</span>
              </Button>
            </div>
          </div>
        )}

        {/* Parked Calls */}
        {parkedCalls.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-2">Parked Calls ({parkedCalls.length})</h3>
            <div className="space-y-2">
              {parkedCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded-full bg-yellow-100 text-yellow-600">
                      <PauseCircle className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {call.direction === "inbound"
                          ? call.caller_name || formatPhoneNumber(call.caller_number)
                          : call.callee_name || formatPhoneNumber(call.callee_number)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {call.direction === "inbound" ? call.caller_number : call.callee_number}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleResumeParkedCall(call.id)}>
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keypad and Tabs (only shown when expanded) */}
        {isExpanded && (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="keypad">Keypad</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              <TabsContent value="keypad" className="p-4">
                <Input
                  className="text-center text-xl mb-4"
                  placeholder="Enter number"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => (
                    <Button key={key} variant="outline" className="h-12" onClick={() => handleKeypadPress(key)}>
                      {key}
                    </Button>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={handleMakeCall} disabled={!dialNumber.trim()}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </TabsContent>
              <TabsContent value="contacts" className="p-4">
                <p className="text-center text-muted-foreground">Your contacts will appear here</p>
              </TabsContent>
              <TabsContent value="recent" className="p-4">
                <p className="text-center text-muted-foreground">Your recent calls will appear here</p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  )
}
