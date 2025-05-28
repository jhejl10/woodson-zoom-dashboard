"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Phone,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  Filter,
  Building,
  Circle,
  CircleDot,
  Clock,
  Minus,
  SortAsc,
  Users,
} from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"
import { useZoomUsers, ultraSafeProcessArray } from "@/hooks/use-zoom-data"

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

function getPresenceText(presence: string) {
  switch (presence) {
    case "available":
      return "Available"
    case "busy":
      return "Busy"
    case "away":
      return "Away"
    case "dnd":
      return "Do Not Disturb"
    case "offline":
      return "Offline"
    default:
      return "Unknown"
  }
}

function UserCard({ user, onUserClick }: { user: any; onUserClick: (user: any) => void }) {
  // Safely handle user data
  if (!user || typeof user !== "object") {
    console.warn("UserCard received invalid user:", user)
    return null
  }

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onUserClick(user)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0 space-y-1">
            {/* 1st Row - Name and Type */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{user?.name || "Unknown User"}</h3>
              <div className="flex items-center gap-1">
                {user?.type === "common_area" ? (
                  <Badge variant="outline" className="text-xs">
                    Common Area
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getPresenceIcon(user?.presence || "unknown")}
                    <span>{getPresenceText(user?.presence || "unknown")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Row - Extension */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Ext</span>
                <Badge variant="outline" className="text-xs">
                  {user?.extension || "N/A"}
                </Badge>
              </div>
            </div>

            {/* 3rd Row - Status Message and Call Icon */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {user?.presence_status && (
                  <p className="text-xs text-muted-foreground truncate">{user.presence_status}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                      <Phone className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </DropdownMenuItem>
                    {user?.type === "user" && (
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      More Options
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [sortBy, setSortBy] = useState<"extension" | "name">("extension")

  // Use real Zoom data with enhanced error handling
  const { users, loading, error, refetch } = useZoomUsers()

  // Mock current user's site - replace with real data when available
  const currentUserSite = "New York Office"

  // Group users by site with ultra-safe processing
  const groupedUsers = useMemo(() => {
    try {
      console.log("=== GROUPING USERS START ===")
      console.log("Raw users from hook:", users)

      // Ensure users is always an array using our ultra-safe function
      const safeUsers = ultraSafeProcessArray(users, [])
      console.log("Safe users after processing:", safeUsers)

      // Validate each user object
      const validUsers: any[] = []

      // Use traditional for loop instead of forEach to avoid the error
      for (let i = 0; i < safeUsers.length; i++) {
        const user = safeUsers[i]
        if (user && typeof user === "object" && user.id) {
          validUsers.push(user)
        } else {
          console.warn("Invalid user object at index", i, ":", user)
        }
      }

      console.log("Valid users after validation:", validUsers)

      // Filter by search term
      const filtered: any[] = []
      for (let i = 0; i < validUsers.length; i++) {
        const user = validUsers[i]
        try {
          const searchLower = searchTerm.toLowerCase()
          const matchesSearch =
            (user.name && user.name.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower)) ||
            (user.extension && user.extension.toString().includes(searchTerm)) ||
            (user.phone_number && user.phone_number.includes(searchTerm))

          if (matchesSearch) {
            filtered.push(user)
          }
        } catch (err) {
          console.warn("Error filtering user:", user, err)
        }
      }

      console.log("Filtered users:", filtered)

      // Group by site
      const grouped: { [key: string]: any[] } = {}
      for (let i = 0; i < filtered.length; i++) {
        const user = filtered[i]
        try {
          const site = user.site || "Unknown Site"
          if (!grouped[site]) {
            grouped[site] = []
          }
          grouped[site].push(user)
        } catch (err) {
          console.warn("Error grouping user:", user, err)
        }
      }

      console.log("Grouped users:", grouped)

      // Sort users within each site
      const siteKeys = Object.keys(grouped)
      for (let i = 0; i < siteKeys.length; i++) {
        const site = siteKeys[i]
        try {
          if (Array.isArray(grouped[site])) {
            grouped[site].sort((a: any, b: any) => {
              try {
                if (!a || !b) return 0

                if (sortBy === "extension") {
                  const extA = Number.parseInt(a.extension) || 0
                  const extB = Number.parseInt(b.extension) || 0
                  return extA - extB
                } else {
                  const nameA = a.name || ""
                  const nameB = b.name || ""
                  return nameA.localeCompare(nameB)
                }
              } catch (err) {
                console.warn("Error sorting users:", err)
                return 0
              }
            })
          }
        } catch (err) {
          console.warn("Error sorting site users:", site, err)
        }
      }

      // Sort sites: current user's site first, then alphabetical
      const sortedSites = Object.keys(grouped).sort((a, b) => {
        if (a === currentUserSite) return -1
        if (b === currentUserSite) return 1
        return a.localeCompare(b)
      })

      const result: { site: string; users: any[] }[] = []
      for (let i = 0; i < sortedSites.length; i++) {
        const site = sortedSites[i]
        result.push({
          site,
          users: Array.isArray(grouped[site]) ? grouped[site] : [],
        })
      }

      console.log("Final grouped result:", result)
      console.log("=== GROUPING USERS END ===")
      return result
    } catch (error) {
      console.error("Error grouping users:", error)
      return []
    }
  }, [users, searchTerm, sortBy, currentUserSite])

  const handleUserClick = (user: any) => {
    if (user && typeof user === "object") {
      setSelectedUser(user)
      setShowUserDialog(true)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Users</h2>
          <Button onClick={refetch}>Retry</Button>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <p className="text-red-800 dark:text-red-200">Error loading users: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users & Phones</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, extensions, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "extension" | "name") => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="extension">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Sort by Extension
              </div>
            </SelectItem>
            <SelectItem value="name">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Sort by Name
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users grouped by site */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, siteIndex) => (
            <Card key={siteIndex}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(groupedUsers) && groupedUsers.length > 0 ? (
            groupedUsers.map(({ site, users: siteUsers }) => (
              <Card key={site}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {site}
                      {site === currentUserSite && (
                        <Badge variant="default" className="text-xs">
                          Your Site
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant="outline">
                      {Array.isArray(siteUsers) ? siteUsers.length : 0}{" "}
                      {Array.isArray(siteUsers) && siteUsers.length === 1 ? "user" : "users"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(siteUsers) && siteUsers.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {siteUsers.map((user: any, index: number) => (
                        <UserCard key={user?.id || `user-${index}`} user={user} onUserClick={handleUserClick} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No users found at this site</div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  {users.length === 0
                    ? "No users are available in your organization."
                    : "No users match your search criteria."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <UserDetailsDialog user={selectedUser} open={showUserDialog} onOpenChange={setShowUserDialog} />
    </div>
  )
}
