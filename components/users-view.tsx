"use client"

import { useState, useMemo, useEffect } from "react"
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
  RefreshCw,
  Info,
} from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
      return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
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
      return "Available"
  }
}

function UserCard({ user, onUserClick }: { user: any; onUserClick: (user: any) => void }) {
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
              <h3 className="font-medium truncate">
                {user?.name || user?.display_name || user?.email || "Unknown User"}
              </h3>
              <div className="flex items-center gap-1">
                {user?.type === "common_area" ? (
                  <Badge variant="outline" className="text-xs">
                    Common Area
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getPresenceIcon(user?.presence || "available")}
                    <span>{getPresenceText(user?.presence || "available")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Row - Extension */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Ext</span>
                <Badge variant="outline" className="text-xs">
                  {user?.extension || user?.extension_number || "N/A"}
                </Badge>
              </div>

              {/* DEBUG: Show IDs */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => e.stopPropagation()}>
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <div className="space-y-1">
                      <div>
                        <strong>ID:</strong> {user?.id || "N/A"}
                      </div>
                      <div>
                        <strong>Phone User ID:</strong> {user?.phone_user_id || "N/A"}
                      </div>
                      <div>
                        <strong>Type:</strong> {user?.type || "N/A"}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
  const [users, setUsers] = useState<any[]>([])
  const [commonAreas, setCommonAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Get current user to determine their site
  const { user: currentUser } = useCurrentUser()
  const currentUserSite = currentUser?.phone?.site_name || currentUser?.site_name || "Main Office"

  // Fetch users and common areas from cached API
  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo("Fetching data...\n")

      const refreshParam = forceRefresh ? "?refresh=true" : ""

      // Fetch both users and common areas in parallel
      const [usersResponse, commonAreasResponse] = await Promise.allSettled([
        fetch(`/api/phone/users${refreshParam}`).then((res) => res.json()),
        fetch(`/phone/common-areas${refreshParam}`).then((res) => res.json()),
      ])

      // Handle users response
      if (usersResponse.status === "fulfilled" && !usersResponse.value.error) {
        console.log("Users API response:", usersResponse.value)
        setUsers(Array.isArray(usersResponse.value.users) ? usersResponse.value.users : [])

        // Debug info
        setDebugInfo((prev) => prev + `\nUsers loaded: ${usersResponse.value.users?.length || 0}`)
        if (usersResponse.value.users && usersResponse.value.users.length > 0) {
          const firstUser = usersResponse.value.users[0]
          setDebugInfo((prev) => prev + `\nFirst user: id=${firstUser.id}, phone_user_id=${firstUser.phone_user_id}`)
        }
      } else {
        console.error("Error fetching users:", usersResponse)
        setUsers([])
        setDebugInfo((prev) => prev + `\nError fetching users: ${JSON.stringify(usersResponse)}`)
      }

      // Handle common areas response
      if (commonAreasResponse.status === "fulfilled" && !commonAreasResponse.value.error) {
        console.log("Common areas API response:", commonAreasResponse.value)
        const commonAreasData = commonAreasResponse.value.common_areas || []
        setCommonAreas(Array.isArray(commonAreasData) ? commonAreasData : [])

        // Debug info
        setDebugInfo((prev) => prev + `\nCommon areas loaded: ${commonAreasData.length}`)
        if (commonAreasData.length > 0) {
          const firstCommonArea = commonAreasData[0]
          setDebugInfo(
            (prev) => prev + `\nFirst common area: id=${firstCommonArea.id}, name=${firstCommonArea.name || "unnamed"}`,
          )
        } else {
          setDebugInfo((prev) => prev + `\nNo common areas found in response`)
        }
      } else {
        console.error("Error fetching common areas:", commonAreasResponse)
        setCommonAreas([])
        if (commonAreasResponse.status === "rejected") {
          setDebugInfo((prev) => prev + `\nCommon areas request rejected: ${commonAreasResponse.reason}`)
        } else {
          setDebugInfo((prev) => prev + `\nError fetching common areas: ${JSON.stringify(commonAreasResponse.value)}`)
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load users and phones")
      setDebugInfo((prev) => prev + `\nException: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Combine users and common areas into a single list
  const allUsers = useMemo(() => {
    setDebugInfo((prev) => prev + `\nCombining ${users.length} users and ${commonAreas.length} common areas`)

    const combined = [
      ...users.map((user) => ({
        ...user,
        type: "user",
        name: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || user.email,
        site: user.site_name || user.site || currentUserSite,
        extension: user.extension_number || user.extension,
        presence: user.presence_status || "available",
        // Store both IDs for different API calls
        user_id: user.id, // For presence API calls
        phone_user_id: user.phone_user_id || user.id, // For phone API calls
      })),
      ...commonAreas.map((area) => ({
        ...area,
        type: "common_area",
        name: area.name || area.display_name || "Common Area Phone",
        site: area.site_name || area.site || currentUserSite,
        extension: area.extension_number || area.extension,
        presence: "available", // Common areas are always available
        user_id: area.id,
        phone_user_id: area.id,
      })),
    ]

    console.log("Combined users and common areas:", combined)
    return combined
  }, [users, commonAreas, currentUserSite])

  // Group users by site with filtering and sorting
  const groupedUsers = useMemo(() => {
    try {
      console.log("=== GROUPING USERS START ===")
      console.log("All users:", allUsers)
      setDebugInfo((prev) => prev + `\nGrouping ${allUsers.length} total users`)

      // Filter by search term
      const filtered = allUsers.filter((user) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.extension && user.extension.toString().includes(searchTerm)) ||
          (user.phone_number && user.phone_number.includes(searchTerm))
        )
      })

      console.log("Filtered users:", filtered)

      // Group by site
      const grouped: { [key: string]: any[] } = {}
      filtered.forEach((user) => {
        const site = user.site || "Main Office"
        if (!grouped[site]) {
          grouped[site] = []
        }
        grouped[site].push(user)
      })

      console.log("Grouped users:", grouped)
      setDebugInfo((prev) => prev + `\nSites found: ${Object.keys(grouped).join(", ")}`)

      // Sort users within each site
      Object.keys(grouped).forEach((site) => {
        grouped[site].sort((a, b) => {
          if (sortBy === "extension") {
            const extA = Number.parseInt(a.extension) || 0
            const extB = Number.parseInt(b.extension) || 0
            return extA - extB
          } else {
            const nameA = a.name || ""
            const nameB = b.name || ""
            return nameA.localeCompare(nameB)
          }
        })
      })

      // Sort sites: current user's site first, then alphabetical
      const sortedSites = Object.keys(grouped).sort((a, b) => {
        if (a === currentUserSite) return -1
        if (b === currentUserSite) return 1
        return a.localeCompare(b)
      })

      const result = sortedSites.map((site) => ({
        site,
        users: grouped[site] || [],
      }))

      console.log("Final grouped result:", result)
      console.log("=== GROUPING USERS END ===")
      return result
    } catch (error) {
      console.error("Error grouping users:", error)
      setDebugInfo((prev) => prev + `\nError grouping users: ${error}`)
      return []
    }
  }, [allUsers, searchTerm, sortBy, currentUserSite])

  const handleUserClick = (user: any) => {
    if (user && typeof user === "object") {
      setSelectedUser(user)
      setShowUserDialog(true)
    }
  }

  const handleRefresh = () => {
    fetchData(true) // Force refresh
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Users & Phones</h2>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <p className="text-red-800 dark:text-red-200">Error loading users: {error}</p>
            <pre className="mt-4 text-xs overflow-auto max-h-40 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {debugInfo}
            </pre>
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
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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

      {/* Debug Info */}
      {process.env.NODE_ENV !== "production" && (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs">
              <p>Current User Site: {currentUserSite}</p>
              <p>
                Users: {users.length}, Common Areas: {commonAreas.length}
              </p>
              <p>Combined: {allUsers.length}</p>
              <pre className="mt-2 overflow-auto max-h-20 p-2 bg-gray-100 dark:bg-gray-800 rounded">{debugInfo}</pre>
            </div>
          </CardContent>
        </Card>
      )}

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
          {groupedUsers.length > 0 ? (
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
                      {siteUsers.length} {siteUsers.length === 1 ? "user" : "users"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {siteUsers.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {siteUsers.map((user: any, index: number) => (
                        <UserCard
                          key={user?.user_id || user?.id || `user-${index}`}
                          user={user}
                          onUserClick={handleUserClick}
                        />
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
                  {allUsers.length === 0
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
