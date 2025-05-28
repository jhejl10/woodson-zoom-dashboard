"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export function SmartCallDock() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isOnHold, setIsOnHold] = useState(false)
  const [activeTab, setActiveTab] = useState("keypad")
  const [activeCall, setActiveCall] = useState<any>(null)
  const [parkedCalls, setParkedCalls] = useState<any[]>([])
  const [callDuration, setCallDuration] = useState(0)

  // For demo purposes, we'll show an empty state
  const hasActiveCall = false

  if (!hasActiveCall && parkedCalls.length === 0) {
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
        {hasActiveCall && activeCall && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeCall.avatar || "/placeholder.svg"} alt={activeCall.name} />
                <AvatarFallback>{activeCall.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{activeCall.name}</div>
                  <Badge variant="outline" className="text-xs">
                    {activeCall.direction}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{activeCall.number}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
                  </span>
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
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="text-xs mt-1">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              <Button
                variant={isOnHold ? "destructive" : "outline"}
                size="sm"
                className="flex flex-col items-center p-2 h-auto"
                onClick={() => setIsOnHold(!isOnHold)}
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
              <Button variant="destructive" size="sm" className="flex flex-col items-center p-2 h-auto">
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
                      <div className="text-sm font-medium">{call.name}</div>
                      <div className="text-xs text-muted-foreground">{call.number}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
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
                <Input className="text-center text-xl mb-4" placeholder="Enter number" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => (
                    <Button key={key} variant="outline" className="h-12">
                      {key}
                    </Button>
                  ))}
                </div>
                <Button className="w-full mt-4">
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
