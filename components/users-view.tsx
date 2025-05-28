"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Phone, MessageSquare, MoreHorizontal, UserPlus, Filter, Building, Users, Circle } from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"
import { useZoomUsers } from "@/hooks/use-zoom-data"

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

function getPresenceBadgeVariant(presence: string) {
  switch (presence) {
    case "available":
      return "default"
    case "busy":
      return "destructive"
    case "away":
      return "secondary"
    case "dnd":
      return "destructive"
    case "offline":
      return "outline"
    default:
      return "outline"
  }
}

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  // Use real Zoom data
  const { users, loading, error, refetch } = useZoomUsers()

  const filteredUsers = users.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.extension?.toString().includes(searchTerm) ||
      user.phone_number?.includes(searchTerm),
  )

  // Calculate stats
  const totalUsers = users.length
  const regularUsers = users.filter((u: any) => u.type === "user").length
  const commonAreaPhones = users.filter((u: any) => u.type === "common_area").length
  const availableUsers = users.filter((u: any) => u.presence === "available").length

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Users</h2>
          <Button onClick={refetch}>Retry</Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Error loading users: {error}</p>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalUsers}</div>
            <p className="text-xs text-muted-foreground">All users & phones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : regularUsers}</div>
            <p className="text-xs text-muted-foreground">Regular users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Common Areas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : commonAreaPhones}</div>
            <p className="text-xs text-muted-foreground">Shared phones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Circle className="h-4 w-4 fill-green-500 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : availableUsers}</div>
            <p className="text-xs text-muted-foreground">Ready for calls</p>
          </CardContent>
        </Card>
      </div>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users & Phones ({loading ? "..." : filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User/Phone</TableHead>
                  <TableHead>Extension</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleUserClick(user)}
                  >
                    <TableCell className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.type === "common_area" ? (
                              <Building className="h-4 w-4" />
                            ) : (
                              user.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2) || "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {user.presence && (
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getPresenceColor(user.presence)}`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.extension}</Badge>
                    </TableCell>
                    <TableCell>{user.phone_number || "Not assigned"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status || "Unknown"}
                        </Badge>
                        {user.presence && user.presence !== "unknown" && (
                          <Badge variant={getPresenceBadgeVariant(user.presence)} className="text-xs">
                            {user.presence}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.site}</TableCell>
                    <TableCell>
                      <Badge variant={user.type === "user" ? "default" : "secondary"}>
                        {user.type === "user" ? "User" : "Common Area"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </DropdownMenuItem>
                          {user.type === "user" && (
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserDetailsDialog user={selectedUser} open={showUserDialog} onOpenChange={setShowUserDialog} />
    </div>
  )
}
