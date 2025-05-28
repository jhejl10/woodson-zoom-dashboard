"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhoneIncoming, PhoneOutgoing, Phone, Voicemail, Volume2, Download } from "lucide-react"
import { useZoomCalls, useZoomVoicemails } from "@/hooks/use-zoom-data"

export function MyProfileView() {
  const [activeTab, setActiveTab] = useState("calls")

  // Use real Zoom data with enhanced error handling
  const { calls: callHistory, loading: callsLoading, error: callsError } = useZoomCalls("history")
  const { voicemails, loading: voicemailsLoading, error: voicemailsError } = useZoomVoicemails()

  // Triple-check that data is always an array
  let safeCallHistory: any[] = []
  let safeVoicemails: any[] = []

  try {
    if (Array.isArray(callHistory)) {
      safeCallHistory = callHistory.filter((call) => call != null)
    } else if (callHistory && typeof callHistory === "object" && Array.isArray(callHistory.calls)) {
      safeCallHistory = callHistory.calls.filter((call) => call != null)
    }
  } catch (err) {
    console.error("Error processing call history:", err)
    safeCallHistory = []
  }

  try {
    if (Array.isArray(voicemails)) {
      safeVoicemails = voicemails.filter((vm) => vm != null)
    } else if (voicemails && typeof voicemails === "object" && Array.isArray(voicemails.voicemails)) {
      safeVoicemails = voicemails.voicemails.filter((vm) => vm != null)
    }
  } catch (err) {
    console.error("Error processing voicemails:", err)
    safeVoicemails = []
  }

  const getCallIcon = (call: any) => {
    if (!call) return PhoneIncoming

    if (call.direction === "inbound") {
      return call.result === "missed" ? PhoneIncoming : PhoneIncoming
    }
    return PhoneOutgoing
  }

  const getCallColor = (call: any) => {
    if (!call) return "text-gray-500"

    if (call.result === "missed") return "text-red-500"
    if (call.direction === "inbound") return "text-green-500"
    return "text-blue-500"
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"

    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown time"

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      return `${diffDays} days ago`
    } catch (err) {
      return "Unknown time"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Profile</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
          <TabsTrigger value="voicemails">Voicemails</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls ({callsLoading ? "..." : safeCallHistory.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {callsError ? (
                <p className="text-red-600">Error loading calls: {callsError}</p>
              ) : callsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : safeCallHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeCallHistory.map((call: any, index: number) => {
                      if (!call) return null

                      const CallIcon = getCallIcon(call)
                      return (
                        <TableRow key={call.id || index}>
                          <TableCell className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full bg-muted ${getCallColor(call)}`}>
                              <CallIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{call.caller_name || call.caller_number || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">
                                {call.caller_number || call.callee_number || "No number"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={call.result === "missed" ? "destructive" : "default"}>
                              {call.direction || "unknown"} - {call.result || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDuration(call.duration || 0)}</TableCell>
                          <TableCell>{formatDate(call.date_time)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No call history available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voicemails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voicemails ({voicemailsLoading ? "..." : safeVoicemails.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {voicemailsError ? (
                <p className="text-red-600">Error loading voicemails: {voicemailsError}</p>
              ) : voicemailsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : safeVoicemails.length > 0 ? (
                <div className="space-y-4">
                  {safeVoicemails.map((voicemail: any, index: number) => {
                    if (!voicemail) return null

                    return (
                      <div key={voicemail.id || index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <Voicemail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium">
                                {voicemail.caller_name || voicemail.caller_number || "Unknown"}
                              </p>
                              {voicemail.status === "unread" && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(voicemail.date_time)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {voicemail.caller_number || "No number"} • {formatDuration(voicemail.duration || 0)}
                          </p>
                          {voicemail.transcript && (
                            <p className="text-sm text-muted-foreground">{voicemail.transcript}</p>
                          )}
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Volume2 className="h-4 w-4 mr-1" />
                              Play
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No voicemails available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SMS messages will appear here when available.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Call analytics and statistics will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
