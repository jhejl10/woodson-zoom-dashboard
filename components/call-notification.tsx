"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, PhoneOff, VolumeX } from "lucide-react"
import { endCall, holdCall, muteCall } from "@/lib/zoom-api"

interface CallNotificationProps {
  call: {
    call_id: string
    caller_name?: string
    caller_number?: string
    callee_name?: string
    callee_number?: string
    direction: "inbound" | "outbound"
    status: "ringing" | "answered" | "ended" | "transferred" | "held"
  }
  onAnswer?: () => void
  onReject?: () => void
  onClose?: () => void
}

export function CallNotification({ call, onAnswer, onReject, onClose }: CallNotificationProps) {
  const [isRinging, setIsRinging] = useState(call.status === "ringing")
  const [isActive, setIsActive] = useState(call.status === "answered")
  const [isHeld, setIsHeld] = useState(call.status === "held")
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "Unknown"
    // Basic formatting for US numbers
    if (phone.length === 10) {
      return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`
    }
    return phone
  }

  // Get display name based on call direction
  const getDisplayName = () => {
    if (call.direction === "inbound") {
      return call.caller_name || formatPhoneNumber(call.caller_number)
    } else {
      return call.callee_name || formatPhoneNumber(call.callee_number)
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle call answer
  const handleAnswer = async () => {
    try {
      console.log("Answering call:", call.call_id)
      // In a real implementation, this would call the Zoom API to answer the call
      setIsRinging(false)
      setIsActive(true)

      // Start call timer
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)

      if (onAnswer) onAnswer()
    } catch (error) {
      console.error("Error answering call:", error)
    }
  }

  // Handle call reject
  const handleReject = async () => {
    try {
      console.log("Rejecting call:", call.call_id)
      await endCall(call.call_id)
      setIsRinging(false)
      setIsActive(false)
      if (onReject) onReject()
      if (onClose) onClose()
    } catch (error) {
      console.error("Error rejecting call:", error)
    }
  }

  // Handle call end
  const handleEndCall = async () => {
    try {
      console.log("Ending call:", call.call_id)
      await endCall(call.call_id)
      setIsActive(false)
      if (timerInterval) clearInterval(timerInterval)
      if (onClose) onClose()
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  // Handle call hold
  const handleHold = async () => {
    try {
      console.log("Toggling hold for call:", call.call_id)
      await holdCall(call.call_id, !isHeld)
      setIsHeld(!isHeld)
    } catch (error) {
      console.error("Error toggling hold:", error)
    }
  }

  // Handle call mute
  const handleMute = async () => {
    try {
      console.log("Toggling mute for call:", call.call_id)
      await muteCall(call.call_id, !isMuted)
      setIsMuted(!isMuted)
    } catch (error) {
      console.error("Error toggling mute:", error)
    }
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [timerInterval])

  // Start timer if call is already active
  useEffect(() => {
    if (isActive && !timerInterval) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)
    }
  }, [isActive, timerInterval])

  return (
    <Card className="w-[350px] shadow-lg">
      <CardHeader className={`${isRinging ? "bg-red-500" : isActive ? "bg-green-500" : "bg-gray-500"} text-white`}>
        <CardTitle className="flex items-center justify-between">
          <span>{isRinging ? "Incoming Call" : isActive ? "Active Call" : "Call Ended"}</span>
          {isActive && <span className="text-sm">{formatDuration(callDuration)}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback>{getDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{getDisplayName()}</p>
            <p className="text-sm text-muted-foreground">
              {call.direction === "inbound" ? call.caller_number : call.callee_number}
            </p>
            {isHeld && <p className="text-sm text-yellow-600 font-medium mt-1">On Hold</p>}
            {isMuted && <p className="text-sm text-red-600 font-medium mt-1">Muted</p>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {isRinging ? (
          <>
            <Button variant="destructive" onClick={handleReject}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button variant="default" onClick={handleAnswer}>
              <Phone className="h-4 w-4 mr-2" />
              Answer
            </Button>
          </>
        ) : isActive ? (
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant={isMuted ? "destructive" : "outline"} size="sm" onClick={handleMute}>
              <VolumeX className="h-4 w-4 mr-1" />
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button variant={isHeld ? "default" : "outline"} size="sm" onClick={handleHold}>
              {isHeld ? "Resume" : "Hold"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEndCall}>
              <PhoneOff className="h-4 w-4 mr-1" />
              End
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
