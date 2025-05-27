"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Circle, CircleDot, Clock, Minus, Phone, Search, Users, Building, PhoneCall, MessageSquare } from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"

// Sample user data with real-time status
const usersData = [
  {
    id: 1,
    name: "Sarah Johnson",
    extension: "1001",
    presence: "available",
    statusMessage: "Available for calls",
    site: "New York Office",
    location: "Floor 5, Desk 12",
    title: "Sales Manager",
    email: "sarah.johnson@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: false,
    currentCall: null,
    lastSeen: null,
  },
  {
    id: 2,
    name: "Mike Chen",
    extension: "1002",
    presence: "busy",
    statusMessage: "In a meeting until 3 PM",
    site: "New York Office",
    location: "Floor 3, Conference Room A",
    title: "Product Manager",
    email: "mike.chen@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: true,
    currentCall: "John Smith",
    currentCallNumber: "+1 (555) 123-4567",
    lastSeen: null,
  },
  {
    id: 3,
    name: "Emily Davis",
    extension: "1003",
    presence: "away",
    statusMessage: "Back in 15 minutes",
    site: "New York Office",
    location: "Floor 2, Marketing",
    title: "Marketing Director",
    email: "emily.davis@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: false,
    currentCall: null,
    lastSeen: "5 minutes ago",
  },
  {
    id: 4,
    name: "Reception Desk",
    extension: "1000",
    presence: "available",
    statusMessage: null,
    site: "New York Office",
    location: "Main Lobby",
    title: "Reception",
    email: null,
    avatar: null,
    type: "common_area",
    onCall: false,
    currentCall: null,
    lastSeen: null,
  },
  {
    id: 5,
    name: "Alex Rodriguez",
    extension: "2001",
    presence: "dnd",
    statusMessage: "Focus time - urgent only",
    site: "San Francisco Office",
    location: "Floor 8, Engineering",
    title: "Senior Developer",
    email: "alex.rodriguez@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: false,
    currentCall: null,
    lastSeen: null,
  },
  {
    id: 6,
    name: "Conference Room 1",
    extension: "2000",
    presence: "busy",
    statusMessage: null,
    site: "San Francisco Office",
    location: "Floor 8, Conference Room 1",
    title: "Conference Room",
    email: null,
    avatar: null,
    type: "common_area",
    onCall: true,
    currentCall: "Team Meeting",
    currentCallNumber: "Internal Call",
    lastSeen: null,
  },
  {
    id: 7,
    name: "Lisa Wang",
    extension: "2002",
    presence: "offline",
    statusMessage: null,
    site: "San Francisco Office",
    location: "Floor 7, Design",
    title: "UX Designer",
    email: "lisa.wang@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: false,
    currentCall: null,
    lastSeen: "2 hours ago",
  },
  {
    id: 8,
    name: "David Kim",
    extension: "3001",
    presence: "available",
    statusMessage: "Happy to help!",
    site: "Austin Office",
    location: "Floor 1, Support",
    title: "Customer Support",
    email: "david.kim@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "user",
    onCall: true,
    currentCall: "Customer Call",
    currentCallNumber: "+1 (555) 987-6543",
    lastSeen: null,
  },
]

function getPresenceIcon(presence: string) {
  switch (presence) {
    case "available":
      return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
    case "busy":
      return <CircleDot className="h-3 w-3 fill-red-500 text-red-500" />
    case "away":
      return <Clock className="h-3 w-3 fill-yellow-500 text-yellow-500" />
    case "dnd":
      return <Minus className="h-3 w-3 fill-red-600 text-red-600" />
    case "offline":
      return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
    default:
      return <Circle className="h-3 w-3 fill-gray-500 text-gray-500" />
  }
}

function getPresenceColor(presence: string) {
  switch (presence) {
    case "available":
      return "bg-green-500"
    case "busy":
      return "bg-red-500"
    case "away":
      return "bg-yellow-500"
    case "dnd":
      return "bg-red-600"
    case "offline":
      return "bg-gray-400"
    default:
      return "bg-gray-500"
  }
}

function UserItem({ user, onClick }: { user: any; onClick: () => void }) {
  const [showCallInfo, setShowCallInfo] = useState(true)

  // Toggle between caller name and number every 3 seconds when on call
  useEffect(() => {
    if (user.onCall && user.currentCallNumber) {
      const interval = setInterval(() => {
        setShowCallInfo((prev) => !prev)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [user.onCall, user.currentCallNumber])

  return (
    <div
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className={user.type === "common_area" ? "bg-blue-100" : ""}>
            {user.type === "common_area" ? (
              <Building className="h-4 w-4" />
            ) : (
              user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
            )}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getPresenceColor(
            user.presence,
          )}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <Badge variant="outline" className="text-xs">
            {user.extension}
          </Badge>
          {user.type === "common_area" && (
            <Badge variant="secondary" className="text-xs">
              Common Area
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          {getPresenceIcon(user.presence)}
          <span className="text-xs text-muted-foreground">
            {user.onCall ? (
              <span className="flex items-center gap-1">
                <PhoneCall className="h-3 w-3" />
                {user.currentCallNumber && showCallInfo ? user.currentCallNumber : user.currentCall}
              </span>
            ) : user.statusMessage ? (
              user.statusMessage
            ) : user.lastSeen ? (
              `Last seen ${user.lastSeen}`
            ) : (
              user.presence.charAt(0).toUpperCase() + user.presence.slice(1)
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            // Handle call action
          }}
        >
          <Phone className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            // Handle message action
          }}
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function SiteGroup({
  siteName,
  users,
  onUserClick,
}: { siteName: string; users: any[]; onUserClick: (user: any) => void }) {
  const totalUsers = users.length
  const availableUsers = users.filter((u) => u.presence === "available").length
  const onCallUsers = users.filter((u) => u.onCall).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            {siteName}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {availableUsers}/{totalUsers} available
            </span>
            {onCallUsers > 0 && (
              <Badge variant="outline" className="text-xs">
                {onCallUsers} on call
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {users.map((user) => (
            <UserItem key={user.id} user={user} onClick={() => onUserClick(user)} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSite, setSelectedSite] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Group users by site
  const groupedUsers = usersData.reduce(
    (acc, user) => {
      if (!acc[user.site]) {
        acc[user.site] = []
      }
      acc[user.site].push(user)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Filter users based on search and site selection
  const filteredGroupedUsers = Object.entries(groupedUsers).reduce(
    (acc, [site, users]) => {
      if (selectedSite !== "all" && site !== selectedSite) {
        return acc
      }

      const filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.extension.includes(searchTerm) ||
          (user.statusMessage && user.statusMessage.toLowerCase().includes(searchTerm.toLowerCase())),
      )

      if (filteredUsers.length > 0) {
        acc[site] = filteredUsers
      }

      return acc
    },
    {} as Record<string, any[]>,
  )

  const sites = Object.keys(groupedUsers)
  const totalUsers = usersData.length
  const availableUsers = usersData.filter((u) => u.presence === "available").length
  const onCallUsers = usersData.filter((u) => u.onCall).length

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Circle className="h-4 w-4 fill-green-500 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Call</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onCallUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, extensions, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site} value={site}>
                {site}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users grouped by site */}
      <div className="space-y-4">
        {Object.entries(filteredGroupedUsers).map(([site, users]) => (
          <SiteGroup key={site} siteName={site} users={users} onUserClick={handleUserClick} />
        ))}
      </div>

      {/* User Details Dialog */}
      <UserDetailsDialog user={selectedUser} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
