"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  MoreHorizontal,
  Pause,
  Play,
  UserPlus,
  ArrowRightLeft,
  Clock,
  PhoneCall,
} from "lucide-react"

interface Call {
  id: string
  type: "active" | "parked"
  caller: string
  number: string
  duration: string
  avatar?: string
  isMuted?: boolean
  isOnHold?: boolean
}

const activeCalls: Call[] = [
  {
    id: "1",
    type: "active",
    caller: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    duration: "05:23",
    avatar: "/placeholder.svg?height=32&width=32",
    isMuted: false,
    isOnHold: false,
  },
]

const parkedCalls: Call[] = [
  {
    id: "2",
    type: "parked",
    caller: "Mike Chen",
    number: "+1 (555) 987-6543",
    duration: "02:15",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    type: "parked",
    caller: "Unknown Caller",
    number: "+1 (555) 456-7890",
    duration: "01:45",
  },
]

function CallItem({ call, onDragStart }: { call: Call; onDragStart: (call: Call) => void }) {
  const [isMuted, setIsMuted] = useState(call.isMuted || false)
  const [isOnHold, setIsOnHold] = useState(call.isOnHold || false)

  return (
    <div
      className="flex items-center space-x-3 p-3 bg-background border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
      draggable
      onDragStart={() => onDragStart(call)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={call.avatar || "/placeholder.svg"} alt={call.caller} />
        <AvatarFallback>
          {call.caller
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{call.caller}</p>
          <Badge variant={call.type === "active" ? "default" : "secondary"} className="text-xs">
            {call.type === "active" ? "Active" : "Parked"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{call.number}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {call.duration}
          </span>
        </div>
      </div>

      {call.type === "active" && (
        <div className="flex items-center space-x-1">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          </Button>
          <Button
            variant={isOnHold ? "secondary" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsOnHold(!isOnHold)}
          >
            {isOnHold ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Add to Conference
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pause className="mr-2 h-4 w-4" />
                Park Call
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {call.type === "parked" && (
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Phone className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Retrieve Call
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export function SmartCallDock() {
  const [draggedCall, setDraggedCall] = useState<Call | null>(null)
  const allCalls = [...activeCalls, ...parkedCalls]

  if (allCalls.length === 0) {
    return null
  }

  const handleDragStart = (call: Call) => {
    setDraggedCall(call)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedCall) {
      // Handle call transfer logic here
      console.log("Transfer call:", draggedCall)
      setDraggedCall(null)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            Active & Parked Calls
            <Badge variant="secondary" className="ml-auto">
              {allCalls.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto" onDragOver={handleDragOver} onDrop={handleDrop}>
            {allCalls.map((call) => (
              <CallItem key={call.id} call={call} onDragStart={handleDragStart} />
            ))}
          </div>
          {draggedCall && (
            <div className="mt-3 p-2 border-2 border-dashed border-primary rounded-lg text-center text-sm text-muted-foreground">
              Drop here to transfer call or drag to a user to transfer
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
