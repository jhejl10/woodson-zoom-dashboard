"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, PhoneIncoming, PhoneOutgoing, Voicemail, MessageSquare, Download, Volume2, Filter } from "lucide-react"

// Sample data for the current user
const recentCalls = [
  {
    id: 1,
    name: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    type: "incoming",
    duration: "5:23",
    time: "2 minutes ago",
    status: "answered",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Mike Chen",
    number: "+1 (555) 987-6543",
    type: "outgoing",
    duration: "12:45",
    time: "15 minutes ago",
    status: "answered",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Unknown",
    number: "+1 (555) 456-7890",
    type: "incoming",
    duration: "0:00",
    time: "1 hour ago",
    status: "missed",
    avatar: null,
  },
]

const voicemails = [
  {
    id: 1,
    from: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    duration: "1:23",
    time: "30 minutes ago",
    isNew: true,
    transcript: "Hi John, this is Sarah. I wanted to follow up on our meeting yesterday...",
  },
  {
    id: 2,
    from: "Unknown Caller",
    number: "+1 (555) 999-8888",
    duration: "0:45",
    time: "2 hours ago",
    isNew: true,
    transcript: "Hello, I'm calling regarding the proposal you sent...",
  },
]

const textMessages = [
  {
    id: 1,
    from: "Sarah Johnson",
    number: "+1 (555) 123-4567",
    message: "Thanks for the call earlier. I'll send over the documents by EOD.",
    time: "10 minutes ago",
    isRead: true,
  },
  {
    id: 2,
    from: "Mike Chen",
    number: "+1 (555) 987-6543",
    message: "Can we reschedule our 3 PM meeting to 4 PM?",
    time: "1 hour ago",
    isRead: false,
  },
]

function RecentCallItem({ call }: { call: (typeof recentCalls)[0] }) {
  const getCallIcon = () => {
    if (call.type === "incoming") {
      return call.status === "missed" ? PhoneIncoming : PhoneIncoming
    }
    return PhoneOutgoing
  }

  const getCallColor = () => {
    if (call.status === "missed") return "text-red-500"
    if (call.type === "incoming") return "text-green-500"
    return "text-blue-500"
  }

  const CallIcon = getCallIcon()

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className={`p-2 rounded-full bg-muted ${getCallColor()}`}>
        <CallIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{call.name}</p>
          <p className="text-xs text-muted-foreground">{call.time}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{call.number}</p>
          <p className="text-xs text-muted-foreground">{call.duration}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  )
}

function VoicemailItem({ voicemail }: { voicemail: (typeof voicemails)[0] }) {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
        <Voicemail className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{voicemail.from}</p>
            {voicemail.isNew && (
              <Badge variant="destructive" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{voicemail.time}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {voicemail.number} • {voicemail.duration}
        </p>
        <p className="text-sm text-muted-foreground">{voicemail.transcript}</p>
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
}

function TextMessageItem({ message }: { message: (typeof textMessages)[0] }) {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <div className="p-2 rounded-full bg-green-100 text-green-600">
        <MessageSquare className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{message.from}</p>
            {!message.isRead && (
              <Badge variant="destructive" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{message.time}</p>
        </div>
        <p className="text-xs text-muted-foreground">{message.number}</p>
        <p className="text-sm">{message.message}</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Reply
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MyProfileView() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>John Doe</CardTitle>
              <CardDescription>john.doe@company.com • Extension 1001</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Available</Badge>
                <span className="text-sm text-muted-foreground">Available for calls</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Calls</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">1 unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voicemails</CardTitle>
            <Voicemail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">All new</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Text Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
          <TabsTrigger value="voicemail">Voicemail</TabsTrigger>
          <TabsTrigger value="texts">Text Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Calls</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {recentCalls.map((call) => (
                  <RecentCallItem key={call.id} call={call} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voicemail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voicemail Messages</CardTitle>
              <CardDescription>Listen to and manage your voicemail messages</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {voicemails.map((voicemail) => (
                  <VoicemailItem key={voicemail.id} voicemail={voicemail} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="texts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Messages</CardTitle>
              <CardDescription>View and respond to your text messages</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {textMessages.map((message) => (
                  <TextMessageItem key={message.id} message={message} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics</CardTitle>
              <CardDescription>View detailed analytics about your call patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">This Week</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Incoming Calls</span>
                      <span>28</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outgoing Calls</span>
                      <span>19</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Missed Calls</span>
                      <span>3</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Average Duration</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Incoming</span>
                      <span>6m 45s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outgoing</span>
                      <span>4m 32s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Talk Time</span>
                      <span>4h 23m</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
