"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Circle, CircleDot, Minus, Phone, Search, Users, Building, PhoneCall } from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"
import { useZoomUsers } from "@/hooks/use-zoom-data"

// Remove the hardcoded usersData array and replace the component logic:

interface SiteGroupProps {
  siteName: string
  users: any[]
  onUserClick: (user: any) => void
}

function SiteGroup({ siteName, users, onUserClick }: SiteGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{siteName}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onUserClick(user)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center mt-2">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.extension}</p>
                {user.statusMessage && (
                  <Badge variant="secondary" className="mt-1">
                    {user.statusMessage}
                  </Badge>
                )}
                {user.onCall && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">On Call</span>
                  </div>
                )}
                {user.presence === "available" && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CircleDot className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Available</span>
                  </div>
                )}
                {user.presence === "busy" && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Minus className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">Busy</span>
                  </div>
                )}
                {user.presence === "offline" && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Circle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Offline</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSite, setSelectedSite] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Use real data from the API
  const { users: usersData, loading, error, refetch } = useZoomUsers()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-600">Error loading users: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Group users by site
  const groupedUsers = usersData?.reduce(
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
  const filteredGroupedUsers = Object.entries(groupedUsers || {}).reduce(
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

  const sites = Object.keys(groupedUsers || {})
  const totalUsers = usersData?.length || 0
  const availableUsers = usersData?.filter((u) => u.presence === "available").length || 0
  const onCallUsers = usersData?.filter((u) => u.onCall).length || 0

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
